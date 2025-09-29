import {CircularProgress, Stack, Typography} from "@mui/material";
import {memo} from "react";
import styles from "./FullContainerSpinner.module.less";

const FullContainerSpinner = memo(({label}: Readonly<{ label: string }>) => {
    return <div className={styles.container}>
        <Stack spacing={2} alignItems='center'>
            <CircularProgress/>
            <Typography variant='caption'>{label}</Typography>
        </Stack>
    </div>
});
export default FullContainerSpinner;