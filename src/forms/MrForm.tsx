import { type FieldValues, useForm, type UseFormReturn } from "react-hook-form";
import * as React from "react";
import { Button, Grid, Stack } from "@mui/material";

export interface MrFormDescription {
    onSubmit: () => void;
    node: React.ReactNode;
}

export type FormDescriptionSupplier<F extends FieldValues, O, AdditionalProps extends object | undefined = undefined> = (
    form: UseFormReturn<F>,
    onSuccess: (output: O) => void,
    additionalProps?: AdditionalProps       // CHANGE HERE
) => MrFormDescription;

export type MrFormBaseProps<O, AdditionalProps> = {
  onSuccess: (output: O) => void;
  onBack?: () => void;
} & (AdditionalProps extends undefined ? object : AdditionalProps);

export default function MrForm<F extends FieldValues, O, AdditionalProps extends object | undefined>(formDescSupplier: FormDescriptionSupplier<F, O, AdditionalProps>) {
    return (props: { onSuccess: (output: O) => void, onBack?: () => void, additionalProps?: AdditionalProps}) => { // CHANGE HERE
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const form = useForm<F>();
        const {onSubmit, node} = formDescSupplier(form, props.onSuccess, props.additionalProps);    // CHANGE HERE

        return <form onSubmit={form.handleSubmit(onSubmit)} style={{height: '100%'}}>
            <Stack spacing={2} justifyContent="space-between" style={{height: '100%'}}>
                <Stack spacing={2}>
                    {node}
                </Stack>

                <Grid container justifyContent="space-between">
                    <Grid>
                        <Button type="button"
                                color="error"
                                disabled={!form.formState.isReady}
                                onClick={() => props.onBack ? props.onBack() : form.reset()}>Wstecz</Button>
                    </Grid>
                    <Grid>
                        <Button type="submit" color="primary" disabled={!form.formState.isValid}>Dalej</Button>
                    </Grid>
                </Grid>

            </Stack>
        </form>;
    }
}