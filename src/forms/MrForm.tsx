import { type FieldValues, useForm, type UseFormReturn } from "react-hook-form";
import * as React from "react";
import { Button, Stack } from "@mui/material";

export interface MrFormDescription {
    onSubmit: () => void;
    node: React.ReactNode;
}

export type FormDescriptionSupplier<F extends FieldValues, O> = (
    form: UseFormReturn<F>,
    onSuccess: (output: O) => void
) => MrFormDescription;

export default function MrForm<F extends FieldValues, O>(formDescSupplier: FormDescriptionSupplier<F, O>) {
    return (props: { onSuccess: (output: O) => void, onBack?: () => void }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const form = useForm<F>();
        const {onSubmit, node} = formDescSupplier(form, props.onSuccess);

        return <form onSubmit={form.handleSubmit(onSubmit)} style={{height: '100%'}}>
            <Stack spacing={2} justifyContent='space-between' style={{height: '100%'}}>
                <Stack spacing={2}>
                    {node}
                </Stack>
                <Button type="button" color="error" disabled={!form.formState.isReady} onClick={() => props.onBack ? props.onBack() : form.reset()}>Wstecz</Button>
                <Button type="submit" color="primary" disabled={!form.formState.isValid}>Dalej</Button>
            </Stack>
        </form>;
    }
}