import {CssBaseline, Grid} from "@mui/material";
import {lazy, Suspense, useState} from "react";
import MrStepper from "./MrStepper.tsx";
import {QueryClient} from "@tanstack/react-query";
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client'
import styles from "./App.module.less"
import useIsMobile from "./hooks/useIsMobile.ts";
import createIndexedDBPersister from "./createIndexedDBPersister.ts";
import DocumentsPrefetcher from "./DocumentsPrefetcher.tsx";
import FullContainerSpinner from "./FullContainerSpinner.tsx";

const AppForms = lazy(() => import('./AppForms.tsx'));

const storagePersister = createIndexedDBPersister('mr-membership-declaration-generator-queries');
const queryClient = new QueryClient();

function App() {
    const isMobile = useIsMobile();
    const [activeStep, setActiveStep] = useState(0);

    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{persister: storagePersister}}>
            <DocumentsPrefetcher/>
            <CssBaseline/>

            <div className={styles.container}>
                <Grid container spacing={2} style={{width: '100%', maxWidth: '80rem', height: '100%'}}>
                    {!isMobile && <Grid size={4}>
                        <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <MrStepper activeStep={activeStep}/>
                        </div>
                    </Grid>}
                    <Grid size={isMobile ? 12 : 8}>
                        <Suspense fallback={<FullContainerSpinner label='Pobieranie danych'/>}>
                            <AppForms activeStep={activeStep} setActiveStep={setActiveStep}/>
                        </Suspense>
                    </Grid>
                </Grid>
            </div>
        </PersistQueryClientProvider>
    )
}

export default App;
