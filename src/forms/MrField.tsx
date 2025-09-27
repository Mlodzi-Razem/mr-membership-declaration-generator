import type {FieldError} from "react-hook-form";
import {
    Checkbox,
    type CheckboxProps,
    FormControl,
    FormControlLabel,
    FormLabel,
    Select,
    type SelectProps,
    TextField,
    type TextFieldProps,
    type TextFieldVariants
} from "@mui/material";
import * as React from "react";
import MrAutocomplete, {type MrAutocompleteProps} from "./MrAutocomplete.tsx";

export default function MrField({label, fieldError, children}: Readonly<{
    fieldError?: FieldError,
    children: React.ReactElement<TextFieldProps | CheckboxProps | SelectProps | MrAutocompleteProps, typeof TextField | typeof Checkbox | typeof Select | typeof MrAutocomplete>,
    label: React.ReactNode
}>) {
    if (!children) {
        throw new Error("MrField must have children");
    }

    const isCheckbox = children.type === Checkbox;
    const isAutocomplete = children.type === MrAutocomplete;

    const child = isAutocomplete
        ? children
        : React.cloneElement(
            children,
            {
                error: !!fieldError,
                helperText: fieldError?.message,
                variant: (children.props.disabled ? 'filled' : 'outlined') as TextFieldVariants
            } as never
        );

    return <FormControl error={!!fieldError} style={{width: '100%'}}>
        {!isCheckbox && <FormLabel>{label}</FormLabel>}
        {isCheckbox
            ? <FormControlLabel control={children} label={label} />
            : child}
    </FormControl>
}

// brought the original version, no need for changes in MrField since the MrAutocomplete.tsx was created