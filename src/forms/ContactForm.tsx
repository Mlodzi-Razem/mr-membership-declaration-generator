import MrForm from "./MrForm.tsx";
import MrField from "./MrField.tsx";
import {Grid, TextField} from "@mui/material";
import useIsMobile from "../hooks/useIsMobile.ts";
import valid from 'validator';
import MrAutocomplete from "./MrAutocomplete.tsx";

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

const emailValidator = (email: string) => {
    return valid.isEmail(email, {allow_display_name: true, allow_underscores: true, ignore_max_length: true});
}

const phoneNumberValidator = (phoneNumber: string) => {
    const noSpaces = phoneNumber.replaceAll(' ', '');

    return valid.isMobilePhone(noSpaces, 'pl-PL');
}

const ContactForm = MrForm<ContactFormFields, ContactFormOutput>('contact', (form, onSuccess) => {
    const {register, watch, getValues, formState: {errors}} = form;
    const isMobile = useIsMobile();

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
                <Grid size={isMobile ? 12 : 6}>
                    <MrField label="Imię w dowodzie" fieldError={errors.formalName}>
                        <TextField {...register("formalName", {required: true})}/>
                    </MrField>
                </Grid>
                <Grid size={isMobile ? 12 : 6}>
                    <MrField label="Nazwisko w dowodzie" fieldError={errors.formalLastName}>
                        <TextField {...register("formalLastName", {required: true})}/>
                    </MrField>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={isMobile ? 12 : 6}>
                    <MrField label="Imię preferowane" fieldError={errors.preferredName}>
                        <TextField {...register(
                            "preferredName",
                            {required: false}
                        )} placeholder={currentValues.formalName}/>
                    </MrField>
                </Grid>
                <Grid size={isMobile ? 12 : 6}>
                    <MrField label="Nazwisko preferowane" fieldError={errors.preferredLastName}>
                        <TextField {...register(
                            "preferredLastName",
                            {required: false}
                        )} placeholder={currentValues.formalLastName}/>
                    </MrField>
                </Grid>
            </Grid>

            <MrField label="Zaimki" fieldError={errors.pronouns}>
                <MrAutocomplete name={'pronouns'}
                                control={form.control}
                                options={['on/jego', 'ona/jej', 'ono/jego', 'onu/jenu']}
                                inputProps={register("pronouns", {required: false})}/>
            </MrField>
            <MrField label="Adres e-mail" fieldError={errors.email}>
                <TextField {...register("email", {required: true, validate: emailValidator})}/>
            </MrField>
            <MrField label="Numer telefonu" fieldError={errors.phoneNumber}>
                <TextField {...register("phoneNumber", {required: true, validate: phoneNumberValidator})}/>
            </MrField>
        </>
    };
});
export default ContactForm;