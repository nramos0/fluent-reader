import React from 'react';
import { Text, Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ChangeStatusButton from '../ChangeStatusButton/ChangeStatusButton';

const WordStatusControls: React.FC<{ word: string; status: string }> = ({
    word,
    status,
}) => {
    const { t } = useTranslation('reader');

    return (
        <Box padding="0 0 10px 0">
            <Text fontSize="24px">{word}</Text>
            <Text>{`${t('status')}: ${t(status)}`}</Text>
            <Text mb="5px">{t('set-status')}</Text>
            <ChangeStatusButton />
        </Box>
    );
};

export default WordStatusControls;
