import PeselForm, {type PeselFormOutput} from "./forms/PeselForm.tsx";
import {Backdrop, CircularProgress, CssBaseline, Grid} from "@mui/material";
import {useState} from "react";
import MrStepper from "./MrStepper.tsx";
import ContactForm, {type ContactFormOutput} from "./forms/ContactForm.tsx";
import AddressForm, {type AddressFormOutput} from "./forms/AddressForm.tsx";
import {QueryClient, useIsFetching} from "@tanstack/react-query";
import GdprConsentForm, {type GdprConsentFormOutput} from "./forms/GdprConsentForm.tsx";
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client'
import DownloadFilesView from "./DownloadFilesView.tsx";
import styles from "./App.module.less"
import useIsMobile from "./hooks/useIsMobile.ts";
import useStorageValue from "./useStorageValue.ts";
import createIndexedDBPersister from "./createIndexedDBPersister.ts";

const storagePersister = createIndexedDBPersister('mr-membership-declaration-generator-queries');

const queryClient = new QueryClient();

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
            }} />
        }
    </>;
}

function App() {
    const isMobile = useIsMobile();
    const isLoading = useIsFetching() > 0;
    const [activeStep, setActiveStep] = useState(0);

    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{persister: storagePersister}}>
            <CssBaseline/>
            <Backdrop open={isLoading}
                      sx={(theme) => ({color: '#fff', zIndex: theme.zIndex.drawer + 1})}>
                <CircularProgress color='inherit'/>
            </Backdrop>
            <div className={styles.container}>
                <Grid container spacing={2} style={{width: '100%', maxWidth: '80rem', height: '100%'}}>
                    {!isMobile && <Grid size={4}>
                        <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <MrStepper activeStep={activeStep}/>
                        </div>
                    </Grid>}
                    <Grid size={isMobile ? 12 : 8}>
                        <AppForms activeStep={activeStep} setActiveStep={setActiveStep}/>
                    </Grid>
                </Grid>
            </div>
        </PersistQueryClientProvider>
    )
}

export default App;
