import MrForm from "./MrForm.tsx";
import MrField from "./MrField.tsx";
import { Grid, Checkbox, ListItemText} from "@mui/material";
import { TextField } from "@mui/material";

type GDPRConsentFormProps = {isMinor : boolean | undefined}
 type GDPRConsentFormFields = 
{
    PublishingImageConsent: boolean;
    ProcessingDataConsent: boolean; //required
    ParentName: string;
}
export type GDPRConsentFormOutput = GDPRConsentFormFields;

const GDPRConsentForm = MrForm<GDPRConsentFormFields, GDPRConsentFormOutput, GDPRConsentFormProps>((form, onSuccess, isMinor) => {
    const {register, getValues} = form;
    console.log(isMinor?.isMinor);
    return {
        onSubmit: () => {
            const values = getValues();
            onSuccess({
            ...values,
            })
            },
node: <>
<Grid container>
    <Grid size={6}>
        <ListItemText >Wyrażam zgodę na:</ListItemText>
        <MrField label="utrwalenie i publikację mojego wizerunku na stronach
internetowych, w prasie, w mediach społecznościowych
przez Stowarzyszenie.">
    
    <Checkbox {...register("PublishingImageConsent")}/>
        </MrField>
        <MrField label="przetwarzanie moich danych osobowych obejmujących dane
szczególnej kategorii, w tym dotyczące preferowanego imienia,
nazwiska, płci i poglądów politycznych.">
            <Checkbox {...register("ProcessingDataConsent", {required:true})}/>
        </MrField>
        {isMinor?.isMinor ? (       // due to the fact that this is general object, it's quirky as this.
        <MrField label="Imię i nazwisko rodzica">
            <TextField
                {...register("ParentName", { required: true })}
                variant="outlined"
                fullWidth
            />
        </MrField>
        ):<></>}
    </Grid>
</Grid>
</>
        }
    }
);

export default GDPRConsentForm;

