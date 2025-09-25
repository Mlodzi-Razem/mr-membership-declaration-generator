import type {FieldError} from "react-hook-form";
import {Checkbox, FormControl, FormControlLabel, FormLabel, Select, TextField} from "@mui/material";
import * as React from "react";

export default function MrField({label, fieldError, children}: Readonly<{
    fieldError?: FieldError,
    children: React.ReactElement<typeof TextField | typeof Checkbox | typeof Select>,
    label: React.ReactNode
}>) {
    if (!children) {
        throw new Error("MrField must have children");
    }

    const isCheckbox = children.type === Checkbox;

    return <FormControl error={!!fieldError} style={{width: '100%'}}>
        {!isCheckbox && <FormLabel>{label}</FormLabel>}
        {isCheckbox
            ? <FormControlLabel control={children} label={label}/>
            : React.cloneElement(
                children,
                {error: !!fieldError, helperText: fieldError?.message} as never
            )}
    </FormControl>
}

// brought the original version, no need for changes in MrField since the MrAutocomplete.tsx was created