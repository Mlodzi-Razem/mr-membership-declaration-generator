import MrForm from "./MrForm.tsx";
import MrField from "./MrField.tsx";
import {Backdrop, CircularProgress, Grid, TextField} from "@mui/material";
import MrAutocomplete from './MrAutocomplete.tsx';
import usePostalMatches, {type PostalMatch} from "../queries/usePostalMatches.ts";
import distinct from "../distinct.ts";
import useDistrictLookup from "../queries/useDistrictLookup.ts";
import {useCallback, useEffect} from "react";
import type {UseFormGetValues, UseFormSetValue} from "react-hook-form";

type AddressFormFields = {
    postalCode: string;
    city: string;
    street: string;
    buildingNumber: string;
    apartmentNumber?: string;
    voivodeship: string;
    district: string;
    province: string;
    school : string;
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
    setValue: UseFormSetValue<AddressFormFields>,
    getValues: UseFormGetValues<AddressFormFields>,
    trySetDistrict: (cityValue: string) => void,
}) {
    const {
        suggestedCities,
        suggestedVoivodeships,
        suggestedStreets,
        suggestedProvinces,
        setValue,
        getValues,
        trySetDistrict
    } = args;
    useEffect(() => {
        const {
            voivodeship: voivodeshipValue,
            city: cityValue,
            street: streetValue,
            province: provinceValue
        } = getValues();

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
        if (suggestedProvinces.length === 1 && provinceValue === '') {
            setValue('province', suggestedProvinces[0]);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suggestedCities[0], suggestedVoivodeships[0], suggestedStreets[0], suggestedProvinces[0], setValue, getValues, trySetDistrict]);
}

export const AddressForm = MrForm<AddressFormFields, AddressFormOutput>((form, onSuccess) => {
    const {register, watch, getValues, formState: {errors}, getFieldState, setValue} = form;

    const districtLookup = useDistrictLookup();

    const postal = watch('postalCode') ?? '';
    const city = watch('city') ?? '';
    const street = watch('street') ?? '';
    const voivodeship = watch('voivodeship') ?? '';

    const usePostalMatchesResult = usePostalMatches(postal);
    const postalMatches = usePostalMatchesResult.matches ?? [];

    const suggestedCities = getSuggestedCities(postalMatches);
    const suggestedStreets = getSuggestedStreets(postalMatches, city);
    const suggestedVoivodeships = getSuggestedVoivodeships(postalMatches);
    const suggestedProvinces = distinct(postalMatches.map(m => m.province));

    const trySetDistrict = useCallback((cityValue: string) => {
        const valuesToCheck = [normalize(cityValue)?.toString(), ...suggestedProvinces.map(normalize)];
        const firstValue = valuesToCheck.map(v => districtLookup.get(v))
            .filter(x => x !== undefined && x !== null)[0];
        setValue('district', firstValue?.toString() ?? '');
    }, [districtLookup, suggestedProvinces, setValue]);

    useSuggestedValues({
        suggestedCities,
        suggestedVoivodeships,
        suggestedStreets,
        suggestedProvinces,
        getValues,
        setValue,
        trySetDistrict
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
    return {
        onSubmit: () => {
            const formValues = getValues();
            onSuccess(formValues);
        },
        node: <>
            <Backdrop open={usePostalMatchesResult.loading}
                      sx={(theme) => ({color: '#fff', zIndex: theme.zIndex.drawer + 1})}>
                <CircularProgress color='inherit'/>
            </Backdrop>
            <Grid container spacing={2}>
                <Grid size={3}>
                    <MrField label="Kod pocztowy" fieldError={errors.postalCode}>
                        <TextField {...register("postalCode", {
                            required: true,
                            maxLength: 6,
                        })} onSelect={onPostalCodeChange}/>
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
                <Grid size={5}>
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
                <Grid size={4}>
                    <MrField label='Powiat'>
                        <MrAutocomplete name='province' control={form.control} options={suggestedProvinces}/>
                    </MrField>
                </Grid>
                <Grid size={3}>
                    <MrField label="Okręg wyborczy">
                        <TextField disabled={city === ''} {...register("district", {required: true})}/>
                    </MrField>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={5}>
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
                <Grid size={4}>
                    <MrField label="Numer budynku">
                        <TextField disabled={street === ''} {...register("buildingNumber", {required: true})}/>
                    </MrField>
                </Grid>
                <Grid size={3}>
                    <MrField label="Numer lokalu">
                        <TextField{...register("apartmentNumber", {required: false})}/>
                    </MrField>
                </Grid>
                <Grid size={12}>
                    <MrField label="Nazwa szkoły (jeżeli uczęszczasz)">
                        <TextField {...register("school", {required:false})}/>
                    </MrField>
                </Grid>
            </Grid>
        </>
    }
});

export default AddressForm;