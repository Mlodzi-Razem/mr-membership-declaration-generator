/* eslint-disable react-hooks/rules-of-hooks */
import {type FieldValues, FormProvider, useForm, type UseFormReturn} from "react-hook-form";
import * as React from "react";
import {useRef} from "react";
import {Stack} from "@mui/material";
import useFormPersist from "react-hook-form-persist";
import useIsMobile from "../hooks/useIsMobile.ts";
import MrBottomNavigationView from "../MrBottomNavigationView.tsx";

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


        return <form onSubmit={form.handleSubmit(onSubmit)} style={{height: '100%'}} ref={formRef}>
            <FormProvider {...form}>
                <MrBottomNavigationView isMobile={isMobile}
                                        onBack={props.onBack}
                                        activeStep={props.activeStep}
                                        nextButtonEnabled={form.formState.isValid}>
                    <Stack spacing={2}>
                        {node}
                    </Stack>
                </MrBottomNavigationView>
            </FormProvider>
        </form>;
    }
}