import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Link,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import logo from './assets/logo.png';

import saveBlob from "./save-blob.ts";
import {useCallback, useEffect, useState} from "react";
import {
    type DownloadFilesContext,
    fillDeclaration,
    fillGdprDeclaration,
    fillParentalConsentForm
} from "./fill-documents.ts";
import useStorageValue from "./useStorageValue.ts";
import useIsMobile from "./hooks/useIsMobile.ts";

function Logo() {
    return <img src={logo} alt="Logo" style={{width: 'clamp(2rem, 100%, 15rem)'}}/>
}

function Summary({downloadFiles}: Readonly<{ downloadFiles: () => void }>) {
    return <Stack spacing={2} style={{height: '100%'}}>
        <Typography variant='h4'>Gratulacje!</Typography>
        <Typography variant='body1'>
            Pliki za chwilę zostaną pobrane.
        </Typography>
        <Link variant='body2' onClick={downloadFiles} style={{cursor: 'pointer'}}>Spróbuj ponownie</Link>
    </Stack>;
}

function ErrorDialog({open, isMobile, errorString, close}: Readonly<{
    open: boolean,
    isMobile: boolean,
    close: () => void,
    errorString: string
}>) {
    return <Dialog open={open} fullScreen={isMobile} fullWidth={true}>
        {open && <>
            <DialogTitle>Błąd podczas generowania dokumentów</DialogTitle>
            <DialogContent>
                <Paper variant='outlined' style={{padding: '1rem', marginBottom: '1rem'}}>
                    <Typography variant='caption' style={{whiteSpace: "pre-wrap"}}>{errorString}</Typography>
                </Paper>
                <Typography variant='body2'>
                    Zachęcamy do zgłoszenia błędu na&nbsp;
                    <a href='https://github.com/Mlodzi-Razem/mr-membership-declaration-generator/issues' target='_blank'>
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

export default function DownloadFilesView({context}: Readonly<{ context: DownloadFilesContext }>) {
    const [storageValue, setStorageValue] = useStorageValue('downloadedAlready', {downloadedAlready: false}); // to preserve the value even if the component gets remounted elsewhere (ex. during window resize)
    const [downloadFilesError, setDownloadFilesError] = useState<unknown>(null);

    const downloadFiles = useCallback(async () => {
        try {
            if (!storageValue.downloadedAlready) {
                setStorageValue({downloadedAlready: true});
            }

            const declaration = await fillDeclaration(context);
            const gdprDeclaration = await fillGdprDeclaration(context);

            saveBlob(declaration, 'MR-Deklaracja.pdf');
            saveBlob(gdprDeclaration, 'MR-Deklaracja-RODO.pdf');

            if (context.peselOutput.requiresParentalConsent) {
                const parentalConsent = await fillParentalConsentForm(context);
                saveBlob(parentalConsent, 'MR-Zgoda-rodzica.pdf');
            }
        } catch (e) {
            setDownloadFilesError(e);
        }
    }, [context, setStorageValue, storageValue.downloadedAlready, setDownloadFilesError]);


    useEffect(() => {
        if (storageValue.downloadedAlready) return;

        downloadFiles();
    }, [storageValue.downloadedAlready, downloadFiles]);

    const isMobile = useIsMobile();

    const downloadErrorObject = (!!downloadFilesError && downloadFilesError instanceof Error)
        ? {
            name: downloadFilesError.name,
            message: downloadFilesError.message,
            stack: downloadFilesError.stack
        }
        : downloadFilesError;

    const errorString = JSON.stringify(downloadErrorObject, null, 2);

    return <>
        {isMobile ? <Stack spacing={2} alignItems='center' style={{height: '100%'}}>
            <Summary downloadFiles={downloadFiles}/>
            <Logo/>
        </Stack> : <Grid container spacing={2} alignItems='center' style={{height: '100%'}}>
            <Grid size={6}>
                <Summary downloadFiles={downloadFiles}/>
            </Grid>
            <Grid size={6}>
                <Logo/>
            </Grid>
        </Grid>}
        <ErrorDialog open={!!downloadFilesError}
                     isMobile={isMobile}
                     close={() => setDownloadFilesError(null)}
                     errorString={errorString}/>
    </>
        ;
}