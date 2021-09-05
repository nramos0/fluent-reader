import React from 'react';
import { Flex, Heading, Text, Box, Link as ChakraLink } from '@chakra-ui/react';
import { useTranslation, Trans } from 'react-i18next';
import ScrollBox from '../../general/ScrollBox/ScrollBox';

const line = (
    <Box width="100%" height="1px" bgColor="#d16161" borderRadius="5px" />
);

const Link: React.FC<{ href: string; bold?: boolean }> = ({
    href,
    bold,
    children,
}) => {
    return (
        <ChakraLink
            target="_blank"
            rel="noreferer noopener"
            href={href}
            fontWeight={bold ? 'bold' : 'normal'}
        >
            {children}
        </ChakraLink>
    );
};

const appDescComponents = [
    <Link href="https://github.com/nramos0/fluent-reader/" bold={true} />,
    <Link href="https://reactjs.org/" bold={true} />,
    <Link href="https://www.rust-lang.org/" bold={true} />,
];

const devCreditComponents = [
    <Link href="mailto:xoen000@163.com" />,
    <Link href="https://github.com/nramos0/" />,
];

const About: React.FC = () => {
    const { t } = useTranslation('about');
    return (
        <Flex
            direction="column"
            align="center"
            flex={1}
            bgColor="white"
            color="c1"
            borderRadius="lg"
            m="50px 100px"
            textAlign="left"
        >
            <ScrollBox overflowX="hidden" flex={1} display="flex" p={3} m={1}>
                <Flex direction="column" w="100%" px={10}>
                    <Heading mb={2} textAlign="center">
                        {t('common:about')}
                    </Heading>
                    <Text mb={2}>{t('app-description-1')}</Text>
                    {line}
                    <Text mt={2} mb={2}>
                        <Trans
                            i18nKey="app-description-2"
                            ns="about"
                            components={appDescComponents}
                        />
                    </Text>

                    <Heading mb={2} fontSize="20px" textAlign="center">
                        {t('credits-contact')}
                    </Heading>
                    <Text>{t('credits-1')}</Text>
                    <Text>
                        <Trans
                            i18nKey="dev-credit"
                            ns="about"
                            components={devCreditComponents}
                            values={{
                                email: 'xoen000@163.com',
                                github: 'https://github.com/nramos0/',
                            }}
                        />
                    </Text>
                    <Text>{t('designer-credit')}</Text>
                    <Text>{t('translator-credit')}</Text>
                </Flex>
            </ScrollBox>
        </Flex>
    );
};

export default About;
