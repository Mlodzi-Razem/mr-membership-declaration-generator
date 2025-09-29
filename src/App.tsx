import {Grid} from "@mui/material";
import {lazy, Suspense, useState} from "react";
import MrStepper from "./MrStepper.tsx";
import styles from "./App.module.less"
import useIsMobile from "./hooks/useIsMobile.ts";
import FullContainerSpinner from "./FullContainerSpinner.tsx";

const AppForms = lazy(() => import('./AppForms.tsx'));

function App() {
    const isMobile = useIsMobile();
    const [activeStep, setActiveStep] = useState(0);

    return <div className={styles.container}>
        <Grid container spacing={2} className={styles.gridStyle}>
            {!isMobile && <Grid size={4}>
                <div className={styles.stepperContainer}>
                    <MrStepper activeStep={activeStep}/>
                </div>
            </Grid>}
            <Grid size={isMobile ? 12 : 8}>
                <Suspense fallback={<FullContainerSpinner label='Pobieranie danych'/>}>
                    <AppForms activeStep={activeStep} setActiveStep={setActiveStep}/>
                </Suspense>
            </Grid>
        </Grid>
    </div>;
}

export default App;
