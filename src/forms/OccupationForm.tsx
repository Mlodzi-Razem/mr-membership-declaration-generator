import * as React from 'react';
import MrForm from "./MrForm.tsx";
import MrField from "./MrField.tsx";
import { Grid, TextField, List, ListItemButton, ListItemText} from "@mui/material";
import { parliament_district } from "../parliament-district";
import { useQuery } from '@tanstack/react-query';
import MrAutocomplete from './MrAutocomplete.tsx';

// utils *****************************************************************

function normalizeName(s: unknown): string {
    if (!s) return '';
    const str = String(s).toLowerCase().trim();
    return str;
}

const districtLookup: Map<string, number> = (() => {
    const m = new Map<string, number>();
    for (const d of parliament_district) {
        if (Array.isArray(d.powiat)) {
            for (const p of d.powiat) {
                const k = normalizeName(p);
                if (k) m.set(k, d.nr);
            }
        }
        if (Array.isArray(d.miastaPrawaPow)) {
            for (const c of d.miastaPrawaPow) {
                const k = normalizeName(c);
                if (k) m.set(k, d.nr);
            }
        }
    }
    return m;
})();

// small hook to validate postal code format NN-NNN
function useIsValidPostal(postalCode: string) {
    return React.useMemo(() => {
        const code = String(postalCode ?? '').trim();
        return /^\d{2}-\d{3}$/.test(code) && code.length === 6;
    }, [postalCode]);
}

export function findRepresentativePostalMatch(results: any[] | undefined): any | null {
    if (!results || results.length === 0) return null;
    const cities = Array.from(new Set(results.map((r: any) => (r.miejscowosc)).filter(Boolean)));
    if (cities.length === 1) {
        const cityName = cities[0];
        const rep = results.find((r: any) => {
            const name = (r.miejscowosc).toString();
            return name === cityName;
        }) || results[0];
        return rep || null;
    }
    return null;
}

// ************************************************************************

// fetches ****************************************************************

export async function getRSPOData(query: string): Promise<any[]> {
  if (!query) return [];
  const url = `https://api-rspo.men.gov.pl/api/gminy/?nazwa=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Failed to fetch RSPO data: ${res.status} ${res.statusText}`);
  }
  const body = await res.json();
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.results)) return body.results;
  return [];
}
  
async function getPostalData(postalCode: string): Promise<any[]> {
// Possible to shorten, 
  const code = String(postalCode || '').trim();
  if (!code || code.length < 6) return [];
  const url = `https://kodpocztowy.intami.pl/api/${encodeURIComponent(code)}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Failed to fetch postal data: ${res.status} ${res.statusText}`);
  }
  const body = await res.json();
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.places)) return body.places;
  return [];
}
 
