import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { useReaderStore } from '../Reader/Reader';
import AuxiliaryControls from '../AuxiliaryControls/AuxiliaryControls';
import WordDefinitionControls from '../WordDefinitionControls/WordDefinitionControls';
import WordStatusControls from '../WordStatusControls/WordStatusControls';

const line = (
    <Box width="100%" height="1px" bgColor="#d16161" borderRadius="5px" />
);

const Dictionary: React.FC = () => {
    const { t } = useTranslation('reader');
    const readerStore = useReaderStore();
    return (
        <>
            <Text fontWeight="bold" fontSize="30px">
                {t('dictionary')}
            </Text>
            {line}
            {readerStore.currentWord === null ? (
                <Text fontSize="16px">{t('click-word-to-search')}</Text>
            ) : (
                <>
                    <WordStatusControls
                        word={readerStore.currentWord.word}
                        status={readerStore.currentWord.status}
                    />
                    {line}
                    <WordDefinitionControls />
                    {line}
                    <AuxiliaryControls />
                    {line}
                </>
            )}
        </>
    );
};

export default observer(Dictionary);
