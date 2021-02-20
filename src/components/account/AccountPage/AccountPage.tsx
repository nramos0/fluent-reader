import React, { useState } from 'react';
import { Flex, Heading, Text, Link } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import LoginForm from '../LoginForm/LoginForm';
import CreateAccountForm from '../CreateAccountForm/CreateAccountForm';

const AccountPage: React.FC<{}> = () => {
    const [isLogin, setIsLogin] = useState(true);

    const { t } = useTranslation('account');

    const outerForm = isLogin ? (
        <>
            <LoginForm />
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
            <CreateAccountForm />
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
