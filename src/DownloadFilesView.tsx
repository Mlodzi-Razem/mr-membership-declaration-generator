import type {PeselFormOutput} from "./forms/PeselForm.tsx";
import type {ContactFormOutput} from "./forms/ContactForm.tsx";
import type {AddressFormOutput} from "./forms/AddressForm.tsx";
import type {GdprConsentFormOutput} from "./forms/GdprConsentForm.tsx";
import {Link, Stack, Typography} from "@mui/material";

import declarationBase64 from './assets/membership-declaration.pdf?base64';
import gdprDeclarationBase64 from './assets/gdpr-declaration.pdf?base64';
import parentalConsentBase64 from './assets/parental-consent-form.pdf?base64';

import fillPdf, {type FieldName, type FieldValue} from "./fill-pdf.ts";
import saveBlob from "./save-blob.ts";
import {useCallback, useEffect, useState} from "react";

export interface DownloadFilesContext {
    peselOutput: PeselFormOutput,
    contactOutput: ContactFormOutput,
    addressOutput: AddressFormOutput,
    gdprFormOutput: GdprConsentFormOutput
}

function fillDeclaration(context: DownloadFilesContext): Promise<Blob> {
    const peselFields = context.peselOutput.pesel.map((field, index) => [`PESEL_${index}`, field] as const);
    const districtFields = [
        ['SEJM_0', context.addressOutput.district.at(0)!],
        ['SEJM_1', context.addressOutput.district.at(1)!]
    ] as const;
    const address = `${context.addressOutput.street} ${context.addressOutput.buildingNumber}` + (context.addressOutput.apartmentNumber ? `/${context.addressOutput.apartmentNumber}` : '');

    return fillPdf(declarationBase64, new Map<FieldName, FieldValue>([
        ['Imie_Imiona_urzad', context.contactOutput.formalName],
        ['Nazwisko', context.contactOutput.formalLastName],
        ['Imie_Imiona_preferowane', context.contactOutput.preferredName],
        ['Nazwisko_preferowane', context.contactOutput.preferredLastName],
        ...peselFields,
        ['Zaimki', context.contactOutput.pronouns],
        ['Numer_telefonu', context.contactOutput.phoneNumber],
        ['Adres_e_mail', context.contactOutput.email],
        ['Wojewodztwo', context.addressOutput.voivodeship],
        ...districtFields,
        ['Uczelnia_Szkola', context.addressOutput.school],
        ['Kod_pocztowy', context.addressOutput.postalCode],
        ['Miejscowosc', context.addressOutput.city],
        ['Powiat', context.addressOutput.province],
        ['Ulica_i_numer', address],
        ['Check_rodo', true],
        ['Check_zgoda_rodzica', context.peselOutput.requiresParentalConsent]
    ]));
}

function fillGdprDeclaration(context: DownloadFilesContext): Promise<Blob> {
    if (context.peselOutput.requiresParentalConsent) {
        return fillPdf(gdprDeclarationBase64, new Map<FieldName, FieldValue>([
            ['Imie_nazwisko_rodzica', context.gdprFormOutput.parentName],
            ['Imie_nazwisko_dziecka', context.contactOutput.formalName + ' ' + context.contactOutput.formalLastName],
            ['Niepelnoletni_wizerunek_check', context.gdprFormOutput.publishingImageConsent],
            ['Niepelnoletni_rodo_check', context.gdprFormOutput.processingDataConsent]
        ]));
    } else {
        return fillPdf(gdprDeclarationBase64, new Map<FieldName, FieldValue>([
            ['Imie_nazwisko', context.contactOutput.formalName + ' ' + context.contactOutput.formalLastName],
            ['Pelnoletni_wizerunek_check', context.gdprFormOutput.publishingImageConsent],
            ['Pelnoletni_rodo_check', context.gdprFormOutput.processingDataConsent]
        ]));
    }
}

function fillParentalConsentForm(context: DownloadFilesContext): Promise<Blob> {
    return fillPdf(parentalConsentBase64, new Map<FieldName, FieldValue>([
            ['Dane_dziecka', context.contactOutput.formalName + ' ' + context.contactOutput.formalLastName]
        ]
    ));
}

export default function DownloadFilesView({context}: Readonly<{ context: DownloadFilesContext }>) {
    const [alreadyDownloaded, setAlreadyDownloaded] = useState(false);

    const downloadFiles = useCallback(async () => {
        const declaration = await fillDeclaration(context);
        const gdprDeclaration = await fillGdprDeclaration(context);

        saveBlob(declaration, 'MR-Deklaracja.pdf');
        saveBlob(gdprDeclaration, 'MR-Deklaracja-RODO.pdf');

        if (context.peselOutput.requiresParentalConsent) {
            const parentalConsent = await fillParentalConsentForm(context);
            saveBlob(parentalConsent, 'MR-Zgoda-rodzica.pdf');
        }

        setAlreadyDownloaded(true);
    }, [context, setAlreadyDownloaded]);

    useEffect(() => {
        if (alreadyDownloaded) return;

        downloadFiles();
    }, [alreadyDownloaded, downloadFiles])

    return <Stack spacing={2}>
        <Typography variant='h4'>Gratulacje!</Typography>
        <Typography variant='body1'>
            Pliki za chwilę zostaną pobrane.
        </Typography>
        <Link variant='body2' onClick={downloadFiles} style={{cursor: 'pointer'}}>Spróbuj ponownie</Link>
    </Stack>;
}