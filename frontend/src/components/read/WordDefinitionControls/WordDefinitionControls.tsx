import React, { useEffect, useState } from 'react';
import { Text, Flex, Textarea } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import DefinitionSearch from '../DefinitionSearch/DefinitionSearch';
import { observer } from 'mobx-react';
import { useStore } from '../../../hooks/useStore';
import { useReaderStore } from '../Reader/Reader';

const WordDefinitionControls: React.FC = () => {
    const { t } = useTranslation('reader');

    const store = useStore();
    const readerStore = useReaderStore();

    const [definition, setDefinition] = useState('');

    useEffect(() => {
        if (readerStore.currentWord === null) {
            return;
        }

        const word = readerStore.currentWord.word;
        const dataDefinition = store.getDefinition(word);
        setDefinition(dataDefinition || '');
    }, [readerStore.currentWord, store]);

    if (readerStore.currentWord === null) {
        return null;
    }

    const onChange = (e: any) => {
        setDefinition(e.target.value);
        store.updateWordDefinition(
            readerStore.currentWord!.word,
            e.target.value
        );
        if (readerStore.currentWord!.status === 'new') {
            store.updateWordStatus(
                readerStore.currentWord!.word,
                'learning',
                false
            );
            readerStore.updateWordStatus('learning');
        }
    };

    return (
        <Flex direction="column" p="5px 0px 10px 0px" w="100%" align="center">
            <Text fontSize="24px" fontWeight="bold" mb="5px">
                {t('definition')}
            </Text>
            <Textarea
                size="md"
                w="80%"
                value={definition}
                onChange={onChange}
                resize="vertical"
                height="130px"
                mb="10px"
                placeholder={t('type-definition')}
            />
            <DefinitionSearch />
        </Flex>
    );
};

export default observer(WordDefinitionControls);
