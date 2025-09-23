import PeselForm, { type PeselFormOutput } from "./forms/PeselForm.tsx";
import { CssBaseline, Grid } from "@mui/material";
import { useState } from "react";
import MrStepper from "./MrStepper.tsx";
import ContactForm, { type ContactFormOutput } from "./forms/ContactForm.tsx";
import AddressForm, { type OccupationFormOutput } from "./forms/AddressForm.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function ShowIf({step, equalTo, children}: { step: number, equalTo: number, children: React.ReactNode }) {
    return <div style={{display: step === equalTo ? 'block' : 'none', width: '100%', height: '100%'}}>
        {children}
    </div>
}

function App() {
    const [activeStep, setActiveStep] = useState(0);
    const [peselOutput, setPeselOutput] = useState<PeselFormOutput | null>(null);
    const [contactOutput, setContactOutput] = useState<ContactFormOutput | null>(null);
    const [occupationOutput, setOccupationOutput] = useState<OccupationFormOutput | null>(null);
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <div style={{
                width: '100%',
                height: '110vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <CssBaseline/>

                <Grid container spacing={2} style={{width: '100%', maxWidth: '60rem'}}>
                    <Grid size={4}>
                        <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <MrStepper activeStep={activeStep}
                                       peselOutput={peselOutput}
                                       contactOutput={contactOutput}
                                       occupationOutput={occupationOutput}/>
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
                                setOccupationOutput(output);
                                if (peselOutput?.requiresParentalConsent) {
                                    setActiveStep(3);
                                } else {
                                    setActiveStep(4);
                                }
                            }} onBack={() => setActiveStep(1)}/>
                        </ShowIf>
                    </Grid>
                </Grid>
            </div>
        </QueryClientProvider>
    )
}

export default App
