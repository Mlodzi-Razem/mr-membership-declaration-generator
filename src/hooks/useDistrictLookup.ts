import {useMemo} from "react";
import {parliament_district} from "../parliament-district.ts";

function normalizeName(s: string): string {
    if (!s) {
        return '';
    }

    return s.toLowerCase().trim();
}

export default function useDistrictLookup(): Map<string, number> {
    return useMemo(() => {
        const entries = parliament_district.flatMap(d =>
            [d.powiat, d.miastaPrawaPow].flat()
                                        .map(normalizeName)
                                        .filter(p => p.length > 0)
                                        .map(p => [p, d.nr] as const)
        );

        return new Map(entries);
    }, [])
}