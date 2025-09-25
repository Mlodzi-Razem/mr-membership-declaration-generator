/* eslint-disable react-hooks/rules-of-hooks */
import {type FieldValues, useForm, type UseFormReturn} from "react-hook-form";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {Button, Grid, MobileStepper, Stack} from "@mui/material";
import useFormPersist from "react-hook-form-persist";
import useIsMobile from "../queries/useIsMobile.ts";
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
} & (AdditionalProps extends undefined
    ? { additionalProps?: AdditionalProps }
    : { additionalProps: AdditionalProps });

function useTriggerOnFormReload<T extends FieldValues>(form: UseFormReturn<T, unknown, T>) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (Object.keys(form.getValues()).length > 0 && !isInitialized) {
            form.trigger();
        }

        if (!isInitialized) {
            setIsInitialized(true);
        }
    }, [form, form.formState, isInitialized, setIsInitialized]);
}

export default function MrForm<F extends FieldValues, O, AdditionalProps = undefined>(formKey: string, formDescSupplier: FormDescriptionSupplier<F, O, AdditionalProps>) {
    return (props: MrFormBaseProps<O, AdditionalProps>) => {
        const form = useForm<F>({mode: 'all',});
        const isMobile = useIsMobile();

        useFormPersist(formKey, {
            watch: form.watch,
            setValue: form.setValue,
            storage: window.sessionStorage
        });
        useTriggerOnFormReload(form);

        const formRef = useRef<HTMLFormElement>(null);

        const {onSubmit, node} = formDescSupplier(form, props.onSuccess, props.additionalProps as AdditionalProps);

        const submitButton = <Button type="submit" color="primary" disabled={!form.formState.isValid}>Dalej</Button>;

        const backButton = <Button type="button"
                                   color="error"
                                   disabled={!form.formState.isValid}
                                   onClick={() => props.onBack ? props.onBack() : form.reset()}>Wstecz</Button>;
        return <form onSubmit={form.handleSubmit(onSubmit)} style={{height: '100%'}} ref={formRef}>
            <Stack spacing={2} justifyContent="space-between" style={{height: '100%'}}>
                <Stack spacing={2}>
                    {node}
                </Stack>

                {isMobile && <MobileStepper backButton={backButton}
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
                    </Grid>}

            </Stack>
        </form>;
    }
}