import React from 'react';
import { Flex, Text, Select, Icon } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { useStore } from '../../../hooks/useStore';
import { MdLanguage } from 'react-icons/md';
import { useLoadInfo } from '../../general/LoadWrapper/LoadWrapper';

const Language: React.FC = () => {
    const { t } = useTranslation('settings');
    const store = useStore();
    const { loadUntilResolve } = useLoadInfo();

    return (
        <Flex direction="column">
            <Flex direction="row" align="center" mb={2}>
                <Icon as={MdLanguage} mr={1} boxSize={5} />
                <Text textAlign="left" fontSize="xl">
                    {t('language')}
                </Text>
            </Flex>
            <Flex direction="row" align="center" mb={3}>
                <Text textAlign="left" fontSize="md" mr={2} flex={3}>
                    {t('account:display-lang')}
                </Text>
                <Select
                    flex={7}
                    value={store.displayLanguage}
                    onChange={(e) => {
                        loadUntilResolve(
                            store.setDisplayLanguage(e.target.value)
                        );
                    }}
                >
                    <option disabled={true}>
                        {t('account:display-lang-info')}
                    </option>
                    <option value="zh-CN">{t('common:zh-CN')}</option>
                    <option value="en">{t('common:en')}</option>
                </Select>
            </Flex>
            <Flex direction="row" align="center">
                <Text textAlign="left" fontSize="md" mr={2} flex={3}>
                    {t('account:study-lang')}
                </Text>
                <Select
                    flex={7}
                    value={store.studyLanguage}
                    onChange={(e) => {
                        store.setStudyLanguage(e.target.value);
                    }}
                >
                    <option disabled={true}>
                        {t('account:study-lang-info')}
                    </option>
                    <option value="zh-CN">{t('common:zh-CN')}</option>
                    <option value="en">{t('common:en')}</option>
                </Select>
            </Flex>
        </Flex>
    );
};

export default observer(Language);
