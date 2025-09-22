import type { FieldError, Control, ControllerProps } from "react-hook-form";
import { Checkbox, FormControl, FormHelperText, FormLabel, Select, TextField, Autocomplete } from "@mui/material";
import { Controller } from 'react-hook-form';
import * as React from "react";

type InputChildren = React.ReactElement<typeof TextField | typeof Checkbox | typeof Select | typeof Autocomplete>;

export default function MrField({
    label,
    fieldError,
    children,
    inputProps,
    // optional controller wiring — when provided MrField will render Controller internally
    controller,
}: {
    fieldError?: FieldError,
    children: InputChildren,
    label: string,
    inputProps?: Record<string, unknown>,
    controller?: {
        name: string,
        control: Control<any>,
        rules?: ControllerProps['rules'],
        defaultValue?: any,
    }
}) {
    if (!children) {
        throw new Error("MrField must have children");
    }

    const requiresHelperText = children.type === Checkbox;
    const isAutocomplete = (children.type === Autocomplete);

    // Helper to clone the child and inject error/helperText and inputProps when appropriate
    function cloneWithFieldProps(propsToMerge: Record<string, unknown> = {}) {
        return React.cloneElement(children, ({
            error: !!fieldError,
            helperText: fieldError?.message,
            ...(isAutocomplete ? {} : { inputProps: {
                ...(typeof (children.props as any).inputProps === 'object' ? (children.props as any).inputProps : {}),
                ...(inputProps ?? {}),
            }}),
            ...propsToMerge,
        }) as never);
    }

    // If no controller requested, keep previous behavior
    if (!controller) {
        return <FormControl error={!!fieldError}>
            <FormLabel>{label}</FormLabel>
            {requiresHelperText ? children : cloneWithFieldProps()}
            {fieldError && requiresHelperText && <FormHelperText>{fieldError.message}</FormHelperText>}
        </FormControl>;
    }

    // When controller is provided, render Controller and map its render props into the child
    const { name, control, rules, defaultValue } = controller;

    return (
        <FormControl error={!!fieldError}>
            <FormLabel>{label}</FormLabel>
            <Controller
                name={name}
                control={control}
                rules={rules}
                defaultValue={defaultValue}
                render={({ field, fieldState }) => {
                    // For Autocomplete we must pass value/onChange differently (value is string)
                    if (isAutocomplete) {
                        return React.cloneElement(children, ({
                            value: field.value ?? '',
                            onChange: (_e: any, v: any) => field.onChange(v ?? ''),
                            // keep MUI props separate from field props
                            ...(children.props ?? {}),
                        }) as never);
                    }

                    // Default: pass field props to the input (TextField/select-like)
                    return cloneWithFieldProps({
                        ...field,
                        // ensure ref is wired for react-hook-form
                        inputRef: field.ref,
                        // reflect validation state
                        error: Boolean(fieldState.error) || !!fieldError,
                        helperText: fieldState.error?.message ?? fieldError?.message,
                    });
                }}
            />
            {fieldError && requiresHelperText && <FormHelperText>{fieldError.message}</FormHelperText>}
        </FormControl>
    );
}