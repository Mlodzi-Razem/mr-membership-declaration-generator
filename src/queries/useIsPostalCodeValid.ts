import { useMemo } from "react";

const POSTAL_CODE_REGEX = /^\d{2}-\d{3}$/;

export default function useIsPostalCodeValid(postalCode: string | undefined | null) {
    return useMemo(() => {
        if (!postalCode) {
            return false;
        }

        if (postalCode.length !== 6) {
            return false;
        }

        return POSTAL_CODE_REGEX.test(postalCode);
    }, [postalCode]);
}