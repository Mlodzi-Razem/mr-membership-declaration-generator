import {lazy} from "react";
import useStorageValue from "./useStorageValue.ts";
import {type PeselFormOutput} from "./forms/PeselForm.tsx";
import {type ContactFormOutput} from "./forms/ContactForm.tsx";
import {type AddressFormOutput} from "./forms/AddressForm.tsx";
import {type GdprConsentFormOutput} from "./forms/GdprConsentForm.tsx";

const PeselForm = lazy(() => import('./forms/PeselForm.tsx'));
const ContactForm = lazy(() => import('./forms/ContactForm.tsx'));
const AddressForm = lazy(() => import('./forms/AddressForm.tsx'));
const GdprConsentForm = lazy(() => import('./forms/GdprConsentForm.tsx'));

const DownloadFilesView = lazy(() => import("./DownloadFilesView.tsx"));

export const AppForms = ({activeStep, setActiveStep}: {
    activeStep: number,
    setActiveStep: (step: number) => void
}) => {
    const [storageState, setStorageState] = useStorageValue<{
        peselOutput?: PeselFormOutput,
        contactOutput?: ContactFormOutput,
        addressOutput?: AddressFormOutput,
        gdprFormOutput?: GdprConsentFormOutput,
    }>('appFormsValues', {});
    const {peselOutput, gdprFormOutput, contactOutput, addressOutput} = storageState;

    return <>
        {activeStep === 0 &&
            <PeselForm onSuccess={output => {
                setStorageState({...storageState, peselOutput: output});
                setActiveStep(1);
            }} activeStep={activeStep}/>
        }

        {activeStep === 1 &&
            <ContactForm onSuccess={output => {
                setStorageState({...storageState, contactOutput: output});
                setActiveStep(2);
            }} onBack={() => setActiveStep(0)} activeStep={activeStep}/>
        }

        {activeStep === 2 &&
            <AddressForm onSuccess={output => {
                setStorageState({...storageState, addressOutput: output});
                setActiveStep(3);
            }} onBack={() => setActiveStep(1)} activeStep={activeStep}/>
        }

        {activeStep === 3 &&
            <GdprConsentForm onSuccess={output => {
                setStorageState({...storageState, gdprFormOutput: output});
                setActiveStep(4)
            }} onBack={() => {
                setActiveStep(2);
            }} additionalProps={{isMinor: !!peselOutput?.requiresParentalConsent}} activeStep={activeStep}/>
        }

        {activeStep === 4 &&
            <DownloadFilesView context={{
                peselOutput: peselOutput!,
                contactOutput: contactOutput!,
                addressOutput: addressOutput!,
                gdprFormOutput: gdprFormOutput!
            }}/>
        }
    </>;
};

export default AppForms;