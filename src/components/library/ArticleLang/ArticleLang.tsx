import React from 'react';
import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface Props {
    lang: string;
}

const ArticleLang: React.FC<Props> = ({ lang }) => {
    const { t } = useTranslation();
    return <Text pr={1}>{`${t('lang')}: ${t(lang)}`}</Text>;
};

export default ArticleLang;
