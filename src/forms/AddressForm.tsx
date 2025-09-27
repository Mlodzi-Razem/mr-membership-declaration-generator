import MrForm from "./MrForm.tsx";
import {Alert, Grid} from "@mui/material";
import usePostalMatches, {type PostalMatch} from "../hooks/usePostalMatches.ts";
import distinct from "../distinct.ts";
import useDistrictLookup from "../hooks/useDistrictLookup.ts";
import {useCallback, useEffect} from "react";
import {type UseFormReturn} from "react-hook-form";
import useIsMobile from "../hooks/useIsMobile.ts";
import validatePostalCode from "../validatePostalCode.ts";
import Inputs from "../inputs/Inputs.ts";
import valid from "validator";

const {MrAutocomplete, MrTextInput} = Inputs<AddressFormFields>();
const validateDistrict = (value: string) => {
    if (value.trim().length < 1 || value.trim().length > 2) {
        return false;
    }

    const noSpaces = value.replace(/\s/g, '');
    if (!valid.isNumeric(noSpaces, {no_symbols: true})) {
        return "Podana wartość nie jest liczbą";
    }

    return true;
}

type AddressFormFields = {
    postalCode: string;
    city: string;
    street: string;
    buildingNumber: string;
    apartmentNumber?: string;
    voivodeship: string;
    district: string;
    province: string;
    school: string;
};
export type AddressFormOutput = AddressFormFields;

function normalize(x: string): string {
    return x.normalize('NFKD').trim().toLowerCase();
}

function getSuggestedCities(postalMatches: PostalMatch[]) {
    return distinct(postalMatches.map(m => m.city)).filter(x => !!x && x.trim() !== '');
}

function getSuggestedStreets(postalMatches: PostalMatch[], cityInput: string) {
    return distinct(
        postalMatches.filter(m => normalize(m.city) === normalize(cityInput))
            .map(m => m.street)
            .filter(x => !!x && x.trim() !== '')
    );
}

function getSuggestedVoivodeships(postalMatches: PostalMatch[]) {
    return distinct(postalMatches.map(m => m.voivodeship)).filter(x => !!x && x.trim() !== '');
}