function usePostalPlaces(postalCode: string) {
    // only run the postal lookup when the postal code is valid (NN-NNN)
    const isValid = useIsValidPostal(postalCode);
    return useQuery({
        queryKey: ['postalPlaces', postalCode],
        queryFn: () => getPostalData(postalCode),
        enabled: Boolean(isValid),
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

// Probs not needed, kept for future in case Postal API is down
function useRSPOData(query: string) {
    const enabled = Boolean(query && String(query).trim().length > 0);
    return useQuery({
        queryKey: ['rspo', query],
        queryFn: () => getRSPOData(query),
        enabled,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}

// ************************************************************************

// POST-FETCH LOGIC

function usePostalSuggestions(postalCode: string) {
    const isValid = useIsValidPostal(postalCode);
    const postalPlacesQuery = usePostalPlaces(postalCode);
    const results = postalPlacesQuery.data ?? [];

    return React.useMemo(() => {
        
        if (!isValid || !results || results.length === 0) return [];

        const cities = Array.from(new Set(results.map((r: any) => (r.miejscowosc ?? r.nazwa ?? r.name ?? r.gmina ?? '').toString()).filter(Boolean)));
        if (cities.length <= 1) return [];
        return cities;
    }, [postalCode, isValid, results]);
}

// Extracted helper: derive and filter street suggestions from postalPlaces
function useStreetSuggestions(postalPlaces: any[] | undefined, streetInput: string) {
    return React.useMemo(() => {
        if (!postalPlaces || postalPlaces.length === 0) return { all: [] as string[], filtered: [] as string[] };
        const names = postalPlaces
            .map((r: any) => (r.ulica ?? r.street ?? r.road ?? '').toString())
            .filter(Boolean)
            .map(s => s.trim())
            .filter(Boolean);
        const all = Array.from(new Set(names));
        if (!streetInput) return { all, filtered: all };
        const q = streetInput.toLowerCase();
        const filtered = all.filter(s => s.toLowerCase().includes(q));
        return { all, filtered };
    }, [postalPlaces, streetInput]);
}

// new hook: returns a handler to select a city using postalPlaces (no getPostalData)
function useCitySelector(
    postalPlaces: any[] | undefined,
    applyPostalMatch: (match: any | undefined) => void,
    setValue: (name: string, value: any) => void
) {
    const mountedRef = React.useRef(true);
    React.useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    return React.useCallback((city: string) => {
        // Set city immediately (UX)
        setValue('city', city);

        if (!mountedRef.current || !postalPlaces || postalPlaces.length === 0) return;

        const match = postalPlaces.find((r: any) => {
            const name = (r.miejscowosc ?? r.nazwa ?? r.name ?? r.gmina ?? '').toString();
            return name === city;
        });
        applyPostalMatch(match);
    }, [postalPlaces, applyPostalMatch, setValue]);
}



//************************************************************************************ */

// helpers
function renderSuggestionColumns(suggestions: string[], onSelect: (city: string) => void) {
    const left: string[] = [];
    const right: string[] = [];
    suggestions.forEach((s, i) => { if (i % 2 === 0) left.push(s); else right.push(s); });

    return (
        <>
            <Grid size={6}>
                <List dense>
                    {left.map(miejscowosc => (
                        <ListItemButton key={miejscowosc} onClick={() => onSelect(miejscowosc)}>
                            <ListItemText primary={miejscowosc} />
                        </ListItemButton>
                    ))}
                </List>
            </Grid>
            <Grid size={6}>
                <List dense>
                    {right.map(miejscowosc => (
                        <ListItemButton key={miejscowosc} onClick={() => onSelect(miejscowosc)}>
                            <ListItemText primary={miejscowosc} />
                        </ListItemButton>
                    ))}
                </List>
            </Grid>
        </>
    );
}


type OccupationFormFields = {
    postalCode: string;
    city: string;
    street_name_and_number: string;
    voivodeship: string;
    parliament_voting_district: string;
    street_name: string;
    street_number: string;
};
export type OccupationFormOutput = OccupationFormFields;

// helper: render suggestions split into two columns


export const OccupationForm = MrForm<OccupationFormFields, OccupationFormOutput>((form, onSuccess) => {

            /* vals */
            const {register, watch, setValue, getValues, formState: { errors }} = form;

            const postal = String(watch('postalCode') ?? '');
            const cityInput = String(watch('city') ?? '');
            const streetInput = String(watch('street_name') ?? '');

            const citySuggestions : string[] = usePostalSuggestions(postal);
            const isValidPostal = useIsValidPostal(postal);
    
            const postalPlacesQuery = usePostalPlaces(postal);     // zaraz bedzie postal irl
            const postalPlaces = postalPlacesQuery.data;            // zostawilem 
            //
            /* filtering functions, they probs need some kind of an animation, but i got an interview in one hour */
            //    
            // GET THE CITY SUGGESTIONS
            const filteredCitySuggestions = React.useMemo(() => {
                if (!citySuggestions || citySuggestions.length === 0) return [];
                if (!cityInput) return citySuggestions;
                const q = cityInput.toLowerCase();
                return citySuggestions.filter(s => s.toLowerCase().includes(q));
            }, [citySuggestions, cityInput]);

            // derive street suggestions and filtered variant via helper
            const { filtered: filteredStreetSuggestions } = useStreetSuggestions(postalPlaces, streetInput);

            //////////////////////////////////////////////////////////////////////////////////
            // APPLYING MATCHES
            //////////////////////////////////////////////////////////////////////////////////
            
            function applyVoivodeshipPowiatMatch(match: any | undefined) {
                if (!match) return;
                const voiv = match.wojewodztwo ?? (typeof match.wojewodztwo === 'object' ? match.wojewodztwo.name : undefined);
                if (voiv) setValue('voivodeship', voiv);

                const powiat = match.powiat;
                const key = normalizeName(powiat);
                const foundNr = districtLookup.get(key);
                if (foundNr) setValue('parliament_voting_district', String(foundNr));
            }

            const handleSelectCity = useCitySelector(postalPlaces, applyVoivodeshipPowiatMatch, (n: string, v: any) => setValue(n as any, v));
            const handleSelectStreet = React.useCallback((street: string) => {
                setValue('street_name', street);
            }, [setValue]);

            
            

            // Auto-fill when postal resolves to a single city and the user hasn't entered a city yet.
            React.useEffect(() => {
                if (!isValidPostal) return;
                const currentCity = String(getValues().city ?? '').trim();
                if (currentCity) return; // don't override user input

                let mounted = true;
                const rep = findRepresentativePostalMatch(postalPlaces);
                if (mounted && rep) {
                    // apply city + voivodeship + district
                    const cityName = (rep.miejscowosc ?? rep.nazwa ?? rep.name ?? rep.gmina ?? '').toString();
                    if (cityName) setValue('city', cityName);
                    applyVoivodeshipPowiatMatch(rep);
                }

                return () => { mounted = false; };
            }, [postal, isValidPostal, postalPlaces]);

    return {
        onSubmit: () => {
            const formValues = getValues();

            onSuccess({
                postalCode: formValues.postalCode,
                city: formValues.city,
                street_name_and_number: formValues.street_name_and_number,
                voivodeship: formValues.voivodeship,
                parliament_voting_district: formValues.parliament_voting_district,
                street_name: formValues.street_name,
                street_number: formValues.street_number,
            });
        },
        node: <>
            <Grid container>
                <Grid size={6}>
                    <MrField label="Kod pocztowy" fieldError={errors.postalCode}>
                        <TextField {...register("postalCode", {
                            required: true,
                            maxLength: 6,
                        })} />
                    </MrField>
                </Grid>
                    <Grid size={6}>
                    <MrField label="Miasto">
                            <MrAutocomplete
                                name="city"
                                control={form.control}
                                options={filteredCitySuggestions}
                                value={cityInput}
                                onSelect={(value) => {
                                    if (value) handleSelectCity(value);
                                }}
                                inputProps={{...register("city", {required: true})}}
                                sx={{ width: '20rem' }}
                            />
                    </MrField>
                </Grid>
                    {filteredCitySuggestions.length > 0 && renderSuggestionColumns(filteredCitySuggestions, handleSelectCity)}
            </Grid>
            <MrField label="Województwo">
                <TextField {...register("voivodeship", {required: true})}/>
            </MrField>
            <MrField label="Ulica zamieszkania">
                <MrAutocomplete
                    name="street_name"
                    control={form.control}
                    options={filteredStreetSuggestions}
                    value={String(watch('street_name') ?? '')}
                    onSelect={(value) => { if (value) handleSelectStreet(value); }}
                    inputProps={{...register("street_name", {required: true})}}
                    sx={{ width: '100%' }}
                />
            </MrField>
            <MrField label="Numer domu/mieszkania">
                <TextField {...register("street_number", {required: true})}/>
            </MrField>

            <MrField label="Okręg wyborczy do Sejmu RP">
                <TextField {...register("parliament_voting_district", {required: true})}/>
            </MrField>
        </>
    }
});

export default OccupationForm;