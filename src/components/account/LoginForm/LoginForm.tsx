import React from 'react';
import { Button, Heading } from '@chakra-ui/react';
import { Form, withFormik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import UsernameField from '../UsernameField/UsernameField';
import PasswordField from '../PasswordField/PasswordField';
import { LoadUntilResolve } from '../../general/LoadWrapper/LoadWrapper';
import { login } from '../../../net/requests/login';

export interface LoginFormValues {
    username: string;
    password: string;
}

type LoginFormProps = {
    values: LoginFormValues;
    loadUntilResolve: LoadUntilResolve;
};

const InnerForm = (props: FormikProps<LoginFormValues>) => {
    const { t } = useTranslation('account');
    const { isSubmitting } = props;
    return (
        <Form>
            <Heading fontSize="2xl" mb="5">
                {t('login')}
            </Heading>

            <UsernameField name="username" hasInfo={false} />
            <PasswordField name="password" hasInfo={false} />

            <Button disabled={isSubmitting} w="100%" type="submit">
                {t('login')}
            </Button>
        </Form>
    );
};

const LoginForm = withFormik<LoginFormProps, LoginFormValues>({
    handleSubmit: (values, actions) => {
        const promise = login({
            username: values.username,
            password: values.password,
        })
            .then(() => {
                actions.resetForm();
                actions.setSubmitting(false);
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

export default LoginForm;
