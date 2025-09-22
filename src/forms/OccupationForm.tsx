import * as React from 'react';
import MrForm from "./MrForm.tsx";
import MrField from "./MrField.tsx";
import { Grid, TextField, List, ListItemButton, ListItemText } from "@mui/material";
import { parliament_district } from "../parliament-district";

// Build a normalized lookup map from powiat / city name -> district number
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

export async function getPostalData(postalCode: string): Promise<any[]> {
  const code = String(postalCode || '').trim();
  if (!code) return [];
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

export async function fetchRepresentativePostalMatch(postalCode: string): Promise<any | null> {
    const results = await getPostalData(postalCode);
    if (!results || results.length === 0) return null;
    const cities = Array.from(new Set(results.map((r: any) => (r.miejscowosc ?? r.nazwa ?? r.name ?? (r.gmina ?? '') )).filter(Boolean)));
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

function usePostalSuggestions(postalCode: string) {
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const lastQueriedRef = React.useRef<string | null>(null);
    const inFlightRef = React.useRef(false);

    React.useEffect(() => {
        const code = String(postalCode ?? '').trim();
        const postalRegex = /^\d{2}-\d{3}$/;

        if (!postalRegex.test(code)) {
            setSuggestions([]);
            return;
        }

        if (code.length !== 6) return; // wait until full format

        if (lastQueriedRef.current === code || inFlightRef.current) return;

        lastQueriedRef.current = code;
        inFlightRef.current = true;

        let mounted = true;
        getPostalData(code).then(results => {
            if (!mounted) return;
            if (!results || results.length === 0) {
                setSuggestions([]);
                return;
            }

            const cities = Array.from(new Set(results.map((r: any) => (r.miejscowosc ?? r.nazwa ?? r.name ?? (r.gmina ?? '') )).filter(Boolean)));
            if (cities.length <= 1) {
                // if only one or zero distinct cities, don't expose suggestions
                setSuggestions([]);
            } else {
                setSuggestions(cities);
            }
        }).catch(() => {
            if (mounted) setSuggestions([]);
        }).finally(() => {
            inFlightRef.current = false;
        });

        return () => { mounted = false; };
    }, [postalCode]);

    return suggestions;
}

type OccupationFormFields = {
    postalCode: string;
    city: string;
    street_name_and_number: string;
    voivodeship: string;
    parliament_voting_district: string;
};
export type OccupationFormOutput = OccupationFormFields;

const OccupationForm = MrForm<OccupationFormFields, OccupationFormOutput>((form, onSuccess) => {
            const {register, watch, setValue, getValues, formState: { errors }} = form;

            const postal = String(watch('postalCode') ?? '');
            const citySuggestions = usePostalSuggestions(postal);

            // helper to apply a postal 'match' record to form values (voivodeship, district)
            function applyPostalMatch(match: any | undefined) {
                if (!match) return;
                const voiv = match.wojewodztwo ?? (typeof match.wojewodztwo === 'object' ? match.wojewodztwo.name : undefined);
                if (voiv) setValue('voivodeship', voiv);

                const powiat = match.powiat;
                const key = normalizeName(powiat);
                const foundNr = districtLookup.get(key);
                if (foundNr) setValue('parliament_voting_district', String(foundNr));
            }

            // Auto-fill when postal resolves to a single city and the user hasn't entered a city yet.
            React.useEffect(() => {
                const code = String(postal ?? '').trim();
                const postalRegex = /^\d{2}-\d{3}$/;
                if (!postalRegex.test(code)) return;
                const currentCity = String(getValues().city ?? '').trim();
                if (currentCity) return; // don't override user input

                let mounted = true;
                fetchRepresentativePostalMatch(code).then(rep => {
                    if (!mounted || !rep) return;
                    // apply city + voivodeship + district
                    const cityName = (rep.miejscowosc ?? rep.nazwa ?? rep.name ?? rep.gmina ?? '').toString();
                    if (cityName) setValue('city', cityName);
                    applyPostalMatch(rep);
                }).catch(() => {}).finally(() => {});

                return () => { mounted = false; };
            }, [postal]);


    return {
        onSubmit: () => {
            const formValues = getValues();

            onSuccess({
                postalCode: formValues.postalCode,
                city: formValues.city,
                street_name_and_number: formValues.street_name_and_number,
                voivodeship: formValues.voivodeship,
                parliament_voting_district: formValues.parliament_voting_district,
            });
        },
        node: <>
            <Grid container>
                <Grid size={6}>
                    <MrField label="Kod pocztowy" maxLength={6} fieldError={errors.postalCode}>
                        <TextField {...register("postalCode", {
                            required: true,
                        })} />
                    </MrField>
                </Grid>
                <Grid size={6}>
                    <MrField label="Miasto">
                        <TextField {...register("city", {required: true})}/>
                    </MrField>
                </Grid>
                {citySuggestions.length > 0 && (
                    <Grid size={12}>
                        <List dense>
                            {citySuggestions.map(cs => (
                                <ListItemButton
                                    key={cs}
                                    onClick={() => {
                                        // set the chosen city immediately
                                        setValue('city', cs);
                                        const code = String(getValues().postalCode || '').trim();
                                        if (!code) return;

                                        getPostalData(code)
                                            .then((results) => {
                                                const match = results.find((r: any) => {
                                                    const name = (r.miejscowosc ?? r.nazwa ?? r.name ?? r.gmina ?? '').toString();
                                                    return name === cs;
                                                });
                                                applyPostalMatch(match);
                                            })
                                            .catch(() => {});
                                    }}
                                >
                                    <ListItemText primary={cs} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Grid>
                )}
            </Grid>
            <MrField label="Województwo">
                <TextField {...register("voivodeship", {required: true})}/>
            </MrField>
            <MrField label="Ulica i numer domu/mieszkania">
                <TextField {...register("street_name_and_number", {required: true})}/>
            </MrField>

            <MrField label="Okręg wyborczy do Sejmu RP">
                <TextField {...register("parliament_voting_district", {required: true})}/>
            </MrField>
        </>
    }
});

export default OccupationForm;