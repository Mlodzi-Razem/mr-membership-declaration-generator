import PeselForm from "./forms/PeselForm.tsx";

function App() {
    return (
        <>
            <PeselForm onSuccess={console.log}/>
        </>
    )
}

export default App
