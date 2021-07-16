import React from 'react';
import { Flex, Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';

import WordStatusControls from '../WordStatusControls/WordStatusControls';
import WordDefinitionControls from '../WordDefinitionControls/WordDefinitionControls';
import { useReaderStore } from '../Reader/Reader';

const line = (
    <Box width="100%" height="1px" bgColor="#d16161" borderRadius="5px" />
);

const ReaderSidebar: React.FC<{}> = () => {
    const { t } = useTranslation('reader');
    const readerStore = useReaderStore();
    return (
        <Flex
            backgroundColor="#fff"
            flex={3}
            height="90%"
            borderRadius="lg"
            color="#661919"
            overflowY="auto"
            direction="column"
            align="center"
            margin="0px 15px 0px 7.5px"
            padding="0px 10px 7.5px 10px"
        >
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
                </>
            )}
        </Flex>
    );
};

export default observer(ReaderSidebar);
