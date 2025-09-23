import {Step, StepLabel, Stepper} from "@mui/material";

export default function MrStepper({activeStep}: Readonly<{ activeStep: number }>) {
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