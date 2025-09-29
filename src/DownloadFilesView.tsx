import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Link,
    Paper,
    Stack,
    SvgIcon,
    type SvgIconProps,
    Typography,
    useTheme
} from "@mui/material";

import styles from "./DownloadFilesView.module.less";

import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import DescriptionIconOutlined from '@mui/icons-material/DescriptionOutlined';
import LockIconOutlined from '@mui/icons-material/LockOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import saveBlob from "./save-blob.ts";
import * as React from "react";
import {memo, useCallback, useMemo, useState} from "react";
import useFillDocumentsFunctions, {type DownloadFilesContext} from "./hooks/useFillDocumentsFunctions.tsx";
import useIsMobile from "./hooks/useIsMobile.ts";
import FullContainerSpinner from "./FullContainerSpinner.tsx";
import {findBoardMail, type Voivodeship} from "./forms/voivodeships.tsx";
import MrBottomNavigationView from "./MrBottomNavigationView.tsx";

function stringifyError(downloadFileError: unknown) {
    if (!downloadFileError) {
        return '';
    }

    const downloadErrorObject = (!!downloadFileError && downloadFileError instanceof Error)
        ? {
            name: downloadFileError.name,
            message: downloadFileError.message,
            stack: downloadFileError.stack
        }
        : downloadFileError;
    return JSON.stringify(downloadErrorObject, null, 2);
}

type MuiColor = 'success' | 'error' | 'primary';

const SummaryIcon = memo(({icon, color}: Readonly<{
    icon: React.ReactElement<SvgIconProps, typeof SvgIcon>,
    color: MuiColor
}>) => {
    return React.cloneElement(icon, {color: color})
});

const SummaryButton = memo(({downloadFileError, fileDownloaded, downloadCallback, color}: Readonly<{
    downloadFileError: boolean,
    fileDownloaded: boolean,
    downloadCallback: () => void,
    color: MuiColor,
}>) => {
    const text = fileDownloaded ? 'Pobierz ponownie' : downloadFileError ? 'Spróbuj ponownie' : 'Pobierz';

    return <Button variant='outlined'
                   style={{width: '100%'}}
                   color={color}
                   onClick={downloadCallback}>{text}</Button>;
});

function SummaryTile({title, icon, download, isMobile}: Readonly<{
    title: string,
    icon: React.ReactElement<SvgIconProps, typeof SvgIcon>,
    download: () => Promise<void>,
    isMobile: boolean
}>) {
    const [downloadFileError, setDownloadFileError] = useState<unknown>();
    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [fileDownloaded, setFileDownloaded] = useState(false);

    const errorString = stringifyError(downloadFileError);

    const downloadCallback = useCallback(async () => {
        try {
            await download();
            setFileDownloaded(true);
            setErrorDialogOpen(false);
            setDownloadFileError(null);
        } catch (e) {
            setFileDownloaded(false);
            setErrorDialogOpen(true);
            setDownloadFileError(e);
        }
    }, [download, setFileDownloaded, setDownloadFileError, setErrorDialogOpen]);

    const color: MuiColor = downloadFileError ? 'error' : fileDownloaded ? 'success' : 'primary';

    return <div className={styles.summaryTileContainer}>
        <Paper variant='outlined' className={styles.summaryTilePaper}>
            <div className={styles.summaryTileGrid}>
                <SummaryIcon icon={icon} color={color}/>
                <div className={styles.summaryTileTitleContainer}>
                    <Typography variant='overline'>{title}</Typography>
                </div>
                <div/>
                <div className={styles.summaryTileButtonContainer}>
                    <SummaryButton downloadFileError={!!downloadFileError}
                                   fileDownloaded={fileDownloaded}
                                   downloadCallback={downloadCallback}
                                   color={color}/>
                </div>
            </div>
        </Paper>

        <ErrorDialog open={errorDialogOpen}
                     fullscreen={isMobile}
                     close={() => setErrorDialogOpen(false)}
                     errorString={errorString}/>
    </div>;
}

