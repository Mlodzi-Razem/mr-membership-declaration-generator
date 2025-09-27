import {parliament_district} from "../parliament-district.ts";

function normalizeName(s: string): string {
    if (!s) {
        return '';
    }

    return s.normalize('NFKD').toLowerCase().trim();
}

const entries = parliament_district.flatMap(d =>
    [d.powiat, d.miastaPrawaPow].flat()
        .map(normalizeName)
        .filter(p => p.length > 0)
        .map(p => [p, d.nr] as const)
);

const lookupMap = new Map<string, number>(entries);

const DistrictLookup = {
    get(name: string) {
        return lookupMap.get(normalizeName(name));
    }
}
export default function useDistrictLookup(): typeof DistrictLookup {
    return DistrictLookup;
}