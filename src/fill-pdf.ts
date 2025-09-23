import { decodeFromBase64, PDFDocument, PDFForm } from "pdf-lib";

export type FieldName = string;
export type FieldValue = string | boolean;

export default async function fillPdf(base64Data: string, fields: Map<FieldName, FieldValue>): Promise<Blob> {
    const bytes = decodeFromBase64(base64Data);
    const document = await PDFDocument.load(bytes);
    const form = document.getForm();

    fields.forEach((fieldValue, fieldName) => {
        fillSingleField(form, fieldName, fieldValue);
    });

    form.flatten();
    const pdfBytes = new Uint8Array(await document.save());
    return new Blob([pdfBytes], { type: 'application/pdf' });
}

function fillSingleField(form: PDFForm, fieldName: string, fieldValue: FieldValue) {
    if (typeof fieldValue === 'string') {
        fillTextField(form, fieldName, fieldValue);
    } else if (typeof fieldValue === 'boolean') {
        fillCheckbox(form, fieldName, fieldValue);
    } else {
        throw new Error(`Unsupported field type for field ${fieldName}: ${typeof fieldValue}`);
    }
}

function fillTextField(form: PDFForm, fieldName: string, fieldValue: string) {
    form.getTextField(fieldName).setText(fieldValue);
}

function fillCheckbox(form: PDFForm, fieldName: string, fieldValue: boolean) {
    const checkBox = form.getCheckBox(fieldName);

    if (fieldValue) {
        checkBox.check();
    } else {
        checkBox.uncheck();
    }
}