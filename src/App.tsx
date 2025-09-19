import PeselForm from "./forms/PeselForm.tsx";
import { CssBaseline } from "@mui/material";

function App() {
    return (
        <>
            <CssBaseline/>
            <PeselForm onSuccess={console.log}/>
        </>
    )
}

export default App
