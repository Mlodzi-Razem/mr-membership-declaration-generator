import {useQuery} from "@tanstack/react-query";
import validatePostalCode from "../validatePostalCode.ts";

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

export type UsePostalMatchesResult = { loading: true, matches?: PostalMatch[] } | {
    loading: false,
    matches: PostalMatch[]
}

export default function usePostalMatches(postalCode: string): UsePostalMatchesResult {
    const isValid = validatePostalCode(postalCode);

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
        return {loading: false, matches: []};
    }

    if (queryResult.isLoading) {
        return {loading: true};
    }
    if (!queryResult.data) {
        return {loading: false, matches: []};
    }

    const matches = queryResult.data.map(element => ({
        city: element.miejscowosc,
        street: element.ulica,
        voivodeship: element.wojewodztwo,
        province: element.powiat
    }) as const);

    return {loading: false, matches};
}