const useSigningInstructionsItems = (mainEmail: string, boardEmail: string, pzSignerLink: string) => {
    return useMemo(() => [{
        label: 'Podpisywanie odręczne',
        content: <ul>
            <li>Pobierz <b>wszystkie</b> dokumenty.</li>
            <li>Wydrukuj pobrane dokumenty.</li>
            <li>
                Podpisz wydrukowne dokumenty w oznaczonych miejsach. Wypełnij też pole{' '}
                <Typography variant='button'>Miejscowość i data wypełnienia</Typography>{' '}
                w prawym górnym rogu.
            </li>
            <li>
                Zeskanuj lub sfotografuj <b>wszystkie</b> podpisane dokumenty.
                Nie pomiń <b>żadnej</b> strony.
            </li>
            <li>
                Prześlij skany na <Link href={`mailto:${mainEmail}`}>{mainEmail}</Link> oraz na{' '}
                <Link href={`mailto:${boardEmail}`}>{boardEmail}</Link>.
            </li>
        </ul>
    } as const,
        {
            label: 'Podpisywanie elektroniczne',
            content: <ul>
                <li>Pobierz <b>wszystkie</b> dokumenty.</li>
                <li>Wejdź na <Link href={pzSignerLink}>{pzSignerLink}</Link>.
                </li>
                <li>
                    Postępuj zgodnie z instrukcjami. Powtórz proces <b>dla każdego pliku</b>.
                </li>
                <li>
                    Pliki zwrócone przez aplikację prześlij na <Link
                    href={`mailto:${mainEmail}`}>{mainEmail}</Link>{' '}
                    oraz na <Link href={`mailto:${boardEmail}`}>{boardEmail}</Link>.
                </li>
            </ul>
        } as const
    ] as const, [mainEmail, boardEmail, pzSignerLink]);
};

const PZ_SIGNER_URL = 'https://moj.gov.pl/nforms/signer/upload?xFormsAppName=SIGNER';
const MAIN_EMAIL = 'deklaracje@mlodzirazem.org';

