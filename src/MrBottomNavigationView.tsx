import {Stack} from "@mui/material";
import MrBottomNavigation, {type MrBottomNavigationProps} from "./MrBottomNavigation.tsx";
import * as React from "react";
import {memo} from "react";

export type MrBottomNavigationViewProps = Readonly<React.PropsWithChildren<MrBottomNavigationProps>>;

export const MrBottomNavigationView = memo((
    {
        children,
        onBack,
        activeStep,
        isMobile,
        nextButtonEnabled,
    }: MrBottomNavigationViewProps) => {
    return <Stack spacing={2} justifyContent="space-between" style={{height: '100%'}}>
        {children}
        <MrBottomNavigation onBack={onBack}
                            activeStep={activeStep}
                            isMobile={isMobile}
                            nextButtonEnabled={nextButtonEnabled}/>
    </Stack>
});
export default MrBottomNavigationView;