import React from 'react';
import { Flex, Button, Heading } from '@chakra-ui/react';
import { Form, withFormik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import UsernameField from '../UsernameField/UsernameField';
import PasswordField from '../PasswordField/PasswordField';
import PasswordConfirmField from '../PasswordConfirmField/PasswordConfirmField';
import StudyLangField from '../StudyLangField/StudyLangField';
import DisplayLangField from '../DisplayLangField/DisplayLangField';
import { LoadUntilResolve } from '../../general/LoadWrapper/LoadWrapper';
import { register } from '../../../net/requests/register';

export interface CreateAccountFormValues {
    username: string;
    password: string;
    passwordConfirm: string;
    studyLang: string | undefined;
    displayLang: string | undefined;
}

type CreateAccountFormProps = {
    values: CreateAccountFormValues;
    loadUntilResolve: LoadUntilResolve;
};

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
        const promise = register({
            username: values.username,
            password: values.password,
            study_lang: values.studyLang!,
            display_lang: values.displayLang!,
        })
            .then(() => {
                actions.setSubmitting(false);
                actions.resetForm();
            })
            .catch(() => {
                actions.setSubmitting(false);
            });

        actions.props.loadUntilResolve(promise);
    },
    mapPropsToValues: (props) => {
        return props.values;
    },
})(InnerForm);

export default CreateAccountForm;
