import React, { useMemo } from 'react';
import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface Props {
    timestamp: Timestamp;
}

const ArticleTime: React.FC<Props> = ({ timestamp }) => {
    const { i18n } = useTranslation();

    const date = useMemo(() => {
        const newDate = new Date(0);
        newDate.setUTCSeconds(timestamp.secs_since_epoch);
        return newDate;
    }, [timestamp.secs_since_epoch]);

    return <Text pr={1}>{date.toLocaleString(i18n.language)}</Text>;
};

export default ArticleTime;
