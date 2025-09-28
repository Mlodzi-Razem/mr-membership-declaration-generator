import {Controller, type FieldValues, useFormContext} from "react-hook-form";
import {Autocomplete, FormControl, FormLabel, TextField} from "@mui/material";
import type {BaseProps} from "./base-props.ts";

export type MrAutocompleteProps<F extends FieldValues> = Readonly<{
    options: string[];
    onSelect?: (value: string) => void;
    validate?: (value: string) => boolean | string | Promise<boolean | string>;
}> & BaseProps<F>;

export default function MrAutocompleteM<F extends FieldValues>(
    {
        fieldName,
        options,
        label,
        onSelect,
        disabled,
        required,
        validate
    }: MrAutocompleteProps<F>) {
    const {control, register, formState: {errors}} = useFormContext();

    return <FormControl error={!!errors[fieldName]} style={{width: '100%'}}>
        <FormLabel>{label}</FormLabel>
        <Controller
            name={fieldName}
            control={control}
            render={({field, fieldState}) => (
                <Autocomplete
                    options={options}
                    clearOnEscape={true}
                    style={{width: '100%'}}
                    value={field.value ?? null}
                    onChange={(_e, value) => {
                        field.onChange(value ?? '');
                        if (onSelect) {
                            onSelect(value ?? '');
                        }
                    }}
                    disabled={disabled}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            inputRef={field.ref}
                            disabled={disabled}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            variant={disabled ? 'filled' : 'outlined'}
                            {...register(fieldName, {required, validate: validate})}
                            style={{width: '100%'}}
                            onSelect={(_e) => {
                                const value = (_e.target as never as {value: string}).value;
                                field.onChange(value ?? '');
                                if (onSelect) {
                                    onSelect(value ?? '');
                                }
                            }}
                        />
                    )}
                />
            )}
        />
    </FormControl>;
}