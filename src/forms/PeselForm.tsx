import type {FixedArray, NumberCharacter} from "../types.ts";
import {DateTime} from "luxon";
import {decodePesel, validatePesel} from "../pesel.ts";
import MrField from "./MrField.tsx";
import {TextField} from "@mui/material";
import MrForm from "./MrForm.tsx";

type PeselFormFields = {
    birthDate: string;
    pesel: string;
}

export type PeselFormOutput = {
    birthDate: {
        day: [NumberCharacter, NumberCharacter],
        month: [NumberCharacter, NumberCharacter],
        year: [NumberCharacter, NumberCharacter, NumberCharacter, NumberCharacter],
    },
    pesel: FixedArray<NumberCharacter, 11>,
    requiresParentalConsent: boolean;
}

const DATE_PATTERN = /\d\d\.\d\d\.\d\d\d\d/;
const PESEL_PATTERN = /\d{11}/;

function isParentalConsentRequired(birthDate: string): boolean {
    const parsedDate = parseDate(birthDate);

    return DateTime.now().diff(parsedDate, 'years').years < 16;
}

const DATE_FORMAT = 'dd.MM.yyyy';

const PeselForm = MrForm<PeselFormFields, PeselFormOutput>((form, onSuccess) => {
    const {register, formState: {errors}, getValues, setValue} = form;

    const onPeselInput = (e: {target: {value: string}}) => {
        const pesel = e.target.value;
        const birthDate = getValues('birthDate') ?? '';
        const isValid = validatePesel(pesel);

        if (isValid) {
            const {birthDate: decodedBirthDate} = decodePesel(pesel);

            if (birthDate === '') {
                setValue('birthDate', decodedBirthDate.toFormat(DATE_FORMAT));
            }
        }
    };

    return {
        onSubmit: () => {
            const values = getValues();

            const [birthDay, birthMonth, birthYear] = values.birthDate.split('.');

            const output: PeselFormOutput = {
                birthDate: {
                    day: birthDay.split("") as never,
                    month: birthMonth.split("") as never,
                    year: birthYear.split("") as never
                },
                pesel: values.pesel.split("") as never,
                requiresParentalConsent: isParentalConsentRequired(values.birthDate)
            }

            onSuccess(output);
        },
        node: <>
            <MrField label="PESEL" fieldError={errors.pesel}>
                <TextField onSelect={onPeselInput as never} {...register("pesel", {required: true, validate: peselValidate})}/>
            </MrField>

            <MrField label="Data urodzenia" fieldError={errors.birthDate}>
                <TextField {...register(
                    "birthDate",
                    {required: true, validate: birthDateValidate}
                )} placeholder="Np. 31.03.1999"/>
            </MrField>
        </>
    }
});
export default PeselForm;

function parseDate(dateString: string) {
    return DateTime.fromFormat(dateString, DATE_FORMAT);
}

function birthDateValidate(dateString: string) {
    if (!DATE_PATTERN.test(dateString)) {
        return "Wpisz datę urodzenia w formacie DD.MM.YYYY. Przykład: 31.03.1999"
    }

    const date = parseDate(dateString);

    const beginningOfTheYear = DateTime.now().set({day: 0, month: 0, hour: 0, minute: 0, second: 0, millisecond: 0});
    const yearsDiff = beginningOfTheYear.diff(date, 'years').years;
    const isTooOld = yearsDiff > 26;

    if (isTooOld) {
        return "Nie przyjmujemy osób powyżej 26 roku życia."
    }

    return true;
}

function peselValidate(peselString: string, formValues: PeselFormFields) {
    if (!PESEL_PATTERN.test(peselString)) {
        return "Nieprawidłowy format PESEL."
    }

    if (!validatePesel(peselString)) {
        return "Numer PESEL nie jest prawidłowy";
    }

    const peselBirthDate = decodePesel(peselString).birthDate;

    if (!formValues.birthDate) {
        return true;
    }

    const birthDate = parseDate(formValues.birthDate);
    if (!birthDate.isValid) {
        return true;
    }

    if (!peselBirthDate.equals(birthDate)) {
        return "Numer PESEL nie jest zgodny z podaną datą urodzenia."
    }

    return true;
}