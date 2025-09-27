/* eslint-disable react-hooks/rules-of-hooks */
import {type FieldValues, FormProvider, useForm, type UseFormReturn} from "react-hook-form";
import * as React from "react";
import {useRef} from "react";
import {Button, Grid, MobileStepper, Stack} from "@mui/material";
import useFormPersist from "react-hook-form-persist";
import useIsMobile from "../hooks/useIsMobile.ts";
import {StepperLabels} from "../MrStepper.tsx";

export interface MrFormDescription {
    onSubmit: () => void;
    node: React.ReactNode;
}

export type FormDescriptionSupplier<F extends FieldValues, O extends object, AdditionalProps> = (
    form: UseFormReturn<F>,
    onSuccess: (output: O) => void,
    additionalProps: AdditionalProps
) => MrFormDescription;

export type MrFormBaseProps<O extends object, AdditionalProps> = {
    onSuccess: (output: O) => void;
    onBack?: () => void;
    activeStep: number
} & (AdditionalProps extends undefined
    ? { additionalProps?: AdditionalProps }
    : { additionalProps: AdditionalProps });

function trimStringFields<O extends object>(fields: O): O {
    return Object.fromEntries(Object.entries(fields).map(([key, value]) => {
        if (typeof value === 'string') {
            return [key, value.trim()] as const;
        }
        return [key, value] as const;
    })) as O;
}

export default function MrForm<F extends FieldValues, O extends object, AdditionalProps = undefined>(formKey: string, formDescSupplier: FormDescriptionSupplier<F, O, AdditionalProps>) {
    return (props: MrFormBaseProps<O, AdditionalProps>) => {
        const form = useForm<F>({mode: 'all'});
        const isMobile = useIsMobile();

        useFormPersist(formKey, {
            watch: form.watch,
            setValue: form.setValue,
            storage: window.sessionStorage,
            validate: true
        });

        const formRef = useRef<HTMLFormElement>(null);

        const {
            onSubmit,
            node
        } = formDescSupplier(form, values => props.onSuccess(trimStringFields(values)), props.additionalProps as AdditionalProps);

        const submitButton = <Button type="submit" color="primary" disabled={!form.formState.isValid}>Dalej</Button>;
        const backButton = <Button type="button"
                                   color="error"
                                   onClick={() => props.onBack ? props.onBack() : form.reset()}>
            {props.activeStep === 0 ? 'Wyczyść' : 'Wstecz'}
        </Button>;
        const bottomNavigation = <>
            {isMobile && <MobileStepper backButton={backButton}
                                        activeStep={props.activeStep}
                                        nextButton={submitButton}
                                        steps={StepperLabels.length}
                                        variant='dots'/>}
            {!isMobile &&
                <Grid container justifyContent="space-between">
                    <Grid>
                        {backButton}
                    </Grid>
                    <Grid>
                        {submitButton}
                    </Grid>
                </Grid>}</>;

        return <form onSubmit={form.handleSubmit(onSubmit)} style={{height: '100%'}} ref={formRef}>
            <FormProvider {...form}>
                <Stack spacing={2} justifyContent="space-between" style={{height: '100%'}}>
                    <Stack spacing={2}>
                        {node}
                    </Stack>

                    {bottomNavigation}
                </Stack>
            </FormProvider>
        </form>;
    }
}