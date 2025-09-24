import MrForm from "./MrForm.tsx";
import MrField from "./MrField.tsx";
import {Checkbox, Grid, List, ListItem, ListItemIcon, TextField, Tooltip, Typography} from "@mui/material";
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';

type GdprConsentFormProps = { isMinor: boolean }
type GdprConsentFormFields =
    {
        publishingImageConsent: boolean;
        processingDataConsent: boolean; //required
        parentName: string;
    }
export type GdprConsentFormOutput = GdprConsentFormFields;

const GdprConsentForm = MrForm<GdprConsentFormFields, GdprConsentFormOutput, GdprConsentFormProps>('gdpr-consent', (form, onSuccess, {isMinor}) => {
        const {register, getValues} = form;
        return {
            onSubmit: () => {
                const values = getValues();
                onSuccess(values)
            },
            node: <Grid container>
                <Grid size={6}>
                    <Typography variant='h5'>Wyrażam zgodę na:</Typography>
                    <List style={{width: '100%'}}>
                        <ListItem>
                            <ListItemIcon>
                                <ArrowCircleRightIcon/>
                            </ListItemIcon>
                            <MrField label={<>utrwalenie i publikację mojego wizerunku na stronach internetowych,
                                w prasie, w mediach społecznościowych przez Stowarzyszenie.</>}>
                                <Checkbox {...register("publishingImageConsent")}/>
                            </MrField>
                        </ListItem>
                        <Tooltip title='Wymagane'>
                            <ListItem>
                                <ListItemIcon>
                                    <ArrowCircleRightIcon color='info'/>
                                </ListItemIcon>
                                <MrField
                                    label={<>
                                        przetwarzanie moich danych osobowych obejmujących dane szczególnej kategorii, w tym
                                        dotyczące preferowanego imienia, nazwiska, płci i poglądów politycznych.
                                    </>}>
                                    <Checkbox {...register("processingDataConsent", {required: true})} />
                                </MrField>
                            </ListItem>
                        </Tooltip>
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
                </Grid>
            </Grid>

        }
    }
);

export default GdprConsentForm;

