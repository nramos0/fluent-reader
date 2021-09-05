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
            flex={1}
            bgColor="white"
            color="c1"
            p={3}
            borderRadius="lg"
            m="50px 100px"
        >
            <Heading>{t('common:settings')}</Heading>
            <Flex direction="column" w="100%" p="0 20%">
                <Language />
            </Flex>
        </Flex>
    );
};

export default Settings;
