import { useForm } from "react-hook-form";
import type { FixedArray, NumberCharacter } from "../types.ts";
import { DateTime } from "luxon";
import { decodePesel, validatePesel } from "../pesel.ts";
import Field from "./Field.tsx";
import { Button, Stack, TextField } from "@mui/material";

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
    pesel: FixedArray<NumberCharacter, 11>
}

const DATE_PATTERN = /\d\d\.\d\d\.\d\d\d\d/;
const PESEL_PATTERN = /\d{11}/;

export default function PeselForm({onSuccess}: { onSuccess: (output: PeselFormOutput) => void }) {
    const {register, handleSubmit, formState, getValues} = useForm<PeselFormFields>()

    const onSubmit = handleSubmit(() => {
        const values = getValues();

        const [birthDay, birthMonth, birthYear] = values.birthDate.split('.');

        const output: PeselFormOutput = {
            birthDate: {
                day: birthDay.split("") as never,
                month: birthMonth.split("") as never,
                year: birthYear.split("") as never
            },
            pesel: values.pesel.split("") as never,
        }

        onSuccess(output);
    });

    const errors = formState.errors;

    return <form onSubmit={onSubmit}>
        <Stack spacing={2}>
            <Field label="Date urodzenia" fieldError={errors.birthDate}>
                <TextField {...register(
                    "birthDate",
                    {required: true, validate: birthDateValidate}
                )} placeholder="Np. 31.03.1999"/>
            </Field>

            <Field label="PESEL" fieldError={errors.pesel}>
                <TextField {...register("pesel", {required: true, validate: peselValidate})}/>
            </Field>

            <Button type="submit" color='primary' disabled={!formState.isValid}>Dalej</Button>
        </Stack>
    </form>
}

function parseDate(dateString: string) {
    return DateTime.fromFormat(dateString, "dd.MM.yyyy");
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