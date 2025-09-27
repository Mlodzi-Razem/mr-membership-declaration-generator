import {type FieldValues, useFormContext, type Validate} from "react-hook-form";
import {FormControl, FormLabel, TextField} from "@mui/material";
import type {BaseProps} from "./base-props.ts";

export type MrTextInputProps<F extends FieldValues> = Readonly<{
    placeholder?: string,
    validate?: Validate<string, F>,
    onInput?: (value: string) => void,
}> & BaseProps<F>;

export default function MrTextInput<F extends FieldValues>(
    {
        fieldName,
        required,
        validate,
        disabled,
        onInput,
        label,
        placeholder
    }: MrTextInputProps<F>
) {
    const {register, formState: {errors}} = useFormContext<F>();

    const tfOnSelect = (e: { target: { value: string } }) => onInput?.(e.target.value);

    return <FormControl style={{width: '100%'}} error={!!errors[fieldName]}>
        <FormLabel>{label}</FormLabel>
        <TextField {...register(fieldName, {required, validate})}
                   disabled={disabled}
                   error={!!errors[fieldName]}
                   helperText={errors[fieldName]?.message as string}
                   variant={disabled ? 'filled' : 'outlined'}
                   onInput={tfOnSelect as never}
                   placeholder={placeholder}/>
    </FormControl>
}