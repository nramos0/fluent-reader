import React from 'react';
import { Flex } from '@chakra-ui/react';
import ReadHeader from '../ReadHeader/ReadHeader';
import ReadPages from '../ReadPages/ReadPages';
import article from './test1.json';

const Reader: React.FC<{}> = () => {
    return (
        <Flex flex={1} direction="column" justify="center" align="center">
            <ReadHeader title={article.title} />
            <ReadPages pages={article.pages_lg} />
        </Flex>
    );
};

export default Reader;
