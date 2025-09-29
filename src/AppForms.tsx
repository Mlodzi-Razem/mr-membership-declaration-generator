import * as React from "react";
import {lazy, useCallback} from "react";
import useStorageValue from "./useStorageValue.ts";
import {type PeselFormOutput} from "./forms/PeselForm.tsx";
import {type ContactFormOutput} from "./forms/ContactForm.tsx";
import {type AddressFormOutput} from "./forms/AddressForm.tsx";
import {type GdprConsentFormOutput} from "./forms/GdprConsentForm.tsx";
import type {DownloadFilesContext} from "./hooks/useFillDocumentsFunctions.tsx";

const PeselForm = lazy(() => import('./forms/PeselForm.tsx'));
const ContactForm = lazy(() => import('./forms/ContactForm.tsx'));
const AddressForm = lazy(() => import('./forms/AddressForm.tsx'));
const GdprConsentForm = lazy(() => import('./forms/GdprConsentForm.tsx'));

const DownloadFilesView = lazy(() => import("./DownloadFilesView.tsx"));

export const AppForms = ({activeStep, setActiveStep}: {
    activeStep: number,
    setActiveStep: React.Dispatch<React.SetStateAction<number>>
}) => {
    const [storageState, setStorageState] = useStorageValue<{
        peselOutput?: PeselFormOutput,
        contactOutput?: ContactFormOutput,
        addressOutput?: AddressFormOutput,
        gdprFormOutput?: GdprConsentFormOutput,
    }>('appFormsValues', {});
    const {peselOutput, gdprFormOutput, contactOutput, addressOutput} = storageState;

    const onBack = useCallback(() => {
        setActiveStep(x => x - 1);
    }, [setActiveStep]);

    const goNext = useCallback((data: Partial<DownloadFilesContext>) => {
        setStorageState({...storageState, ...data});
        setActiveStep(x => x + 1);
    }, [setStorageState, storageState, setActiveStep]);

    return <>
        {activeStep === 0 &&
            <PeselForm onSuccess={output => {
                goNext({peselOutput: output});
            }} activeStep={activeStep}/>
        }

        {activeStep === 1 &&
            <ContactForm onSuccess={output => {
                goNext({contactOutput: output});
            }} onBack={onBack} activeStep={activeStep}/>
        }

        {activeStep === 2 &&
            <AddressForm onSuccess={output => {
                goNext({addressOutput: output});
            }} onBack={onBack} activeStep={activeStep}/>
        }

        {activeStep === 3 &&
            <GdprConsentForm
                onSuccess={output => {
                    goNext({gdprFormOutput: output});
                }}
                onBack={onBack}
                activeStep={activeStep}
                additionalProps={{isMinor: !!peselOutput?.requiresParentalConsent}}/>
        }

        {activeStep === 4 &&
            <DownloadFilesView
                context={{
                    peselOutput: peselOutput!,
                    contactOutput: contactOutput!,
                    addressOutput: addressOutput!,
                    gdprFormOutput: gdprFormOutput!
                }}
                activeStep={activeStep}
                onBack={onBack}/>
        }
    </>;
};

export default AppForms;