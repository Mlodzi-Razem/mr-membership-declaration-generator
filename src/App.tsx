import PeselForm, {type PeselFormOutput} from "./forms/PeselForm.tsx";
import {CssBaseline, Grid, Stack} from "@mui/material";
import {useState} from "react";
import MrStepper from "./MrStepper.tsx";
import ContactForm, {type ContactFormOutput} from "./forms/ContactForm.tsx";
import {AddressForm, type AddressFormOutput} from "./forms/AddressForm.tsx";
import {QueryClient} from "@tanstack/react-query";
import GdprConsentForm, {type GdprConsentFormOutput} from "./forms/GdprConsentForm.tsx";
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client'
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister'
import DownloadFilesView from "./DownloadFilesView.tsx";
import styles from "./App.module.css"
import useIsMobile from "./queries/useIsMobile.ts";
import useStorageValue from "./useStorageValue.ts";

const HOURS_24_MILLIS = 24 * 60 * 60 * 1000;
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: HOURS_24_MILLIS
        }
    }
});

const storagePersister = createAsyncStoragePersister({
    storage: window.localStorage,
    key: 'mr-membership-declaration-generator-query',
})

const AppForms = ({activeStep, setActiveStep}: { activeStep: number, setActiveStep: (step: number) => void }) => {
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
            }}/>
        }

        {activeStep === 1 &&
            <ContactForm onSuccess={output => {
                setStorageState({...storageState, contactOutput: output});
                setActiveStep(2);
            }} onBack={() => setActiveStep(0)}/>
        }

        {activeStep === 2 &&
            <AddressForm onSuccess={output => {
                setStorageState({...storageState, addressOutput: output});
                setActiveStep(3);
            }} onBack={() => setActiveStep(1)}/>
        }

        {activeStep === 3 &&
            <GdprConsentForm onSuccess={output => {
                setStorageState({...storageState, gdprFormOutput: output});
                setActiveStep(4)
            }} onBack={() => {
                setActiveStep(2);
            }} additionalProps={{isMinor: !!peselOutput?.requiresParentalConsent}}/>
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
}

function App() {
    const isMobile = useIsMobile();
    const [activeStep, setActiveStep] = useState(0);


    const formsFragment = <AppForms activeStep={activeStep} setActiveStep={setActiveStep}/>

    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{persister: storagePersister}}>
            <div className={styles.container}>
                <CssBaseline/>
                <Grid container spacing={2} style={{width: '100%', maxWidth: '80rem'}}>
                    {!isMobile && <Grid size={4}>
                        <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <MrStepper activeStep={activeStep} orientation='vertical'/>
                        </div>
                    </Grid>}
                    <Grid size={isMobile ? 12 : 8}>
                        {isMobile && <Stack spacing={2}>
                            {formsFragment}
                            <MrStepper activeStep={activeStep} orientation={'horizontal'}/>
                        </Stack>}
                        {!isMobile && formsFragment}
                    </Grid>
                </Grid>
            </div>
        </PersistQueryClientProvider>
    )
}

export default App;