const SigningInstructions = ({voivodeship}: Readonly<{ voivodeship: Voivodeship }>) => {
    const boardEmail = findBoardMail(voivodeship) ?? 'email Zarządu Okręgu';
    const {palette: {divider: borderColor}} = useTheme();

    const accordionItems = useSigningInstructionsItems(MAIN_EMAIL, boardEmail, PZ_SIGNER_URL);

    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    return <div className={styles.signingInstructionsContainer} style={{border: `1px solid ${borderColor}`}}>
        {accordionItems.map((item, index) =>
            <Accordion key={item.label}
                       elevation={0}
                       disableGutters={true}
                       expanded={expandedIndex === index}
                       onChange={(_, isExpanded) => setExpandedIndex(isExpanded ? index : null)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                    <Typography variant='overline'>{item.label}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {item.content}
                </AccordionDetails>
            </Accordion>)}
    </div>;
};

const Summary = memo((
    {
        downloadDeclaration,
        downloadParentalConsent,
        downloadGdprDeclaration,
        isMobile,
        voivodeship
    }: Readonly<{
        downloadDeclaration: () => Promise<void>,
        downloadParentalConsent?: () => Promise<void>,
        downloadGdprDeclaration: () => Promise<void>,
        isMobile: boolean,
        voivodeship: Voivodeship
    }>) => {

    return <Stack spacing={2} alignItems='center' style={{width: '100%', height: '100%'}}>
        <Typography variant='h6'>Pobierz pliki</Typography>
        <div className={styles.summaryContainer}>
            <SummaryTile title='Deklaracja członkowska'
                         icon={<DescriptionIconOutlined/>}
                         download={downloadDeclaration}
                         isMobile={isMobile}/>
            <SummaryTile title='Deklaracja RODO'
                         icon={<LockIconOutlined/>}
                         download={downloadGdprDeclaration}
                         isMobile={isMobile}/>
            {downloadParentalConsent &&
                <SummaryTile title='Zgoda rodzica/opiekuna'
                             icon={<SupervisedUserCircleOutlinedIcon/>}
                             download={downloadParentalConsent}
                             isMobile={isMobile}/>}
        </div>

        <SigningInstructions voivodeship={voivodeship}/>
    </Stack>;
});

const ReportErrorPrompt = memo(() =>
    <Typography variant='body2'>
        Zachęcamy do zgłoszenia błędu na{' '}
        <Link href='https://github.com/Mlodzi-Razem/mr-membership-declaration-generator/issues' target='_blank'>
            naszym GitHubie
        </Link>.
    </Typography>
);

const ErrorDialog = memo(({open, fullscreen, errorString, close}: Readonly<{
    open: boolean,
    fullscreen: boolean,
    close: () => void,
    errorString: string
}>) => {
    return <Dialog open={open} fullScreen={fullscreen} fullWidth={true}>
        {open && <>
            <DialogTitle>Błąd podczas generowania dokumentów</DialogTitle>
            <DialogContent>
                <Paper variant='outlined' style={{padding: '1rem', marginBottom: '1rem'}}>
                    <Typography variant='caption' style={{whiteSpace: "pre-wrap"}}>{errorString}</Typography>
                </Paper>
                <ReportErrorPrompt/>
                <DialogActions>
                    <Button onClick={close}>Zamknij</Button>
                </DialogActions>
            </DialogContent>
        </>}
    </Dialog>;
});

function useDownloadMethod(context: DownloadFilesContext, fileName: string, fillMethod?: (context: DownloadFilesContext) => Promise<Blob>) {
    return useCallback(async () => {
        if (!fillMethod) {
            throw new Error('No fillMethod provided');
        }

        const blob = await fillMethod(context);
        saveBlob(blob, fileName);
    }, [context, fileName, fillMethod]);
}

const PageError = memo(({errors}: Readonly<{ errors: unknown[] }>) => {
    return <Stack spacing={2} justifyContent='center' style={{width: '100%', height: '100%'}}>
        <Typography variant='h4'>Wystąpił błąd podczas pobierania plików</Typography>
        <Typography variant='body1'>Spróbuj ponownie później.</Typography>

        {errors.map((error, index) => <Typography key={String(error) + index} variant='caption'>
            <Paper style={{width: '100%', padding: '1rem'}} variant='outlined'>
                <div style={{width: '100%', whiteSpace: 'pre-wrap'}}>
                    {stringifyError(error)}
                </div>
            </Paper>
        </Typography>)}
        <ReportErrorPrompt/>
    </Stack>
});

export default function DownloadFilesView({context, onBack, activeStep}: Readonly<{
    context: DownloadFilesContext,
    onBack: () => void,
    activeStep: number,
}>) {
    const isMobile = useIsMobile();

    const fillFunctions = useFillDocumentsFunctions();
    const fill = 'fill' in fillFunctions ? fillFunctions.fill : undefined;

    const downloadDeclaration = useDownloadMethod(context, 'MR-Deklaracja-czlonkowska.pdf', fill?.membershipPdf);
    const downloadGdprDeclaration = useDownloadMethod(context, 'MR-Deklaracja-RODO.pdf', fill?.gdprPdf);
    const parentalConsentDownloadCallback = useDownloadMethod(context, 'MR-Zgoda-rodzica.pdf', fill?.parentalConsentPdf);

    if (fillFunctions.isLoading) {
        return <FullContainerSpinner label='Pobieranie plików deklaracji'/>
    }

    if (fillFunctions.isError) {
        return <PageError errors={fillFunctions.errors ?? []}/>
    }

    const downloadParentalConsent = context.peselOutput.requiresParentalConsent ? parentalConsentDownloadCallback : undefined;

    return <MrBottomNavigationView activeStep={activeStep}
                                   onBack={onBack}
                                   isMobile={isMobile}
                                   nextButtonEnabled={false}>
        <div className={styles.container}>
            <Summary downloadDeclaration={downloadDeclaration}
                     downloadGdprDeclaration={downloadGdprDeclaration}
                     downloadParentalConsent={downloadParentalConsent}
                     isMobile={isMobile}
                     voivodeship={context.addressOutput.voivodeship}/>
        </div>
    </MrBottomNavigationView>;
}