function useSuggestedValues(args: {
    suggestedCities: string[],
    suggestedVoivodeships: string[],
    suggestedStreets: string[],
    suggestedProvinces: string[],
    form: UseFormReturn<AddressFormFields>
}) {
    const {
        suggestedCities,
        suggestedVoivodeships,
        suggestedStreets,
        suggestedProvinces,
        form
    } = args;
    useEffect(() => {
        const {getValues, setValue, trigger, setFocus} = form;
        const {
            voivodeship: voivodeshipValue,
            city: cityValue,
            street: streetValue,
            province: provinceValue
        } = getValues();

        let shouldTrigger = false;

        if (suggestedVoivodeships.length === 1 && voivodeshipValue === '') {
            setValue('voivodeship', suggestedVoivodeships[0]);
            shouldTrigger = true;
        }
        if (suggestedCities.length === 1 && cityValue === '') {
            setValue('city', suggestedCities[0]);
            shouldTrigger = true;
        }
        if (suggestedStreets.length === 1 && streetValue === '') {
            setValue('street', suggestedStreets[0]);
            shouldTrigger = true;
        }
        if (suggestedProvinces.length === 1 && provinceValue === '') {
            setValue('province', suggestedProvinces[0]);
            shouldTrigger = true;
        }

        if (shouldTrigger) {
            trigger();
            setFocus('voivodeship');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suggestedCities[0], suggestedVoivodeships[0], suggestedStreets[0], suggestedProvinces[0]]);
}


const AddressForm = MrForm<AddressFormFields, AddressFormOutput>('address', (form, onSuccess) => {
        const {watch, getValues, formState: {errors}, setValue} = form;
        const isMobile = useIsMobile();

        const districtLookup = useDistrictLookup();

        const postal = watch('postalCode')?.trim();
        const city = watch('city')?.trim();
        const street = watch('street')?.trim();
        const voivodeship = watch('voivodeship')?.trim();
        const province = watch('province')?.trim();
        const buildingNumber = watch('buildingNumber')?.trim();

        const usePostalMatchesResult = usePostalMatches(postal);
        const postalMatches = usePostalMatchesResult.matches ?? [];

        const suggestedCities = getSuggestedCities(postalMatches);
        const suggestedStreets = getSuggestedStreets(postalMatches, city);
        const suggestedVoivodeships = getSuggestedVoivodeships(postalMatches);
        const suggestedProvinces = distinct(postalMatches.map(m => m.province));

        const trySetDistrict = useCallback((cityValue: string, provinceValue: string) => {
            const valuesToCheck = [normalize(cityValue)?.toString(), ...suggestedProvinces.map(normalize)];
            const firstValue = valuesToCheck.map(v => districtLookup.get(v) ?? districtLookup.get(provinceValue))
                .filter(x => x !== undefined && x !== null)[0];
            setValue('district', firstValue?.toString() ?? '');
        }, [districtLookup, suggestedProvinces, setValue]);

        useSuggestedValues({
            suggestedCities,
            suggestedVoivodeships,
            suggestedStreets,
            suggestedProvinces,
            form
        });

        const onPostalCodeChange = useCallback(() => {
            setValue('voivodeship', '');
            setValue('city', '');
            setValue('province', '');
            setValue('district', '');
            setValue('street', '');
            setValue('buildingNumber', '');
            setValue('school', '');
            setValue('apartmentNumber', '');

        }, [setValue]);

        const postalCodeInvalid = !!errors.postalCode || postal?.trim() === '';

        return {
            onSubmit: () => {
                const formValues = getValues();
                onSuccess({
                    ...formValues,
                    district: (formValues.district ?? '--').trim(),
                });
            },
            node: <>
                {!usePostalMatchesResult.loading && usePostalMatchesResult.error && <Alert variant='outlined' severity='error'>
                    Nie udało się pobrać listy podpowiedzi.
                </Alert> }

                <Grid container spacing={2}>
                    <Grid size={isMobile ? 12 : 3}>
                        <MrTextInput fieldName='postalCode'
                                     label='Kod pocztowy'
                                     validate={validatePostalCode}
                                     onInput={onPostalCodeChange}
                                     required/>
                    </Grid>

                    <Grid size={isMobile ? 12 : 9}>
                        <MrAutocomplete fieldName='voivodeship'
                                        label='Województwo'
                                        options={suggestedVoivodeships}
                                        disabled={postalCodeInvalid}
                                        required/>
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid size={isMobile ? 12 : 4}>
                        <MrAutocomplete fieldName='province'
                                        label='Powiat'
                                        options={suggestedProvinces}
                                        disabled={voivodeship === ''}
                                        onSelect={provinceValue => trySetDistrict(city, provinceValue)}
                                        required/>
                    </Grid>
                    <Grid size={isMobile ? 12 : 5}>
                        <MrAutocomplete fieldName='city'
                                        label='Miasto'
                                        disabled={postalCodeInvalid || province === ''}
                                        options={suggestedCities}
                                        onSelect={cityValue => trySetDistrict(cityValue, province)}
                                        required/>
                    </Grid>
                    <Grid size={isMobile ? 12 : 3}>
                        <MrTextInput fieldName='district'
                                     label='Okręg wyborczy'
                                     validate={validateDistrict}
                                     disabled={city === ''}
                                     required/>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid size={isMobile ? 12 : 5}>
                        <MrAutocomplete fieldName='street'
                                        label='Ulica'
                                        options={suggestedStreets}
                                        disabled={city === ''}/>
                    </Grid>
                    <Grid size={isMobile ? 6 : 4}>
                        <MrTextInput fieldName='buildingNumber'
                                     label='Numer budynku'
                                     disabled={street === ''}
                                     required/>
                    </Grid>
                    <Grid size={isMobile ? 6 : 3}>
                        <MrTextInput fieldName='apartmentNumber'
                                     label='Numer lokalu'
                                     disabled={buildingNumber === ''}/>
                    </Grid>
                    <Grid size={12}>
                        <MrTextInput fieldName='school'
                                     disabled={buildingNumber === ''}
                                     label='Nazwa szkoły/uczelni (jeżeli uczęszczasz)'/>
                    </Grid>
                </Grid>
            </>
        }
    })
;

export default AddressForm;