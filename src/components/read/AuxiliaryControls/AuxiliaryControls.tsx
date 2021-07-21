import React from 'react';
import { Flex, Text, Switch } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { useReaderStore } from '../Reader/Reader';

const AuxiliaryControls: React.FC = () => {
    const { t } = useTranslation('reader');
    const readerStore = useReaderStore();

    return (
        <Flex direction="row" align="center" p="5px 0px">
            <Text mr={3}>{t('should-page-to-known')}</Text>
            <Switch
                isChecked={readerStore.doesPageSkipMoveToKnown}
                onChange={() => {
                    readerStore.toggleDoesPageSkipMoveToKnown();
                }}
            />
        </Flex>
    );
};

export default observer(AuxiliaryControls);
