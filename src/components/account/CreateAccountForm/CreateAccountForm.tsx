import React, { useCallback, useMemo } from 'react';
import { Flex, Button, Heading, useToast, Text, Link } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import to from 'await-to-js';
import * as Yup from 'yup';
import UsernameField from '../UsernameField/UsernameField';
import PasswordField from '../PasswordField/PasswordField';
import PasswordConfirmField from '../PasswordConfirmField/PasswordConfirmField';
import StudyLangField from '../StudyLangField/StudyLangField';
import DisplayLangField from '../DisplayLangField/DisplayLangField';
import { useLoadInfo } from '../../general/LoadWrapper/LoadWrapper';
import { register } from '../../../net/requests/register';

interface Props {
    returnToLogin: () => void;
}

interface CreateAccountFormValues {
    username: string;
    password: string;
    passwordConfirm: string;
    studyLang: string;
    displayLang: string;
}

const createAccountFormInitialValues: CreateAccountFormValues = {
    username: '',
    password: '',
    passwordConfirm: '',
    studyLang: 'default',
    displayLang: 'default',
};

const CreateAccountForm = ({ returnToLogin }: Props) => {
    const { t } = useTranslation('account');
    const { loadUntilResolve } = useLoadInfo();
    const showToast = useToast();

    const validationSchema = useMemo(() => {
        const required = t('required');
        const tooShort = t('too-short');
        const tooLong = t('too-long');

        return Yup.object().shape({
            username: Yup.string()
                .required(required)
                .min(2, tooShort)
                .max(100, tooLong),
            password: Yup.string()
                .required(required)
                .min(8, tooShort)
                .max(64, tooLong)
                .matches(/[a-z]/, t('pass-need-lower'))
                .matches(/[A-Z]/, t('pass-need-upper'))
                .matches(/\d/, t('pass-need-digit')),
            passwordConfirm: Yup.string()
                .required(required)
                .oneOf([Yup.ref('password'), ''], t('pass-must-match')),
            studyLang: Yup.string()
                .required(required)
                .oneOf(['en', 'zh-CN'], t('must-select-study-lang')),
            displayLang: Yup.string()
                .required(required)
                .oneOf(['en', 'zh-CN'], t('must-select-display-lang')),
        });
    }, [t]);

    const onSubmit = useCallback(
        async (
            values: CreateAccountFormValues,
            actions: FormikHelpers<CreateAccountFormValues>
        ) => {
            const [validationError] = await to(actions.validateForm(values));

            if (validationError !== null) {
                actions.setSubmitting(false);
                return;
            }

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
            validationSchema={validationSchema}
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
                        disabled={
                            props.isSubmitting ||
                            !!props.errors.username ||
                            !!props.errors.password ||
                            !!props.errors.passwordConfirm ||
                            !!props.errors.studyLang ||
                            !!props.errors.displayLang
                        }
                        w="100%"
                        type="submit"
                    >
                        {t('create-account')}
                    </Button>

                    <Text mt={3}>
                        {t('to-login-prompt')}&nbsp;
                        <Link
                            onClick={
                                props.isSubmitting ? undefined : returnToLogin
                            }
                        >
                            {t('to-login')}
                        </Link>
                    </Text>
                </Form>
            )}
        </Formik>
    );
};

export default CreateAccountForm;
