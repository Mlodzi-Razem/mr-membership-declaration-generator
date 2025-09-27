import type {Control, ControllerProps} from 'react-hook-form';
import {Controller} from 'react-hook-form';
import {Autocomplete, type SxProps, TextField, type Theme} from '@mui/material';

export type MrAutocompleteProps = {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: Control<any>;
    rules?: ControllerProps['rules'];
    defaultValue?: string;
    options: string[];
    label?: string;
    value?: string;
    inputProps?: Record<string, unknown>;
    onSelect?: (value: string) => void;
    clearOnEscape?: boolean;
    sx?: SxProps<Theme>;
    disabled?: boolean;
};

export default function MrAutocomplete({
    name,
    control,
    rules,
    defaultValue = '',
    options,
    label,
    inputProps,
    onSelect,
    clearOnEscape = true,
    value,
    sx,
    disabled
}: Readonly<MrAutocompleteProps>) {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            defaultValue={defaultValue}
            render={({field, fieldState}) => (
                <Autocomplete
                    options={options}
                    clearOnEscape={clearOnEscape}
                    sx={sx}
                    value={value ?? (field.value ?? null)}
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
                            label={label}
                            error={Boolean(fieldState.error)}
                            helperText={fieldState.error?.message}
                            variant={disabled ? 'filled' : 'outlined'}
                            {...(inputProps ?? {})}
                        />
                    )}
                />
            )}
        />
    );
}
