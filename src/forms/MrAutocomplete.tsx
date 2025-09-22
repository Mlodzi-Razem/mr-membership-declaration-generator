import type { Control, ControllerProps } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';

export type MrAutocompleteProps<T = string> = {
  name: string;
  control: Control<any>;
  rules?: ControllerProps['rules'];
  defaultValue?: any;
  options: T[];
  label?: string;
  value?: string;
  inputProps?: Record<string, any>;
  onSelect?: (value: T) => void;
  clearOnEscape?: boolean;
  sx?: any;
  disabled?: boolean;
};

export default function MrAutocomplete<T = string>({
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
}: MrAutocompleteProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <Autocomplete 
          options={options}
          clearOnEscape={clearOnEscape}
          sx={sx}
          value={value !== undefined ? value : (field.value ?? null)}
          onChange={(_e, value) => {
            field.onChange(value ?? '');
            if (onSelect && value !== null && value !== undefined) {
              onSelect(value as T);
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
              {...(inputProps ?? {})}
            />
          )}
        />
      )}
    />
  );
}
