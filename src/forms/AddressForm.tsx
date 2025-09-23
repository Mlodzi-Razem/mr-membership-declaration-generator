import MrForm from "./MrForm.tsx";
import MrField from "./MrField.tsx";
import { Grid, TextField } from "@mui/material";
import MrAutocomplete from './MrAutocomplete.tsx';
import usePostalMatches, { type PostalMatch } from "../queries/usePostalMatches.ts";
import distinct from "../distinct.ts";
import useDistrictLookup from "../queries/useDistrictLookup.ts";
import { useCallback, useEffect } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";

type AddressFormFields = {
    postalCode: string;
    city: string;
    street: string;
    buildingNumber: string;
    apartmentNumber?: string;
    voivodeship: string;
    district: string;
};
export type OccupationFormOutput = AddressFormFields;

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
    setValue: UseFormSetValue<AddressFormFields>,
    getValues: UseFormGetValues<AddressFormFields>,
    trySetDistrict: (cityValue: string) => void,
}) {
    const {suggestedCities, suggestedVoivodeships, suggestedStreets, setValue, getValues, trySetDistrict} = args;
    useEffect(() => {
        const {voivodeship: voivodeshipValue, city: cityValue, street: streetValue} = getValues();

        if (suggestedVoivodeships.length === 1 && voivodeshipValue === '') {
            setValue('voivodeship', suggestedVoivodeships[0]);
        }
        if (suggestedCities.length === 1 && cityValue === '') {
            setValue('city', suggestedCities[0]);
            trySetDistrict(suggestedCities[0]);
        }
        if (suggestedStreets.length === 1 && streetValue === '') {
            setValue('street', suggestedStreets[0]);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suggestedVoivodeships[0], suggestedCities[0], suggestedStreets[0], trySetDistrict, setValue, getValues]);
}

export const AddressForm = MrForm<AddressFormFields, OccupationFormOutput>((form, onSuccess) => {
    const {register, watch, getValues, formState: {errors}, getFieldState, setValue} = form;

    const districtLookup = useDistrictLookup();

    const postal = watch('postalCode') as string ?? '';
    const city = watch('city') as string ?? '';
    const street = watch('street') as string ?? '';
    const voivodeship = watch('voivodeship') ?? '';

    const postalMatches = usePostalMatches(postal);

    const suggestedCities = getSuggestedCities(postalMatches);
    const suggestedStreets = getSuggestedStreets(postalMatches, city);
    const suggestedVoivodeships = getSuggestedVoivodeships(postalMatches);
    const provinces = distinct(postalMatches.map(m => m.province));

    const trySetDistrict = useCallback((cityValue: string) => {
        const valuesToCheck = [normalize(cityValue)?.toString(), ...provinces.map(normalize)];
        const firstValue = valuesToCheck.map(v => districtLookup.get(v))
                                        .filter(x => x !== undefined && x !== null)[0];
        setValue('district', firstValue?.toString() ?? '');
    }, [districtLookup, provinces, setValue]);

    useSuggestedValues({suggestedCities, suggestedVoivodeships, suggestedStreets, getValues, setValue, trySetDistrict});

    return {
        onSubmit: () => {
            const formValues = getValues();
            onSuccess(formValues);
        },
        node: <>
            <Grid container spacing={2}>
                <Grid size={3}>
                    <MrField label="Kod pocztowy" fieldError={errors.postalCode}>
                        <TextField {...register("postalCode", {
                            required: true,
                            maxLength: 6,
                        })}/>
                    </MrField>
                </Grid>

                <Grid size={9}>
                    <MrField label="Miasto">
                        <MrAutocomplete
                            name="city"
                            control={form.control}
                            disabled={getFieldState('postalCode').invalid}
                            options={suggestedCities}
                            value={city}
                            onSelect={trySetDistrict}
                            inputProps={{...register("city", {required: true})}}
                            sx={{width: '100%'}}
                        />
                    </MrField>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={9}>
                    <MrField label="Województwo">
                        <MrAutocomplete name="voivodeship"
                                        disabled={getFieldState('postalCode').invalid}
                                        control={form.control}
                                        options={suggestedVoivodeships}
                                        value={voivodeship}
                                        inputProps={{...register("voivodeship", {required: true})}}
                                        sx={{width: '100%'}}/>
                    </MrField>
                </Grid>
                <Grid size={3}>
                    <MrField label="Okręg wyborczy">
                        <TextField disabled={city === ''} {...register("district", {required: true})}/>
                    </MrField>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={6}>
                    <MrField label="Ulica">
                        <MrAutocomplete
                            name="street"
                            control={form.control}
                            options={suggestedStreets}
                            value={street ?? ''}
                            disabled={city === ''}
                            inputProps={{...register("street", {required: true})}}
                            sx={{width: '100%'}}
                        />
                    </MrField>
                </Grid>
                <Grid size={3}>
                    <MrField label="Numer budynku">
                        <TextField disabled={street === ''} {...register("buildingNumber", {required: true})}/>
                    </MrField>
                </Grid>
                <Grid size={3}>
                    <MrField label="Numer lokalu">
                        <TextField{...register("apartmentNumber", {required: false})}/>
                    </MrField>
                </Grid>
            </Grid>
        </>
    }
});

export default AddressForm;