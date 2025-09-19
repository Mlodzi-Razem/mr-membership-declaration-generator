import { FormControl, FormHelperText, FormLabel } from "@mui/joy";
import type { FieldError } from "react-hook-form";

export default function Field({label, fieldError, children}: {fieldError?: FieldError, children: React.ReactNode, label: string}) {
    return  <FormControl error={!!fieldError}>
        <FormLabel>{label}</FormLabel>
        {children}
        {fieldError && <FormHelperText>
            {fieldError.message}
        </FormHelperText>}
    </FormControl>
}