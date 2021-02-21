import React from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import ArticleAuthor from '../ArticleAuthor/ArticleAuthor';
import ArticleTime from '../ArticleTime/ArticleTime';
import ArticleLength from '../ArticleLength/ArticleLength';
import ArticleLang from '../ArticleLang/ArticleLang';
import ArticleTags from '../ArticleTags/ArticleTags';

interface Props {
    article: SimpleArticle;
}

const Article: React.FC<Props> = ({ article }) => {
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
            minW={{ base: '15%', lg: '20%' }}
            flex={1}
            textAlign="left"
        >
            <Heading fontSize="lg">{article.title}</Heading>
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

export default Article;
