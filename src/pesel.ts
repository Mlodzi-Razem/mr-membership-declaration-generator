import {DateTime} from "luxon";

const WEIGHTS = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];

export function validatePesel(inputPesel: string | undefined | null): inputPesel is string {
    const pesel = inputPesel?.trim();

    if (pesel === undefined || pesel === null || pesel.length !== 11) {
        return false;
    }

    const controlNumber = parseInt(pesel.substring(10, 11));

    let sum = 0;
    for (let i = 0; i < WEIGHTS.length; i++) {
        sum += (parseInt(pesel.substring(i, i + 1)) * WEIGHTS[i]);
    }
    sum = sum % 10;
    return (10 - sum) % 10 === controlNumber;
}

export type DecodedPesel = {
    sex: 'MALE' | 'FEMALE',
    birthDate: DateTime
}
export function decodePesel(pesel: string): DecodedPesel {
    let year = parseInt(pesel.substring(0, 2), 10);
    let month = parseInt(pesel.substring(2, 4), 10);
    const day = parseInt(pesel.substring(4, 6), 10);

    if (month > 80) {
        year = year + 1800;
        month = month - 80;
    } else if (month > 60) {
        year = year + 2200;
        month = month - 60;
    } else if (month > 40) {
        year = year + 2100;
        month = month - 40;
    } else if (month > 20) {
        year = year + 2000;
        month = month - 20;
    } else {
        year += 1900;
    }

    const birthDate = DateTime.fromObject({year, month: month, day: day});

    const sex = parseInt(pesel.substring(9, 10), 10) % 2 === 1 ? 'MALE' : 'FEMALE';

    return {sex, birthDate};
}