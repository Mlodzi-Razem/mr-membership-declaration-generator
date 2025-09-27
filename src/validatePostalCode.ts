import * as validator from "validator";

export default function validatePostalCode(postalCode: string | null) {
    if (!postalCode) {
        return false;
    }

    return postalCode.length > 0 && validator.isPostalCode(postalCode, "PL");
}

