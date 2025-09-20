import PeselForm, { type PeselFormOutput } from "./forms/PeselForm.tsx";
import { CssBaseline, Grid } from "@mui/material";
import { useState } from "react";
import MrStepper from "./MrStepper.tsx";
import ContactForm, { type ContactFormOutput } from "./forms/ContactForm.tsx";

function App() {
    const [activeStep, setActiveStep] = useState(0);
    const [peselOutput, setPeselOutput] = useState<PeselFormOutput | null>(null);
    const [contactOutput, setContactOutput] = useState<ContactFormOutput | null>(null);

    return (
        <div style={{width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <CssBaseline/>

            <Grid container spacing={2} style={{width: '100%', maxWidth: '60rem'}}>
                <Grid size={4}>
                    <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <MrStepper activeStep={activeStep} peselOutput={peselOutput}/>
                    </div>
                </Grid>
                <Grid size={8}>
                    {activeStep === 0 &&
                        <PeselForm onSuccess={output => {
                            setPeselOutput(output);
                            setActiveStep(1);
                        }}/>
                    }

                    {activeStep === 1 &&
                        <ContactForm onSuccess={output => {
                            setContactOutput(output);
                            setActiveStep(2);
                        }}/>
                    }
                </Grid>
            </Grid>
        </div>
    )
}

export default App
