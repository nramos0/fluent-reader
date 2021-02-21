import React, { useCallback } from 'react';
import { Button, Heading, useToast, Text, Link } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import to from 'await-to-js';
import { useHistory } from 'react-router-dom';
import UsernameField from '../UsernameField/UsernameField';
import PasswordField from '../PasswordField/PasswordField';
import { useLoadInfo } from '../../general/LoadWrapper/LoadWrapper';
import { login } from '../../../net/requests/login';

interface Props {
    goToRegistration: () => void;
}

interface LoginFormValues {
    username: string;
    password: string;
}

const loginFormInitialValues: LoginFormValues = {
    username: '',
    password: '',
};

const LoginForm = ({ goToRegistration }: Props) => {
    const { t } = useTranslation('account');
    const { loadUntilResolve } = useLoadInfo();
    const showToast = useToast();
    const history = useHistory();

    const onSubmit = useCallback(
        async (
            values: LoginFormValues,
            actions: FormikHelpers<LoginFormValues>
        ) => {
            const promise = login({
                username: values.username,
                password: values.password,
            });
            loadUntilResolve(promise);

            const [err, resData] = await to(promise);

            actions.setSubmitting(false);

            if (err !== null) {
                // error case
                showToast({
                    title: t('login-fail-title'),
                    description: t('login-fail-desc'),
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            } else if (resData !== undefined) {
                // good case
                showToast({
                    title: t('login-success-title'),
                    description: t('login-success-desc'),
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                actions.resetForm();
                localStorage.setItem('token', resData.data.token);
                localStorage.setItem(
                    'refreshToken',
                    resData.data.refresh_token
                );
                history.push('/app');
            }
        },
        [history, loadUntilResolve, showToast, t]
    );
    return (
        <Formik initialValues={loginFormInitialValues} onSubmit={onSubmit}>
            {(props) => (
                <Form>
                    <Heading fontSize="2xl" mb="5">
                        {t('login')}
                    </Heading>

                    <UsernameField name="username" hasInfo={false} />
                    <PasswordField name="password" hasInfo={false} />

                    <Button
                        disabled={props.isSubmitting}
                        w="100%"
                        type="submit"
                    >
                        {t('login')}
                    </Button>

                    <Text mt={3}>
                        {t('to-register-prompt')}&nbsp;
                        <Link
                            onClick={
                                props.isSubmitting
                                    ? undefined
                                    : goToRegistration
                            }
                        >
                            {t('to-register')}
                        </Link>
                    </Text>
                </Form>
            )}
        </Formik>
    );
};

export default LoginForm;