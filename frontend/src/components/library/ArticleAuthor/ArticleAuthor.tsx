import React from 'react';
import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface Props {
    author: string | null;
}

const ArticleAuthor: React.FC<Props> = ({ author }) => {
    const { t } = useTranslation();
    return (
        <Text pr={1}>
            {t('library:author')}:{' '}
            {author !== null && author.trim() !== '' ? author : t('none')}
        </Text>
    );
};

export default ArticleAuthor;
