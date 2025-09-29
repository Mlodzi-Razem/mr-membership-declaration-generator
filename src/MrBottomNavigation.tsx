import {Button, Grid, MobileStepper} from "@mui/material";
import {memo} from "react";
import {StepperLabels} from "./MrStepper.tsx";

export type MrBottomNavigationProps = Readonly<{
    onBack?: () => void,
    activeStep: number,
    isMobile: boolean,
    nextButtonEnabled: boolean,
}>;

const MrBottomNavigation = memo((
    {
        onBack,
        activeStep,
        isMobile,
        nextButtonEnabled
    }: MrBottomNavigationProps) => {
    const submitButton = <Button type="submit" color="primary" disabled={!nextButtonEnabled}>Dalej</Button>;
    const backButton = <Button type="button" color="error" onClick={onBack}>
        {activeStep === 0 ? 'Wyczyść' : 'Wstecz'}
    </Button>;

    return <>
        {isMobile && <MobileStepper backButton={backButton}
                                    activeStep={activeStep}
                                    nextButton={submitButton}
                                    steps={StepperLabels.length}
                                    variant='dots'/>}
        {!isMobile &&
            <Grid container justifyContent="space-between">
                <Grid>
                    {backButton}
                </Grid>
                <Grid>
                    {submitButton}
                </Grid>
            </Grid>}</>;
});

export default MrBottomNavigation;