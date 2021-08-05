import React, { useState } from 'react';
import { Flex, Heading, Text, Link } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import LoginForm from '../LoginForm/LoginForm';
import CreateAccountForm from '../CreateAccountForm/CreateAccountForm';

const AccountPage: React.FC<{}> = () => {
    const [isLogin, setIsLogin] = useState(true);

    const { t } = useTranslation('account');

    const outerForm = isLogin ? (
        <LoginForm
            goToRegistration={() => {
                setIsLogin(false);
            }}
        />
    ) : (
        <CreateAccountForm
            returnToLogin={() => {
                setIsLogin(true);
            }}
        />
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
            <Flex
                direction="row"
                fontSize="16px"
                textAlign="center"
                color="white"
                mt={3}
            >
                <Text>ICP备案号：京ICP备2021024530号-1</Text>
                <Text mr={2} ml={2}>
                    |
                </Text>
                <Link
                    href="https://beian.miit.gov.cn"
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    https://beian.miit.gov.cn
                </Link>
            </Flex>
        </Flex>
    );
};

export default AccountPage;
