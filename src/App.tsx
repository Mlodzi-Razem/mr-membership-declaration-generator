import PeselForm, {type PeselFormOutput} from "./forms/PeselForm.tsx";
import {CssBaseline, Grid} from "@mui/material";
import * as React from "react";
import {useState} from "react";
import MrStepper from "./MrStepper.tsx";
import ContactForm, {type ContactFormOutput} from "./forms/ContactForm.tsx";
import AddressForm, {type AddressFormOutput} from "./forms/AddressForm.tsx";
import {QueryClient} from "@tanstack/react-query";
import GdprConsentForm, {type GdprConsentFormOutput} from "./forms/GdprConsentForm.tsx";
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client'
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister'
import DownloadFilesView from "./DownloadFilesView.tsx";
import "./App.css"

function ShowIf({step, equalTo, children}: Readonly<{ step: number, equalTo: number, children: React.ReactNode }>) {
    const display = step === equalTo ? 'block' : 'none';

    return <div style={{display, width: '100%', height: '100%'}}>
        {children}
    </div>
}

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

function App() {
    const [activeStep, setActiveStep] = useState(0);
    const [peselOutput, setPeselOutput] = useState<PeselFormOutput | null>(null);
    const [contactOutput, setContactOutput] = useState<ContactFormOutput | null>(null);
    const [addressOutput, setAddressOutput] = useState<AddressFormOutput | null>(null);
    const [gdprFormOutput, setGdprFormOutput] = useState<GdprConsentFormOutput | null>(null);
    const allFormsFilled = peselOutput && contactOutput && addressOutput && gdprFormOutput;
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{persister: storagePersister}}>
            <div style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }} className="container">
                <CssBaseline/>
                <img src="src/assets/logo.png" alt="Logo Młodych Razem" className="site-logo"/>
                <Grid container spacing={2} style={{width: '100%', maxWidth: '60rem'}}>
                    <Grid size={4}>
                        <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <MrStepper activeStep={activeStep}/>
                        </div>
                    </Grid>
                    <Grid size={8}>
                        <ShowIf step={activeStep} equalTo={0}>
                            <PeselForm onSuccess={output => {
                                setPeselOutput(output);
                                setActiveStep(1);
                            }}/>
                        </ShowIf>

                        <ShowIf step={activeStep} equalTo={1}>
                            <ContactForm onSuccess={output => {
                                setContactOutput(output);
                                setActiveStep(2);
                            }} onBack={() => setActiveStep(0)}/>
                        </ShowIf>

                        <ShowIf step={activeStep} equalTo={2}>
                            <AddressForm onSuccess={output => {
                                setAddressOutput(output);
                                setActiveStep(3);
                            }} onBack={() => setActiveStep(1)}/>
                        </ShowIf>

                        <ShowIf step={activeStep} equalTo={3}>
                            <GdprConsentForm onSuccess={output => {
                                setGdprFormOutput(output);
                                setActiveStep(4)
                            }} onBack={() => {
                                setActiveStep(2);
                            }} additionalProps={{isMinor: !!peselOutput?.requiresParentalConsent}}/>
                        </ShowIf>

                        {activeStep === 4 && allFormsFilled &&
                            <DownloadFilesView context={{
                                peselOutput,
                                contactOutput,
                                addressOutput,
                                gdprFormOutput
                            }}/>
                        }
                    </Grid>
                </Grid>

            </div>
        </PersistQueryClientProvider>
    )
}

export default App;
