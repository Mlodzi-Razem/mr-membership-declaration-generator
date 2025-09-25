import {Step, StepLabel, Stepper} from "@mui/material";

export const StepperLabels = [
    'Data urodzenia i PESEL',
    'Dane kontaktowe',
    'Miejsce zamieszkania i okręg',
    'Zgoda na przetwarzanie danych osobowych',
    'Pobierz pliki'
] as const;

export default function MrStepper({activeStep}: Readonly<{ activeStep: number}>) {
    return <Stepper activeStep={activeStep} orientation='vertical'>
        {StepperLabels.map(label => <Step key={label}>
            <StepLabel>{label}</StepLabel>
        </Step>)}
    </Stepper>;
}