import React from 'react';
import { Flex, Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useReaderStore } from '../Reader/Reader';
import { observer } from 'mobx-react';

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
        >
            <Text fontWeight="bold" fontSize="30px">
                {t('dictionary')}
            </Text>
            <Box
                width="95%"
                height="1px"
                bgColor="#d16161"
                borderRadius="5px"
            />

            <Box padding="5px 0 10px 0">
                <Text fontSize="24px">{readerStore.currentWord}</Text>
                <Text>
                    {readerStore.currentWordStatus !== null
                        ? `${t('status')}: ${readerStore.currentWordStatus}`
                        : null}
                </Text>
            </Box>
        </Flex>
    );
};

export default observer(ReaderSidebar);
