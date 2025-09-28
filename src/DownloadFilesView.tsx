import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Paper,
    Stack,
    SvgIcon,
    type SvgIconProps,
    Typography
} from "@mui/material";

import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import DescriptionIconOutlined from '@mui/icons-material/DescriptionOutlined';
import LockIconOutlined from '@mui/icons-material/LockOutlined';

import saveBlob from "./save-blob.ts";
import * as React from "react";
import {memo, useCallback, useState} from "react";
import {
    type DownloadFilesContext,
    fillDeclaration,
    fillGdprDeclaration,
    fillParentalConsentForm
} from "./fill-documents.ts";
import useIsMobile from "./hooks/useIsMobile.ts";

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

    return <>
        <Paper variant='outlined' style={{width: '100%', height: '100%', padding: '1rem', maxWidth: '20rem'}}>
            <div style={{
                display: 'grid',
                gridTemplateRows: 'auto auto 1fr auto',
                gap: '1rem',
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
    </>;
}

function Summary({downloadDeclaration, downloadParentalConsent, downloadGdprDeclaration, isMobile}: Readonly<{
    downloadDeclaration: () => Promise<void>,
    downloadParentalConsent?: () => Promise<void>,
    downloadGdprDeclaration: () => Promise<void>,
    isMobile: boolean
}>) {


    return <Stack justifyContent='center' style={{width: '100%', height: '100%'}}>
        <Stack spacing={2} alignItems='center' style={{width: '100%'}}>
            <Typography variant='h6'>Pobierz pliki</Typography>
            <Grid container spacing={2} justifyContent='center' style={{height: '100%', width: '100%'}}>
                <Grid size={isMobile ? 12 : 4} justifyItems='center'>
                    <SummaryTile title='Deklaracja członkowska'
                                 icon={<DescriptionIconOutlined/>}
                                 download={downloadDeclaration}
                                 isMobile={isMobile}/>
                </Grid>
                <Grid size={isMobile ? 12 : 4} justifyItems='center'>
                    <SummaryTile title='Deklaracja RODO'
                                 icon={<LockIconOutlined/>}
                                 download={downloadGdprDeclaration}
                                 isMobile={isMobile}/>
                </Grid>
                {downloadParentalConsent && <Grid size={isMobile ? 12 : 4} justifyItems='center'>
                    <SummaryTile title='Zgoda rodzica/opiekuna'
                                 icon={<SupervisedUserCircleOutlinedIcon/>}
                                 download={downloadParentalConsent}
                                 isMobile={isMobile}/>
                </Grid>}
            </Grid>
        </Stack>
    </Stack>;
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
                <Typography variant='body2'>
                    Zachęcamy do zgłoszenia błędu na&nbsp;
                    <a href='https://github.com/Mlodzi-Razem/mr-membership-declaration-generator/issues'
                       target='_blank'>
                        naszym GitHubie
                    </a>.
                </Typography>
                <DialogActions>
                    <Button onClick={close}>Zamknij</Button>
                </DialogActions>
            </DialogContent>
        </>}
    </Dialog>;
}

function useDownloadMethod(context: DownloadFilesContext, fileName: string, fillMethod: (context: DownloadFilesContext) => Promise<Blob>) {
    return useCallback(async () => {
        const blob = await fillMethod(context);
        saveBlob(blob, fileName);
    }, [context, fileName, fillMethod]);
}

export default function DownloadFilesView({context}: Readonly<{ context: DownloadFilesContext }>) {
    const isMobile = useIsMobile();

    const downloadDeclaration = useDownloadMethod(context, 'MR-Deklaracja-czlonkowska.pdf', fillDeclaration);
    const downloadGdprDeclaration = useDownloadMethod(context, 'MR-Deklaracja-RODO.pdf', fillGdprDeclaration);
    const parentalConsentDownloadCallback = useDownloadMethod(context, 'MR-Zgoda-rodzica.pdf', fillParentalConsentForm);

    const downloadParentalConsent = context.peselOutput.requiresParentalConsent ? parentalConsentDownloadCallback : undefined;

    return <Summary downloadDeclaration={downloadDeclaration}
                    downloadGdprDeclaration={downloadGdprDeclaration}
                    downloadParentalConsent={downloadParentalConsent}
                    isMobile={isMobile}/>
}