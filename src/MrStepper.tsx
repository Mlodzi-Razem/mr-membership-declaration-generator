import { Step, StepLabel, Stepper } from "@mui/material";
import type { PeselFormOutput } from "./forms/PeselForm.tsx";
import type { ContactFormOutput } from "./forms/ContactForm.tsx";
import type { OccupationFormOutput } from "./forms/AddressForm.tsx";

export default function MrStepper({activeStep, peselOutput}: {
    activeStep: number,
    peselOutput: PeselFormOutput | null,
    contactOutput: ContactFormOutput | null,
    occupationOutput: OccupationFormOutput | null
}) {
    return <Stepper activeStep={activeStep} orientation="vertical">
        <Step>
            <StepLabel>Data urodzenia i PESEL</StepLabel>
        </Step>
        <Step>
            <StepLabel>Dane kontaktowe</StepLabel>
        </Step>
        <Step>
            <StepLabel>Miejsce zamieszkania i okręg</StepLabel>
        </Step>
        <Step>
            <StepLabel>
                <span style={{textDecoration: peselOutput?.requiresParentalConsent ? 'none' : 'line-through'}}>
                    (Tylko małoletni) Zgoda rodzica
                </span>
            </StepLabel>
        </Step>
        <Step>
            <StepLabel>Zgoda na przetwarzanie danych osobowych</StepLabel>
        </Step>
    </Stepper>;
}