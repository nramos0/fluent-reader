import React from 'react';
import { Flex } from '@chakra-ui/react';
import Article from '../Article/Article';

interface Props {
    list: SimpleArticle[];
}

const ArticleList: React.FC<Props> = ({ list }) => {
    return (
        <Flex direction="row" wrap="wrap" w="100%" ml={3}>
            {list.map((article, index) => (
                <Article article={article} key={index} />
            ))}
        </Flex>
    );
};

export default ArticleList;
