import MrForm from "./MrForm.tsx";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    ListItem,
    Stack,
    Typography
} from "@mui/material";
import Inputs from "../inputs/Inputs.ts";
import {useId, useState} from "react";

const {MrCheckbox, MrTextInput} = Inputs<GdprConsentFormFields>();

type GdprConsentFormProps = { isMinor: boolean }
type GdprConsentFormFields = {
    publishingImageConsent?: boolean;
    processingDataConsent?: boolean
    parentName?: string;
};
export type GdprConsentFormOutput = {
    publishingImageConsent: boolean;
    processingDataConsent: boolean
    parentName: string;
};

function NoPublishingConsentDialog({open, close, proceed}: Readonly<{
    open: boolean,
    close: () => void,
    proceed: () => void
}>) {
    const titleId = useId();
    const descriptionId = useId();

    return <Dialog
        open={open}
        onClose={close}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
    >
        <DialogTitle id={titleId}>
            Brak zaznaczonej zgody na utrwalanie i publikację wizerunku
        </DialogTitle>
        <DialogContent>
            <DialogContentText id={descriptionId}>
                Zgoda na utrwalanie i publikację wizerunku nie jest niezbędna, jednak utrudnia ona działanie w
                Stowarzyszeniu.
                <br/><br/>
                Jeżeli nie wyrazisz zgody, twoim obowiązkiem będzie informowanie Zarządu Okręgu przed każdym
                wydarzeniem, że nie można publikować twoich zdjęć w mediach społecznościowych.
                Często chodzimy razem na demonstracje, marsze, spotykamy się na zebraniach okręgu i integracjach. Z
                reguły robimy wtedy zdjęcia, które potem są publikowane na Instagramie, Facebooku i innych mediach
                społecznościowych.
                <br/><br/>
                <span style={{fontWeight: 'bold'}}>Czy na pewno chcesz odmówić zgody na publikację wizerunku?</span>
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={close} color='error'>Nie</Button>
            <Button onClick={() => {
                close();
                proceed();
            }} color='primary'>Tak</Button>
        </DialogActions>
    </Dialog>
}

const GdprConsentForm = MrForm<GdprConsentFormFields, GdprConsentFormOutput, GdprConsentFormProps>('gdpr-consent-form', (form, onSuccess, {isMinor}) => {
        const {getValues} = form;

        const [dialogOpen, setDialogOpen] = useState(false);

        const succeed = (values: GdprConsentFormFields) => {
            onSuccess({
                processingDataConsent: !!values.processingDataConsent,
                publishingImageConsent: !!values.publishingImageConsent,
                parentName: (values.parentName ?? '').trim()
            });
        };

        return {
            onSubmit: () => {
                const values = getValues();

                if (values.publishingImageConsent) {
                    succeed(values);
                } else {
                    setDialogOpen(true);
                }
            },
            node: <>
                <NoPublishingConsentDialog open={dialogOpen}
                                           close={() => setDialogOpen(false)}
                                           proceed={() => succeed(getValues())}/>
                <Stack spacing={2}>
                    <Typography variant='h5'>Wyrażam zgodę na:</Typography>
                    <List>
                        <ListItem>
                            <MrCheckbox fieldName='publishingImageConsent'
                                        label={'utrwalenie i publikację mojego wizerunku na stronach internetowych, w prasie i w mediach społecznościowych przez Stowarzyszenie.'}/>
                        </ListItem>
                        <ListItem>
                            <MrCheckbox fieldName='processingDataConsent'
                                        label={'przetwarzanie moich danych osobowych obejmujących dane szczególnej kategorii, w tym dotyczące preferowanego imienia, nazwiska, płci i poglądów politycznych.'}
                                        required/>
                        </ListItem>
                    </List>

                    {isMinor &&
                        <MrTextInput fieldName='parentName' label='Imię i nazwisko rodzica/opiekuna prawnego' required/>
                    }
                </Stack>
            </>
        }
    }
);

export default GdprConsentForm;

