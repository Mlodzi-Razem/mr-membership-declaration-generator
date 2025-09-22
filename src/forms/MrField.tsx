import type { FieldError } from "react-hook-form";
import { Checkbox, FormControl, FormHelperText, FormLabel, Select, TextField } from "@mui/material";
import * as React from "react";

export default function MrField({label, fieldError, children, inputProps, maxLength, minLength}: {
    fieldError?: FieldError,
    children: React.ReactElement<typeof TextField | typeof Checkbox | typeof Select>,
    label: string,
    inputProps?: Record<string, unknown>,
    maxLength?: number,
    minLength?: number,
}) {
    if (!children) {
        throw new Error("MrField must have children");
    }

    const requiresHelperText = children.type === Checkbox;

    return <FormControl error={!!fieldError}>
        <FormLabel>{label}</FormLabel>
        {requiresHelperText
            ? children
            : React.cloneElement(
                children,
                ({
                    error: !!fieldError,
                    helperText: fieldError?.message,
                    inputProps: {
                        ...(typeof (children.props as any).inputProps === 'object' ? (children.props as any).inputProps : {}),
                        ...(inputProps ?? {}),
                        ...(maxLength !== undefined ? { maxLength } : {}),
                        ...(minLength !== undefined ? { minLength } : {}),
                    }
                }) as never
            )}
        {fieldError && requiresHelperText && <FormHelperText>{fieldError.message}</FormHelperText>}
    </FormControl>
}