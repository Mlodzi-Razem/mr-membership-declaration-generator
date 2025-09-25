import MrForm from "./MrForm.tsx";
import MrField from "./MrField.tsx";
import {Checkbox, List, ListItem, ListItemIcon, Stack, TextField, Tooltip, Typography} from "@mui/material";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

type GdprConsentFormProps = { isMinor: boolean }
type GdprConsentFormFields = {
    publishingImageConsent: string;
    processingDataConsent: string
    parentName: string;
};
export type GdprConsentFormOutput = {
    publishingImageConsent: boolean;
    processingDataConsent: boolean
    parentName: string;
};

const GdprConsentForm = MrForm<GdprConsentFormFields, GdprConsentFormOutput, GdprConsentFormProps>('gdpr-consent', (form, onSuccess, {isMinor}) => {
        const {register, getValues, watch} = form;
        const publishingImageConsent = watch('publishingImageConsent');
        const processingDataConsent = watch('processingDataConsent');

        return {
            onSubmit: () => {
                const values = getValues();
                onSuccess({
                    processingDataConsent: values.processingDataConsent === 'true',
                    publishingImageConsent: values.publishingImageConsent === 'true',
                    parentName: values.parentName
                })
            },
            node: <Stack spacing={2}>
                <Typography variant='h5'>Wyrażam zgodę na:</Typography>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <KeyboardArrowRightIcon/>
                        </ListItemIcon>
                        <MrField label={<>utrwalenie i publikację mojego wizerunku na stronach internetowych,
                            w prasie, w mediach społecznościowych przez Stowarzyszenie.</>}>
                            <Checkbox value={publishingImageConsent}  {...register("publishingImageConsent")}/>
                        </MrField>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <KeyboardArrowRightIcon/>
                        </ListItemIcon>
                        <Tooltip title='Wymagane'>
                            <MrField
                                label={<>
                                    przetwarzanie moich danych osobowych obejmujących dane szczególnej kategorii, w tym
                                    dotyczące preferowanego imienia, nazwiska, płci i poglądów politycznych.
                                </>}>
                                <Checkbox
                                    value={processingDataConsent} {...register("processingDataConsent", {required: true})} />
                            </MrField>
                        </Tooltip>
                    </ListItem>
                </List>

                {isMinor &&
                    <MrField label="Imię i nazwisko rodzica lub opiekuna">
                        <TextField
                            {...register("parentName", {required: true})}
                            variant="outlined"
                            fullWidth
                        />
                    </MrField>
                }
            </Stack>

        }
    }
);

export default GdprConsentForm;

