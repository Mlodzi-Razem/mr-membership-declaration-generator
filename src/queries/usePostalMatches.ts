import { useQuery } from "@tanstack/react-query";
import useIsPostalCodeValid from "./useIsPostalCodeValid.ts";

type CitiesApiResponse = ReadonlyArray<{
    kod: string,
    miejscowosc: string,
    ulica: string,
    gmina: string,
    powiat: string,
    dzielnica: string,
    wojewodztwo: string
}>

export interface PostalMatch {
    city: string,
    street: string,
    voivodeship: string,
    province: string;
}

export default function usePostalMatches(postalCode: string): PostalMatch[] {
    const isValid = useIsPostalCodeValid(postalCode);

    const queryResult = useQuery({
        queryKey: ['cities', postalCode],
        queryFn: async ({signal}) => {
            if (isValid) {
                const response = await fetch(`https://kodpocztowy.intami.pl/api/${postalCode}`, {signal});
                return (await response.json()) as CitiesApiResponse;
            }

            return [];
        },
        throwOnError: false
    })

    if (queryResult.isError) {
        console.error('Error fetching cities:', queryResult.error);
        return [];
    }

    if (queryResult.isLoading || !queryResult.data) {
        return [];
    }

    return queryResult.data.map(element => ({
        city: element.miejscowosc,
        street: element.ulica,
        voivodeship: element.wojewodztwo,
        province: element.powiat
    }) as const);
}