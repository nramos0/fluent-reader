import React from 'react';
import { Flex, Heading, Tooltip } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
// import LazyTooltip from '../../general/LazyTooltip/LazyTooltip';
import ArticleAuthor from '../ArticleAuthor/ArticleAuthor';
import ArticleTime from '../ArticleTime/ArticleTime';
import ArticleLength from '../ArticleLength/ArticleLength';
import ArticleLang from '../ArticleLang/ArticleLang';
import ArticleTags from '../ArticleTags/ArticleTags';
import ArticleControls from '../ArticleControls/ArticleControls';
import ArticleWordStatusInfo from '../ArticleWordStatusInfo';

interface Props {
    article: SimpleArticle;
    onAdd: (article: SimpleArticle) => void;
    onRemoveSuccess: (id: number) => void;
}

const Article: React.FC<Props> = ({ article, onRemoveSuccess, onAdd }) => {
    const { t } = useTranslation();
    return (
        <Flex
            direction="column"
            align="flex-start"
            p={3}
            boxSizing="border-box"
            mb={1}
            mr={3}
            borderRadius="15px"
            bgColor="white"
            border="2px solid transparent"
            borderColor="c1"
            cursor="pointer"
            color="c1"
            _hover={{
                color: 'white',
                bgColor: 'c1',
            }}
            transition="color linear 200ms, background-color linear 200ms"
            w="100%"
            textAlign="left"
            fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
        >
            <Tooltip
                label={article.title}
                aria-label={t('aria:article-title-tooltip')}
                noOfLines={5}
                borderRadius="lg"
                color="c1"
                bgColor="white"
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
                <ArticleLength length={article.unique_word_count} />
            </Flex>

            {article.id > 0 ? (
                <ArticleWordStatusInfo article_id={article.id} />
            ) : null}

            <ArticleTags tags={article.tags} />

            <ArticleControls
                article={article}
                onAdd={onAdd}
                onRemoveSuccess={onRemoveSuccess}
            />
        </Flex>
    );
};

export default React.memo(Article);
