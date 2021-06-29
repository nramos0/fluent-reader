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
            flex={1}
            overflowX="hidden"
        >
            <Box
                backgroundColor="#fff"
                width="90%"
                height="90%"
                borderRadius="lg"
                color="#222"
                padding="10px 20px 0px 20px"
                overflowY="auto"
                display="flex"
                flexDir="column"
            >
                <PageText page={pages[currPage]} />
                <Box w="100%" border="thin solid #CCC" />
                <Box height="5%" p="5px">
                    Page {currPage + 1}
                </Box>
                <PageFooter
                    currPage={currPage}
                    setCurrPage={setCurrPage}
                    pageCountM1={pageCountM1}
                />
            </Box>
        </Flex>
    );
};

export default ReadPages;
