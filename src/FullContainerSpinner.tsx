import {CircularProgress, Stack, Typography} from "@mui/material";

export default function FullContainerSpinner({label}: Readonly<{ label: string }>) {
    return <div style={{
        width: '100%',
        height: '100%',
        display: "flex",
        alignItems: 'center',
        justifyContent: 'center',
        justifyItems: 'center',
        alignContent: 'center'
    }}>
        <Stack spacing={2} alignItems='center'>
            <CircularProgress/>
            <Typography variant='caption'>{label}</Typography>
        </Stack>
    </div>
}