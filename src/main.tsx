import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css'

import App from './App.tsx'
import {QueryClient} from '@tanstack/react-query';
import {PersistQueryClientProvider} from "@tanstack/react-query-persist-client";
import createIndexedDBPersister from "./createIndexedDBPersister.ts";
import DocumentsPrefetcher from "./DocumentsPrefetcher.tsx";
import {CssBaseline} from "@mui/material";

const queryClient = new QueryClient();
const storagePersister = createIndexedDBPersister('mr-membership-declaration-generator-queries');

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PersistQueryClientProvider client={queryClient} persistOptions={{persister: storagePersister}}>
            <DocumentsPrefetcher/>
            <CssBaseline/>
            <App/>
        </PersistQueryClientProvider>
    </StrictMode>,
)
