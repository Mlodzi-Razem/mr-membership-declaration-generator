import {Step, StepLabel, Stepper} from "@mui/material";

const StepperLabels = [
    'Data urodzenia i PESEL',
    'Dane kontaktowe',
    'Miejsce zamieszkania i okręg',
    'Zgoda na przetwarzanie danych osobowych',
    'Pobierz pliki'
] as const;

export default function MrStepper({activeStep, orientation}: Readonly<{ activeStep: number, orientation: 'vertical' | 'horizontal' }>) {
    return <Stepper activeStep={activeStep} orientation={orientation} alternativeLabel={orientation === 'horizontal'}>
        {StepperLabels.map(label => <Step key={label}>
            <StepLabel>{label}</StepLabel>
        </Step>)}
    </Stepper>;
}