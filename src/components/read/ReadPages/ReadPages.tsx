import React, { useState } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import PageText from '../PageText/PageText';
import PageFooter from '../PageFooter/PageFooter';

interface Props {
    pages: string[][];
}

const ReadPages: React.FC<Props> = ({ pages }) => {
    const [currPage, setCurrPage] = useState(0);
    const pageCountM1 = pages.length - 1;
    return (
        <Flex
            direction="column"
            justifyContent="center"
            alignItems="center"
            overflowY="auto"
            flex={7}
            overflowX="hidden"
            backgroundColor="#fff"
            width="90%"
            height="90%"
            borderRadius="lg"
            margin="0px 7.5px 0px 15px"
            color="#222"
        >
            <PageText page={pages[currPage]} />
            <Box w="100%" border="thin solid #d16161" />
            <Box height="5%" p="5px">
                Page {currPage + 1}
            </Box>
            <PageFooter
                currPage={currPage}
                setCurrPage={setCurrPage}
                pageCountM1={pageCountM1}
            />
        </Flex>
    );
};

export default ReadPages;
