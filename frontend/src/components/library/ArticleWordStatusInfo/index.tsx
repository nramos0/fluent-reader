import React from 'react';
import { Text, Flex, Skeleton, IconButton } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { useGetWordStatusCounts } from '../../../net/requests/allArticleWordData';
import { useMemo } from 'react';
import { useStore } from '../../../hooks/useStore';

interface Props {
    article_id: number;
}

const ArticleWordStatusInfo: React.FC<Props> = ({ article_id }) => {
    const { t } = useTranslation('library');
    const store = useStore();

    const articleIdList = useMemo(() => [article_id], [article_id]);

    const { isLoading, data, refetch } = useGetWordStatusCounts({
        article_id_list: articleIdList,
        lang: store.studyLang(),
    });

    const elements = () => {
        if (isLoading || !data) {
            return (
                <>
                    <Text as="span">
                        {t('library:newWordWithCount', { n: '...' })}
                        &nbsp;|&nbsp;
                    </Text>
                    <Text as="span">
                        {t('library:learningWordWithCount', { n: '...' })}
                        &nbsp;|&nbsp;
                    </Text>
                    <Text as="span">
                        {t('library:knownWordWithCount', { n: '...' })}
                        &nbsp;
                    </Text>
                </>
            );
        } else {
            const {
                new: newCount,
                learning: learningCount,
                known: knownCount,
                total,
            } = data.data.word_status_count_list[0];

            return (
                <>
                    <Text as="span">
                        {t('library:newWordWithCount', {
                            n: newCount,
                            pct: ((100 * newCount) / total).toFixed(2),
                        })}
                        &nbsp;|&nbsp;
                    </Text>
                    <Text as="span">
                        {t('library:learningWordWithCount', {
                            n: learningCount,
                            pct: ((100 * learningCount) / total).toFixed(2),
                        })}
                        &nbsp;|&nbsp;
                    </Text>
                    <Text as="span">
                        {t('library:knownWordWithCount', {
                            n: knownCount,
                            pct: ((100 * knownCount) / total).toFixed(2),
                        })}
                        &nbsp;
                    </Text>
                </>
            );
        }
    };

    return (
        <Flex direction="row" align="center">
            <IconButton
                variant="type2"
                size="xs"
                icon={<RepeatIcon />}
                aria-label="Reload word pct"
                disabled={isLoading}
                onClick={() => refetch()}
                mr={1}
            />
            <Skeleton isLoaded={!isLoading || !data}>{elements()}</Skeleton>
        </Flex>
    );
};

export default ArticleWordStatusInfo;
