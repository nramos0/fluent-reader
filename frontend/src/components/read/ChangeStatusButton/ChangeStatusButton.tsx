import React from 'react';
import { Button, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { useStore } from '../../../hooks/useStore';
import { useReaderStore } from '../../../store/readerStore';

const StatusButton: React.FC<{ display: string; newStatus: WordStatus }> = ({
    display,
    newStatus,
}) => {
    const { t } = useTranslation('reader');
    const readerStore = useReaderStore();
    const store = useStore();
    return (
        <Button
            size="sm"
            m="0px 5px 0px 5px"
            variant="type3"
            display={display}
            onClick={() => {
                if (readerStore.currentWord !== null) {
                    store.updateWordStatus(
                        readerStore.currentWord.word,
                        newStatus,
                        false
                    );
                    readerStore.updateWordStatus(newStatus);
                }
            }}
        >
            {t(newStatus)}
        </Button>
    );
};

const ChangeStatusButton: React.FC = () => {
    const readerStore = useReaderStore();

    const wordStatus =
        readerStore.currentWord === null
            ? 'new'
            : readerStore.currentWord.status;

    const newVisible = wordStatus !== 'new';
    const learningVisible = wordStatus !== 'learning';
    const knownVisible = wordStatus !== 'known';

    return (
        <Flex direction="row" justify="center">
            <StatusButton
                display={learningVisible ? 'inline-flex' : 'none'}
                newStatus="learning"
            />
            <StatusButton
                display={knownVisible ? 'inline-flex' : 'none'}
                newStatus="known"
            />
            <StatusButton
                display={newVisible ? 'inline-flex' : 'none'}
                newStatus="new"
            />
        </Flex>
    );
};

export default observer(ChangeStatusButton);
