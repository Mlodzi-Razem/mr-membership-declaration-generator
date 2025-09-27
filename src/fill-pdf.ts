import {decodeFromBase64, PDFCheckBox, PDFDocument, PDFDropdown, PDFField, PDFTextField} from "pdf-lib";
import fontkit from '@pdf-lib/fontkit';
import helveticaBase64 from "./assets/Helvetica.ttf?base64";

export type FieldName = string;
export type FieldValue = string | boolean;

const helveticaBytes = decodeFromBase64(helveticaBase64);

async function fixEncoding(document: PDFDocument) {
    document.registerFontkit(fontkit);
    const form = document.getForm();
    const pdfHelveticaFont = await document.embedFont(helveticaBytes);
    const rawUpdateFieldAppearances = form.updateFieldAppearances.bind(form);
    form.updateFieldAppearances = function () {
        return rawUpdateFieldAppearances(pdfHelveticaFont);
    };
}

export default async function fillPdf(base64Data: string, fields: Map<FieldName, FieldValue>): Promise<Blob> {
    const bytes = decodeFromBase64(base64Data);
    const document = await PDFDocument.load(bytes);
    const form = document.getForm();

    await fixEncoding(document);


    fields.forEach((fieldValue, fieldName) => {
        const formField = form.getField(fieldName);

        if (!formField) {
            throw new Error(`Field ${fieldName} not found in PDF`);
        }

        fillSingleField(formField, fieldName, fieldValue);
    });

    form.flatten();
    const pdfBytes = new Uint8Array(await document.save());
    return new Blob([pdfBytes], { type: 'application/pdf' });
}

function fillSingleField(formField: PDFField, fieldName: string, fieldValue: FieldValue) {
    if (typeof fieldValue === 'string') {
        fillTextField(formField, fieldName, fieldValue);
    } else if (typeof fieldValue === 'boolean') {
        fillCheckbox(formField, fieldValue);
    } else {
        throw new Error(`Unsupported field type for field ${fieldName}: ${typeof fieldValue}`);
    }
}

function fillTextField(field: PDFField, fieldName: string, fieldValue: string) {
    if (field instanceof PDFTextField) {
        field.setText(fieldValue);
    } else if (field instanceof PDFDropdown) {
        field.select(fieldValue);
    } else {
        throw new Error(`Unsupported field type for field ${fieldName}: ${field.constructor.name}`);
    }
}

function fillCheckbox(field: PDFField, fieldValue: boolean) {
    const checkBox = field as PDFCheckBox;

    if (fieldValue) {
        checkBox.check();
    } else  {
        checkBox.uncheck();
    }
    checkBox.defaultUpdateAppearances();
}