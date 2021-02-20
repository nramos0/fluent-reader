import React, { useContext, useCallback } from 'react';
import { Flex, Button, Heading, useToast } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import to from 'await-to-js';
import UsernameField from '../UsernameField/UsernameField';
import PasswordField from '../PasswordField/PasswordField';
import PasswordConfirmField from '../PasswordConfirmField/PasswordConfirmField';
import StudyLangField from '../StudyLangField/StudyLangField';
import DisplayLangField from '../DisplayLangField/DisplayLangField';
import { LoadContext } from '../../general/LoadWrapper/LoadWrapper';
import { register } from '../../../net/requests/register';

interface CreateAccountFormValues {
    username: string;
    password: string;
    passwordConfirm: string;
    studyLang: string | undefined;
    displayLang: string | undefined;
}

const createAccountFormInitialValues: CreateAccountFormValues = {
    username: '',
    password: '',
    passwordConfirm: '',
    studyLang: undefined,
    displayLang: undefined,
};

const CreateAccountForm = () => {
    const { t } = useTranslation('account');
    const { loadUntilResolve } = useContext(LoadContext);
    const showToast = useToast();

    const onSubmit = useCallback(
        async (
            values: CreateAccountFormValues,
            actions: FormikHelpers<CreateAccountFormValues>
        ) => {
            const promise = register({
                username: values.username,
                password: values.password,
                study_lang: values.studyLang!,
                display_lang: values.displayLang!,
            });
            loadUntilResolve(promise);

            const [err, data] = await to(promise);

            actions.setSubmitting(false);

            if (err !== null) {
                // error case
                showToast({
                    title: t('register-fail-title'),
                    description: t('register-fail-desc'),
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            } else if (data !== undefined) {
                // good case
                showToast({
                    title: t('register-success-title'),
                    description: t('register-success-desc'),
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                actions.resetForm();
            }
        },
        [loadUntilResolve, showToast, t]
    );

    return (
        <Formik
            initialValues={createAccountFormInitialValues}
            onSubmit={onSubmit}
        >
            {(props) => (
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

                    <Button
                        disabled={props.isSubmitting}
                        w="100%"
                        type="submit"
                    >
                        {t('create-account')}
                    </Button>
                </Form>
            )}
        </Formik>
    );
};

export default CreateAccountForm;
