import React from 'react';
import { Flex, Heading, Tooltip } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
// import LazyTooltip from '../../general/LazyTooltip/LazyTooltip';
import ArticleAuthor from '../ArticleAuthor/ArticleAuthor';
import ArticleTime from '../ArticleTime/ArticleTime';
import ArticleLength from '../ArticleLength/ArticleLength';
import ArticleLang from '../ArticleLang/ArticleLang';
import ArticleTags from '../ArticleTags/ArticleTags';

interface Props {
    article: SimpleArticle;
}

const Article: React.FC<Props> = ({ article }) => {
    const { t } = useTranslation();
    return (
        <Flex
            direction="column"
            align="flex-start"
            p={3}
            mb={3}
            mr={3}
            borderRadius="lg"
            bgColor="white"
            color="#661919"
            minW={{ sm: '35%', md: '25%', lg: '20%' }}
            flex={1}
            textAlign="left"
            fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
        >
            <Tooltip
                label={article.title}
                aria-label={t('aria:article-title-tooltip')}
                noOfLines={5}
                borderRadius="lg"
                bgColor="#661919"
                color="white"
            >
                <Heading
                    fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
                    isTruncated={true}
                    maxW="100%"
                >
                    {article.title}
                </Heading>
            </Tooltip>
            <Flex flexDir={{ base: 'column', xl: 'row' }}>
                <ArticleAuthor author={article.author} />
                <ArticleTime timestamp={article.created_on} />
            </Flex>
            <Flex flexDir={{ base: 'column', xl: 'row' }}>
                <ArticleLang lang={article.lang} />
                <ArticleLength length={article.content_length} />
            </Flex>

            <ArticleTags tags={article.tags} />
        </Flex>
    );
};

export default React.memo(Article);
