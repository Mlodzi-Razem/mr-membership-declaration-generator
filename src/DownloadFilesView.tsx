import {Link, Stack, Typography} from "@mui/material";


import saveBlob from "./save-blob.ts";
import {useCallback, useEffect, useState} from "react";
import {
    type DownloadFilesContext,
    fillDeclaration,
    fillGdprDeclaration,
    fillParentalConsentForm
} from "./fill-documents.ts";

export default function DownloadFilesView({context}: Readonly<{ context: DownloadFilesContext }>) {
    const [downloadedAlready, setDownloadedAlready] = useState(false);

    const downloadFiles = useCallback(async () => {
        setDownloadedAlready(true);

        const declaration = await fillDeclaration(context);
        const gdprDeclaration = await fillGdprDeclaration(context);

        saveBlob(declaration, 'MR-Deklaracja.pdf');
        saveBlob(gdprDeclaration, 'MR-Deklaracja-RODO.pdf');

        if (context.peselOutput.requiresParentalConsent) {
            const parentalConsent = await fillParentalConsentForm(context);
            saveBlob(parentalConsent, 'MR-Zgoda-rodzica.pdf');
        }
    }, [context, setDownloadedAlready]);


    useEffect(() => {
        if (downloadedAlready) return;

        downloadFiles();
    }, [downloadedAlready, downloadFiles])

    return <Stack spacing={2}>
        <Typography variant='h4'>Gratulacje!</Typography>
        <Typography variant='body1'>
            Pliki za chwilę zostaną pobrane.
        </Typography>
        <Link variant='body2' onClick={downloadFiles} style={{cursor: 'pointer'}}>Spróbuj ponownie</Link>
    </Stack>;
}