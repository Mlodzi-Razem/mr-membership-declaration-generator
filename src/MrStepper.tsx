import { Step, StepLabel, Stepper } from "@mui/material";
import type { PeselFormOutput } from "./forms/PeselForm.tsx";
import type { ContactFormOutput } from "./forms/ContactForm.tsx";
import type { OccupationFormOutput } from "./forms/AddressForm.tsx";
import type { GDPRConsentFormOutput } from "./forms/GDPRConsentForm.tsx";

export default function MrStepper({activeStep}: {
    activeStep: number,
    peselOutput: PeselFormOutput | null,
    contactOutput: ContactFormOutput | null,
    occupationOutput: OccupationFormOutput | null,
    gdpr_consentOutput : GDPRConsentFormOutput | null
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
            <StepLabel>Zgoda na przetwarzanie danych osobowych</StepLabel>
        </Step>
        <Step>
            <StepLabel>Pobierz pliki</StepLabel>
        </Step>
    </Stepper>;
}