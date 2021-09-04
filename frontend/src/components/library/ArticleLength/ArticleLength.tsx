import React from 'react';
import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface Props {
    length: number;
}

const ArticleLength: React.FC<Props> = ({ length }) => {
    const { t } = useTranslation();
    return <Text pr={1}>{t('library:wordWithCount', { count: length })}</Text>;
};

export default ArticleLength;
