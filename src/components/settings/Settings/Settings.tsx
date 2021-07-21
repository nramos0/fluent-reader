import React from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import Language from '../Language/Language';

const Settings: React.FC = () => {
    const { t } = useTranslation('settings');
    return (
        <Flex
            direction="column"
            align="center"
            width="100%"
            bgColor="white"
            color="#661919"
            p={3}
            borderRadius="lg"
            m={6}
        >
            <Heading>{t('common:settings')}</Heading>
            <Flex direction="column" w="100%" p="0 20%">
                <Language />
            </Flex>
        </Flex>
    );
};

export default Settings;
