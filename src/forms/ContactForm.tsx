import MrForm from "./MrForm.tsx";
import {Grid} from "@mui/material";
import useIsMobile from "../hooks/useIsMobile.ts";
import valid from 'validator';
import Inputs from "../inputs/Inputs.ts";

const {MrTextInput, MrAutocomplete} = Inputs<ContactFormFields>();

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
    const noSpaces = phoneNumber.replaceAll(/\s/g, '');

    return valid.isMobilePhone(noSpaces, 'pl-PL');
}

const ContactForm = MrForm<ContactFormFields, ContactFormOutput>('contact', (form, onSuccess) => {
    const {watch, getValues} = form;
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
                    <MrTextInput fieldName='formalName' label='Imię w dowodzie' required/>
                </Grid>
                <Grid size={isMobile ? 12 : 6}>
                    <MrTextInput fieldName='formalLastName' label='Nazwisko w dowodzie' required/>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid size={isMobile ? 12 : 6}>
                    <MrTextInput fieldName='preferredName'
                                 label='Imię preferowane'
                                 placeholder={currentValues.formalName}/>
                </Grid>
                <Grid size={isMobile ? 12 : 6}>
                    <MrTextInput fieldName='preferredLastName'
                                 label='Nazwisko preferowane'
                                 placeholder={currentValues.formalLastName}/>
                </Grid>
            </Grid>

            <MrAutocomplete fieldName='pronouns'
                            label='Zaimki'
                            options={['on/jego', 'ona/jej', 'ono/jego', 'onu/jenu']}/>
            <MrTextInput fieldName='email'
                         label='Adres e-mail'
                         validate={emailValidator}
                         required/>
            <MrTextInput fieldName='phoneNumber'
                         label='Numer telefonu'
                         validate={phoneNumberValidator}
                         required/>
        </>
    };
});
export default ContactForm;