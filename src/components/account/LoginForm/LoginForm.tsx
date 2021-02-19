import React from 'react';
import { Button, Heading } from '@chakra-ui/react';
import { Form, withFormik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import UsernameField from '../UsernameField/UsernameField';
import PasswordField from '../PasswordField/PasswordField';

export interface LoginFormValues {
    username: string;
    password: string;
}

type LoginFormProps = LoginFormValues;

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
        console.log(values);
        actions.setSubmitting(false);
    },
    mapPropsToValues: (props) => {
        return props;
    },
})(InnerForm);

export default LoginForm;
