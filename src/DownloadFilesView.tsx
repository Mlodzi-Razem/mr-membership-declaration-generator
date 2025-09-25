import {Link, Stack, Typography} from "@mui/material";


import saveBlob from "./save-blob.ts";
import {useCallback, useEffect} from "react";
import {
    type DownloadFilesContext,
    fillDeclaration,
    fillGdprDeclaration,
    fillParentalConsentForm
} from "./fill-documents.ts";
import useStorageValue from "./useStorageValue.ts";

export default function DownloadFilesView({context}: Readonly<{ context: DownloadFilesContext }>) {
    const [storageValue, setStorageValue] = useStorageValue('downloadedAlready', {downloadedAlready: false}); // to preserve the value even if the component gets remounted elsewhere (ex. during window resize)

    const downloadFiles = useCallback(async () => {
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
    }, [context, setStorageValue]);


    useEffect(() => {
        if (storageValue.downloadedAlready) return;

        downloadFiles();
    }, [storageValue.downloadedAlready, downloadFiles])

    return <Stack spacing={2}>
        <Typography variant='h4'>Gratulacje!</Typography>
        <Typography variant='body1'>
            Pliki za chwilę zostaną pobrane.
        </Typography>
        <Link variant='body2' onClick={downloadFiles} style={{cursor: 'pointer'}}>Spróbuj ponownie</Link>
    </Stack>;
}