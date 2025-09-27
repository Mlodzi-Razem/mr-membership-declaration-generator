/* eslint-disable react-hooks/rules-of-hooks */
import {type FieldValues, useForm, type UseFormReturn} from "react-hook-form";
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

export type FormDescriptionSupplier<F extends FieldValues, O, AdditionalProps> = (
    form: UseFormReturn<F>,
    onSuccess: (output: O) => void,
    additionalProps: AdditionalProps
) => MrFormDescription;

export type MrFormBaseProps<O, AdditionalProps> = {
    onSuccess: (output: O) => void;
    onBack?: () => void;
    activeStep: number
} & (AdditionalProps extends undefined
    ? { additionalProps?: AdditionalProps }
    : { additionalProps: AdditionalProps });

export default function MrForm<F extends FieldValues, O, AdditionalProps = undefined>(formKey: string, formDescSupplier: FormDescriptionSupplier<F, O, AdditionalProps>) {
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

        const {onSubmit, node} = formDescSupplier(form, props.onSuccess, props.additionalProps as AdditionalProps);

        const submitButton = <Button type="submit" color="primary" disabled={!form.formState.isValid}>Dalej</Button>;
        const backButton = <Button type="button"
                                   color="error"
                                   onClick={() => props.onBack ? props.onBack() : form.reset()}>
            {props.activeStep === 0 ? 'Wyczyść' : 'Wstecz'}
        </Button>;
        const bottomNavigation = <>{isMobile && <MobileStepper backButton={backButton}
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
            <Stack spacing={2} justifyContent="space-between" style={{height: '100%'}}>
                <Stack spacing={2}>
                    {node}
                </Stack>

                {bottomNavigation}
            </Stack>
        </form>;
    }
}