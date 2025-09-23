import MrForm from "./MrForm.tsx";
import MrField from "./MrField.tsx";
import { Grid, TextField } from "@mui/material";

type ContactFormFields = {
    formalName: string;
    formalLastName: string;
    preferredName: string;
    preferredLastName: string;
    pronouns: string;
    email: string;
    phoneNumber: string;
};
export type ContactFormOutput = ContactFormFields;

const isBlank = (s: string): boolean => !s || s.trim() === '';

const ContactForm = MrForm<ContactFormFields, ContactFormOutput>((form, onSuccess) => {
    const {register, watch, getValues} = form;

    const currentValues = watch();

    return {
        onSubmit: () => {
            const formValues = getValues();

            onSuccess({
                ...formValues,
                preferredName: isBlank(formValues.preferredName) ? formValues.formalName : formValues.preferredName,
                preferredLastName: isBlank(formValues.preferredLastName) ? formValues.formalLastName : formValues.preferredLastName
            });
        },
        node: <>
            <Grid container spacing={2}>
                <Grid size={6}>
                    <MrField label="Imię w dowodzie">
                        <TextField {...register("formalName", {required: true})}/>
                    </MrField>
                </Grid>
                <Grid size={6}>
                    <MrField label="Nazwisko w dowodzie">
                        <TextField {...register("formalLastName", {required: true})}/>
                    </MrField>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={6}>
                    <MrField label="Imię preferowane">
                        <TextField {...register(
                            "preferredName",
                            {required: false}
                        )} placeholder={currentValues.formalName}/>
                    </MrField>
                </Grid>
                <Grid size={6}>
                    <MrField label="Nazwisko preferowane">
                        <TextField {...register(
                            "preferredLastName",
                            {required: false}
                        )} placeholder={currentValues.formalLastName}/>
                    </MrField>
                </Grid>
            </Grid>

            <MrField label="Zaimki">
                <TextField {...register("pronouns", {required: false})}/>
            </MrField>
            <MrField label="Adres e-mail">
                <TextField {...register("email", {required: true})}/>
            </MrField>
            <MrField label="Numer telefonu">
                <TextField {...register("phoneNumber", {required: true})}/>
            </MrField>
        </>
    };
});
export default ContactForm;