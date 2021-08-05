import React from 'react';
import { Flex, Heading, Text, Box, Link } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ScrollBox from '../../general/ScrollBox/ScrollBox';

const line = (
    <Box width="100%" height="1px" bgColor="#d16161" borderRadius="5px" />
);

const About: React.FC = () => {
    const { t } = useTranslation('about');
    return (
        <Flex
            direction="column"
            align="center"
            flex={1}
            bgColor="white"
            color="#661919"
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
                        {t('app-description-2-1')}
                        <Link
                            target="_blank"
                            rel="noreferer noopener"
                            href="https://github.com/nramos0/fluent-reader/"
                            fontWeight="bold"
                        >
                            {t('app-code-link')}
                        </Link>
                        {t('app-description-2-2')}
                        <Link
                            target="_blank"
                            rel="noreferer noopener"
                            href="https://reactjs.org/"
                            fontWeight="bold"
                        >
                            {t('react')}
                        </Link>
                        {t('app-description-2-3')}
                        <Link
                            target="_blank"
                            rel="noreferer noopener"
                            href="https://www.rust-lang.org/"
                            fontWeight="bold"
                        >
                            {t('rust')}
                        </Link>
                        {t('app-description-2-4')}
                    </Text>

                    <Heading mb={2} fontSize="20px" textAlign="center">
                        {t('credits-contact')}
                    </Heading>
                    <Text>{t('credits-1')}</Text>
                    <Text>
                        {t('developer')}: {t('nicholas')}
                        {' | '}
                        <Text as="span">{t('email')}: </Text>
                        <Link href="mailto:xoen000@163.com">
                            xoen000@163.com
                        </Link>
                        {' | '}
                        <Text as="span">{t('github')}: </Text>
                        <Link
                            href="https://github.com/nramos0/"
                            target="_blank"
                            rel="noreferer noopener"
                        >
                            https://github.com/nramos0/
                        </Link>
                    </Text>
                    <Text>
                        {t('designer')}: {t('porter')}
                    </Text>
                </Flex>
            </ScrollBox>
        </Flex>
    );
};

export default About;
