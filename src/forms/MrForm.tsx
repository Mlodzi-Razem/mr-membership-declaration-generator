/* eslint-disable react-hooks/rules-of-hooks */
import {type FieldValues, useForm, type UseFormReturn} from "react-hook-form";
import * as React from "react";
import {useEffect, useRef} from "react";
import {Button, Grid, Stack} from "@mui/material";
import useFormPersist from "react-hook-form-persist";

export interface MrFormDescription {
    onSubmit: () => void;
    node: React.ReactNode;
}

export type FormDescriptionSupplier<F extends FieldValues, O, AdditionalProps> = (
    form: UseFormReturn<F>,
    onSuccess: (output: O) => void,
    additionalProps: AdditionalProps
) => MrFormDescription;

export type MrFormBaseProps<O, AdditionalProps> = {
    onSuccess: (output: O) => void;
    onBack?: () => void;
} & (AdditionalProps extends undefined
    ? { additionalProps?: AdditionalProps }
    : { additionalProps: AdditionalProps });

function useTriggerFormOnResize<F extends FieldValues, TFieldValues>(formRef: React.RefObject<HTMLFormElement | null>, form: UseFormReturn<F, unknown, TFieldValues>) {
    useEffect(() => {
        if (formRef.current) {
            const {width: initialWidth, height: initialHeight} = formRef.current.getBoundingClientRect();
            const resizeObserver = new ResizeObserver(([resizedForm]) => {
                const currentBoundingRect = resizedForm.target.getBoundingClientRect();
                if (currentBoundingRect.width !== initialWidth || currentBoundingRect.height !== initialHeight) {
                    form.trigger();
                }
            });
            resizeObserver.observe(formRef.current);
            return () => resizeObserver.disconnect();
        }
    }, [formRef, form]);
}

export default function MrForm<F extends FieldValues, O, AdditionalProps = undefined>(formKey: string, formDescSupplier: FormDescriptionSupplier<F, O, AdditionalProps>) {
    return (props: MrFormBaseProps<O, AdditionalProps>) => {
        const form = useForm<F>({mode: 'all',});

        useFormPersist(formKey, {
            watch: form.watch,
            setValue: form.setValue,
            storage: window.sessionStorage
        });

        const formRef = useRef<HTMLFormElement>(null);
        useTriggerFormOnResize(formRef, form);

        const {onSubmit, node} = formDescSupplier(form, props.onSuccess, props.additionalProps as AdditionalProps);

        return <form onSubmit={form.handleSubmit(onSubmit)} style={{height: '100%'}} ref={formRef}>
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