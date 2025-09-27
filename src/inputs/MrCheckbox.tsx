import {Controller, type FieldValues, useFormContext} from "react-hook-form";
import type {BaseProps} from "./base-props.ts";
import {Checkbox, FormControl, FormControlLabel} from "@mui/material";

export type MrCheckboxProps<F extends FieldValues> = BaseProps<F>;

export default function MrCheckbox<F extends FieldValues>({fieldName, label, required, disabled}: MrCheckboxProps<F>) {
    const {control} = useFormContext<F>();

    return <Controller rules={{required}}
        render={({field, fieldState}) => {
            const checkbox = <Checkbox {...field}
                                       checked={!!field.value}
                                       onChange={e => field.onChange(e.target.checked ? true : undefined)}/>

            return <FormControl error={!!fieldState.error} style={{width: '100%'}}>
                <FormControlLabel control={checkbox}
                                  label={label}
                                  required={required}
                                  disabled={disabled}/>
            </FormControl>
        }}
        name={fieldName}
        control={control}/>

}