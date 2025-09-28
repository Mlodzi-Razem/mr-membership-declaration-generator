import type {PeselFormOutput} from "../forms/PeselForm.tsx";
import type {ContactFormOutput} from "../forms/ContactForm.tsx";
import type {AddressFormOutput} from "../forms/AddressForm.tsx";
import type {GdprConsentFormOutput} from "../forms/GdprConsentForm.tsx";
import fillPdf, {type FieldName, type FieldValue, type PdfData} from "../fill-pdf.ts";
import {type QueriesOptions, useQueries, useQuery} from "@tanstack/react-query";
import {Duration} from "luxon";

const PDF_GDPR = 'gdpr-declaration.pdf' as const;
const PDF_MEMBERSHIP = 'membership-declaration.pdf' as const;
const PDF_PARENTAL_CONSENT = 'parental-consent-form.pdf' as const;
const ALL_PDFS = [PDF_GDPR, PDF_MEMBERSHIP, PDF_PARENTAL_CONSENT] as const;
const ALL_PDFS_INDEXES = Object.fromEntries(
    ALL_PDFS.map((pdfName, index) => ([pdfName, index] as const))
);

export interface DownloadFilesContext {
    peselOutput: PeselFormOutput,
    contactOutput: ContactFormOutput,
    addressOutput: AddressFormOutput,
    gdprFormOutput: GdprConsentFormOutput
}

function fillDeclaration(data: PdfData, helveticaBytes: Uint8Array, context: DownloadFilesContext): Promise<Blob> {
    const peselFields = context.peselOutput.pesel.map((field, index) => [`PESEL_${index}`, field] as const);
    const districtFields = context.addressOutput.district.length == 2 ? [
        ['SEJM_0', context.addressOutput.district[0]],
        ['SEJM_1', context.addressOutput.district[1]]
    ] as const : [
        ['SEJM_0', '0'],
        ['SEJM_1', context.addressOutput.district[0]]
    ] as const;
    const address = `${context.addressOutput.street} ${context.addressOutput.buildingNumber}` + (context.addressOutput.apartmentNumber ? `/${context.addressOutput.apartmentNumber}` : '');

    return fillPdf(data, helveticaBytes, new Map<FieldName, FieldValue>([
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

function fillGdprDeclaration(data: PdfData, helveticaBytes: Uint8Array, context: DownloadFilesContext): Promise<Blob> {
    if (context.peselOutput.requiresParentalConsent) {
        return fillPdf(data, helveticaBytes, new Map<FieldName, FieldValue>([
            ['Imie_nazwisko_rodzica', context.gdprFormOutput.parentName],
            ['Imie_nazwisko_dziecka', context.contactOutput.formalName + ' ' + context.contactOutput.formalLastName],
            ['Niepelnoletni_wizerunek_check', context.gdprFormOutput.publishingImageConsent],
            ['Niepelnoletni_rodo_check', context.gdprFormOutput.processingDataConsent]
        ]));
    } else {
        return fillPdf(data, helveticaBytes, new Map<FieldName, FieldValue>([
            ['Imie_nazwisko', context.contactOutput.formalName + ' ' + context.contactOutput.formalLastName],
            ['Pelnoletni_wizerunek_check', context.gdprFormOutput.publishingImageConsent],
            ['Pelnoletni_rodo_check', context.gdprFormOutput.processingDataConsent]
        ]));
    }
}

function fillParentalConsentForm(data: PdfData, helveticaBytes: Uint8Array, context: DownloadFilesContext): Promise<Blob> {
    return fillPdf(data, helveticaBytes, new Map<FieldName, FieldValue>([
            ['Dane_dziecka', context.contactOutput.formalName + ' ' + context.contactOutput.formalLastName]
        ]
    ));
}

async function fetchFromPdfDir(fileName: string): Promise<Uint8Array> {
    const fetchResponse = await fetch(`/pdf/${fileName}`, {method: 'GET'});
    return await fetchResponse.bytes();
}

const HOURS_24_MILLIS = Duration.fromObject({days: 1}).toMillis();
const PDF_QUERIES_OPTIONS = ALL_PDFS.map(pdfName => ({
    queryKey: ['pdf', pdfName],
    staleTime: HOURS_24_MILLIS,
    queryFn: () => fetchFromPdfDir(pdfName),
    throwOnError: false
} as const));

export function getUseHelveticaBytesOptions() {
    return {
        queryKey: ['pdf', 'Helvetica.ttf'],
        queryFn: () => fetchFromPdfDir('Helvetica.ttf'),
        staleTime: HOURS_24_MILLIS,
        throwOnError: false
    };
}

function useHelveticaBytes() {
    return useQuery(getUseHelveticaBytesOptions());
}

export function getPdfQueriesOptions(): QueriesOptions<Uint8Array[]> {
    return PDF_QUERIES_OPTIONS;
}

function useDocumentsQuery() {
    const queries = getPdfQueriesOptions();

    return useQueries({
        queries,
        combine: (results) => {
            const pdf = (name: string) => results[ALL_PDFS_INDEXES[name]].data as Uint8Array;

            return {
                isLoading: results.some(x => x.isLoading),
                isError: results.some(x => x.isError),
                errors: results.map(x => x.error),
                gdprPdf: pdf(PDF_GDPR),
                membershipPdf: pdf(PDF_MEMBERSHIP),
                parentalConsentPdf: pdf(PDF_PARENTAL_CONSENT),
            }
        }
    })
}

export type FillPdfFunction = (context: DownloadFilesContext) => Promise<Blob>;

export type UseFillDocumentsFunctionsResult = Readonly<
    ({ isLoading: false } & (
        { isError: true, errors: unknown[] } |
        {
            isError: false,
            fill: {
                gdprPdf: FillPdfFunction,
                membershipPdf: FillPdfFunction,
                parentalConsentPdf: FillPdfFunction
            }
        }))
    | { isLoading: true, isError: false }>;

function useFillDocumentsFunctions(): UseFillDocumentsFunctionsResult {
    const documents = useDocumentsQuery();
    const helveticaBytes = useHelveticaBytes();

    if (documents.isLoading || helveticaBytes.isLoading) {
        return {isError: false, isLoading: true};
    }

    if (documents.isError || helveticaBytes.isError || !helveticaBytes.data) {
        const errors = [...(documents.errors ?? [])];
        if (helveticaBytes.error) errors.push(helveticaBytes.error);

        return {
            isError: true,
            isLoading: false,
            errors
        };
    }

    return {
        isError: false,
        isLoading: false,
        fill: {
            gdprPdf: (context: DownloadFilesContext) => fillGdprDeclaration(documents.gdprPdf, helveticaBytes.data, context),
            membershipPdf: (context: DownloadFilesContext) => fillDeclaration(documents.membershipPdf, helveticaBytes.data, context),
            parentalConsentPdf: (context: DownloadFilesContext) => fillParentalConsentForm(documents.parentalConsentPdf, helveticaBytes.data, context)
        }
    };
}

export default useFillDocumentsFunctions;