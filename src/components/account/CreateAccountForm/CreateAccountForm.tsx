import React from 'react';
import { Flex, Button, Heading } from '@chakra-ui/react';
import { Form, withFormik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import UsernameField from '../UsernameField/UsernameField';
import PasswordField from '../PasswordField/PasswordField';
import PasswordConfirmField from '../PasswordConfirmField/PasswordConfirmField';
import StudyLangField from '../StudyLangField/StudyLangField';
import DisplayLangField from '../DisplayLangField/DisplayLangField';

export interface CreateAccountFormValues {
    username: string;
    password: string;
    passwordConfirm: string;
    studyLang: string | undefined;
    displayLang: string | undefined;
}

type CreateAccountFormProps = CreateAccountFormValues;

const InnerForm = (props: FormikProps<CreateAccountFormValues>) => {
    const { t } = useTranslation('account');
    const { isSubmitting } = props;
    return (
        <Form>
            <Heading fontSize="2xl" mb="5">
                {t('create-an-account')}
            </Heading>

            <UsernameField name="username" hasInfo={true} />

            <Flex direction="row" width="100%">
                <PasswordField name="password" hasInfo={true} />
                <PasswordConfirmField name="passwordConfirm" />
            </Flex>

            <StudyLangField name="studyLang" />
            <DisplayLangField name="displayLang" />

            <Button disabled={isSubmitting} w="100%" type="submit">
                {t('create-account')}
            </Button>
        </Form>
    );
};

const CreateAccountForm = withFormik<
    CreateAccountFormProps,
    CreateAccountFormValues
>({
    handleSubmit: (values, actions) => {
        console.log(values);
        actions.setSubmitting(false);
    },
    mapPropsToValues: (props) => {
        return props;
    },
})(InnerForm);

export default CreateAccountForm;
