import React, { useState, useContext } from 'react';
import { Flex, Heading, Text, Link } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import LoginForm, { LoginFormValues } from '../LoginForm/LoginForm';
import CreateAccountForm, {
    CreateAccountFormValues,
} from '../CreateAccountForm/CreateAccountForm';
import { LoadContext } from '../../general/LoadWrapper/LoadWrapper';

const AccountPage: React.FC<{}> = () => {
    const [isLogin, setIsLogin] = useState(true);

    const { t } = useTranslation('account');
    const loginFormInitialValues: LoginFormValues = {
        username: '',
        password: '',
    };

    const createAccountFormInitialValues: CreateAccountFormValues = {
        username: '',
        password: '',
        passwordConfirm: '',
        studyLang: undefined,
        displayLang: undefined,
    };

    const { loadUntilResolve } = useContext(LoadContext);

    const outerForm = isLogin ? (
        <>
            <LoginForm
                values={loginFormInitialValues}
                loadUntilResolve={loadUntilResolve}
            />
            <Text mt={3}>
                {t('to-register-prompt')}&nbsp;
                <Link
                    onClick={() => {
                        setIsLogin(false);
                    }}
                >
                    {t('to-register')}
                </Link>
            </Text>
        </>
    ) : (
        <>
            <CreateAccountForm
                values={createAccountFormInitialValues}
                loadUntilResolve={loadUntilResolve}
            />
            <Text mt={3}>
                {t('to-login-prompt')}&nbsp;
                <Link
                    onClick={() => {
                        setIsLogin(true);
                    }}
                >
                    {t('to-login')}
                </Link>
            </Text>
        </>
    );

    return (
        <Flex
            direction="column"
            justify="center"
            align="center"
            p={{ base: 2, md: 5, lg: 10 }}
            h="100vh"
        >
            <Heading color="white" mb="5" fontSize="4xl">
                {t('app-heading')}
            </Heading>
            <Flex
                direction="column"
                bgColor="white"
                p={5}
                borderRadius="lg"
                w={{ base: '100%', md: '85%', lg: '50%' }}
            >
                {outerForm}
            </Flex>
        </Flex>
    );
};

export default AccountPage;
