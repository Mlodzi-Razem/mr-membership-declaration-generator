import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    SvgIcon,
    type SvgIconProps,
    Typography,
    useTheme
} from "@mui/material";

import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import DescriptionIconOutlined from '@mui/icons-material/DescriptionOutlined';
import LockIconOutlined from '@mui/icons-material/LockOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import saveBlob from "./save-blob.ts";
import * as React from "react";
import {memo, useCallback, useState} from "react";
import useFillDocumentsFunctions, {type DownloadFilesContext} from "./hooks/useFillDocumentsFunctions.tsx";
import useIsMobile from "./hooks/useIsMobile.ts";
import FullContainerSpinner from "./FullContainerSpinner.tsx";
import {findBoardMail, type Voivodeship} from "./forms/voivodeships.tsx";

function stringifyError(downloadFileError: unknown) {
    const downloadErrorObject = (!!downloadFileError && downloadFileError instanceof Error)
        ? {
            name: downloadFileError.name,
            message: downloadFileError.message,
            stack: downloadFileError.stack
        }
        : downloadFileError;
    return JSON.stringify(downloadErrorObject, null, 2);
}

const SummaryIcon = memo(({icon, downloaded, hasError}: Readonly<{
    icon: React.ReactElement<SvgIconProps, typeof SvgIcon>,
    downloaded: boolean,
    hasError: boolean
}>) => {
    if (hasError) {
        return React.cloneElement(icon, {color: 'error'})
    }

    if (downloaded) {
        return React.cloneElement(icon, {color: 'success'})
    }

    return icon;
});

const SummaryButton = memo(({downloadFileError, fileDownloaded, downloadCallback}: Readonly<{
    downloadFileError: boolean,
    fileDownloaded: boolean,
    downloadCallback: () => void
}>) => {
    if (downloadFileError) return <Button variant='outlined'
                                          style={{width: '100%'}}
                                          color='error'
                                          onClick={downloadCallback}>Spróbuj ponownie</Button>;

    if (fileDownloaded) return <Button variant='outlined'
                                       style={{width: '100%'}}
                                       color='success'
                                       onClick={downloadCallback}>Pobierz ponownie</Button>;


    return <Button variant='outlined'
                   style={{width: '100%'}}
                   color='primary'
                   onClick={downloadCallback}>Pobierz</Button>;
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

    return <div style={{flex: 1}}>
        <Paper variant='outlined' style={{width: '100%', height: '100%', padding: '1rem'}}>
            <div style={{
                display: 'grid',
                gridTemplateRows: 'auto auto 1fr auto',
                gap: '0.25rem',
                justifyItems: 'center',
                alignItems: 'start',
                width: '100%',
                height: '100%'
            }}>
                <SummaryIcon icon={icon} downloaded={fileDownloaded} hasError={!!downloadFileError}/>
                <div style={{textAlign: "center", width: '100%'}}>
                    <Typography variant='overline'>{title}</Typography>
                </div>
                <div/>
                <div style={{width: '100%', height: '100%', alignSelf: 'end', justifySelf: 'end'}}>
                    <SummaryButton downloadFileError={!!downloadFileError}
                                   fileDownloaded={fileDownloaded}
                                   downloadCallback={downloadCallback}/>
                </div>
            </div>
        </Paper>

        <ErrorDialog open={errorDialogOpen}
                     fullscreen={isMobile}
                     close={() => setErrorDialogOpen(false)}
                     errorString={errorString}/>
    </div>;
}

function SigningInstructions({voivodeship}: Readonly<{ voivodeship: Voivodeship }>) {
    const mainEmail = 'deklaracje@mlodzirazem.org';
    const boardEmail = findBoardMail(voivodeship);
    const pzSignerLink = 'https://moj.gov.pl/nforms/signer/upload?xFormsAppName=SIGNER';
    const {palette: {divider: borderColor}} = useTheme();

    const accordionItems = [
        {
            label: 'Podpisywanie odręczne',
            content: <ul style={{margin: 0}}>
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
                    Prześlij skany na <a href={`mailto:${mainEmail}`}>{mainEmail}</a> oraz na{' '}
                    <a href={`mailto:${boardEmail}`}>{boardEmail}</a>.
                </li>
            </ul>
        } as const,
        {
            label: 'Podpisywanie elektroniczne',
            content: <ul style={{margin: 0}}>
                <li>Pobierz <b>wszystkie</b> dokumenty.</li>
                <li>Wejdź na stronę <a href={pzSignerLink}>{pzSignerLink}</a>.
                </li>
                <li>
                    Postępuj zgodnie z instrukcjami. Powtórz proces <b>dla każdego pliku</b>.
                </li>
                <li>
                    Pliki zwrócone przez aplikację prześlij na <a href={`mailto:${mainEmail}`}>{mainEmail}</a>{' '}
                    oraz na <a href={`mailto:${boardEmail}`}>{boardEmail}</a>.
                </li>
            </ul>
        } as const
    ] as const;

    return <div style={{
        width: '100%',
        border: `1px solid ${borderColor}`,
        borderRadius: '0.25rem',
        padding: '0.25rem'
    }}>
        {accordionItems.map(item =>
            <Accordion key={item.label}
                       elevation={0}
                       disableGutters={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                    <Typography variant='overline'>{item.label}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {item.content}
                </AccordionDetails>
            </Accordion>)}
    </div>;
}

function Summary(
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
    }>) {

    return <Stack spacing={2} alignItems='center' style={{width: '100%', height: '100%'}}>
        <Typography variant='h6'>Pobierz pliki</Typography>
        <div style={{width: '100%', display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
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
        <div style={{width: '100%'}}>
            <SigningInstructions voivodeship={voivodeship}/>
        </div>
    </Stack>;
}

function ReportErrorPrompt() {
    return <Typography variant='body2'>
        Zachęcamy do zgłoszenia błędu na{' '}
        <a href='https://github.com/Mlodzi-Razem/mr-membership-declaration-generator/issues' target='_blank'>
            naszym GitHubie
        </a>.
    </Typography>;
}

function ErrorDialog({open, fullscreen, errorString, close}: Readonly<{
    open: boolean,
    fullscreen: boolean,
    close: () => void,
    errorString: string
}>) {
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
}

function useDownloadMethod(context: DownloadFilesContext, fileName: string, fillMethod?: (context: DownloadFilesContext) => Promise<Blob>) {
    return useCallback(async () => {
        if (!fillMethod) {
            throw new Error('No fillMethod provided');
        }

        const blob = await fillMethod(context);
        saveBlob(blob, fileName);
    }, [context, fileName, fillMethod]);
}

function PageError({errors}: Readonly<{ errors: unknown[] }>) {
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
}

export default function DownloadFilesView({context}: Readonly<{ context: DownloadFilesContext }>) {
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

    return <Summary downloadDeclaration={downloadDeclaration}
                    downloadGdprDeclaration={downloadGdprDeclaration}
                    downloadParentalConsent={downloadParentalConsent}
                    isMobile={isMobile}
                    voivodeship={context.addressOutput.voivodeship}/>
}