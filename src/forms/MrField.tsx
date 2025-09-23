import type { FieldError } from "react-hook-form";
import { Checkbox, FormControl, FormHelperText, FormLabel, Select, TextField } from "@mui/material";
import * as React from "react";

export default function MrField({label, fieldError, children}: {
    fieldError?: FieldError,
    children: React.ReactElement<typeof TextField | typeof Checkbox | typeof Select>,
    label: string
}) {
    if (!children) {
        throw new Error("MrField must have children");
    }

    const requiresHelperText = children.type === Checkbox;

    return <FormControl error={!!fieldError} style={{width: '100%'}}>
        <FormLabel>{label}</FormLabel>
        {requiresHelperText
            ? children
            : React.cloneElement(
                children,
                {error: !!fieldError, helperText: fieldError?.message} as never
            )}
        {fieldError && requiresHelperText && <FormHelperText>{fieldError.message}</FormHelperText>}
    </FormControl>
}

// brought the original version, no need for changes in MrField since the MrAutocomplete.tsx was created