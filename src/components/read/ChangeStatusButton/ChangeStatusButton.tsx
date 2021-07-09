import React from 'react';
import { Button, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { useStore } from '../../../hooks/useStore';
import { useReaderStore } from '../Reader/Reader';

interface Props {}

const ChangeStatusButton: React.FC<Props> = (_props) => {
    const { t } = useTranslation('reader');
    const readerStore = useReaderStore();
    const store = useStore();

    const wordStatus =
        readerStore.currentWord === null
            ? 'new'
            : readerStore.currentWord.status;

    const knownVisible = wordStatus !== 'known';
    const learningVisible = wordStatus !== 'learning';

    return (
        <Flex direction="row" justify="center">
            <Button
                size="sm"
                bgColor="#661919"
                color="white"
                m="0px 5px 0px 5px"
                display={learningVisible ? 'inline-flex' : 'none'}
                onClick={() => {
                    if (readerStore.currentWord !== null) {
                        store.updateWordStatus(
                            readerStore.currentWord.word,
                            'learning'
                        );
                        readerStore.updateWordStatus('learning');
                    }
                }}
            >
                {t('learning')}
            </Button>
            <Button
                size="sm"
                bgColor="#661919"
                color="white"
                m="0px 5px 0px 5px"
                display={knownVisible ? 'inline-flex' : 'none'}
                onClick={() => {
                    if (readerStore.currentWord !== null) {
                        store.updateWordStatus(
                            readerStore.currentWord.word,
                            'known'
                        );
                        readerStore.updateWordStatus('known');
                    }
                }}
            >
                {t('known')}
            </Button>
        </Flex>
    );
};

export default observer(ChangeStatusButton);
