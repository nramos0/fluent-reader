import React, { useEffect, useState } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import PageText from '../PageText/PageText';
import PageFooter from '../PageFooter/PageFooter';
import { useReaderStore } from '../Reader/Reader';

interface Props {
    pages: string[][];
}

const ReadPages: React.FC<Props> = ({ pages }) => {
    const [currPageIndex, setCurrPageIndex] = useState(0);
    const pageCountM1 = pages.length - 1;
    const currPage = pages[currPageIndex];

    const readerStore = useReaderStore();

    useEffect(() => {
        if (readerStore.visitedPageIndices[currPageIndex] === undefined) {
            readerStore.visitedPageIndices[currPageIndex] = 1;
        }
    }, [currPageIndex, readerStore.visitedPageIndices]);

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
            <PageText page={currPage} />
            <Box w="100%" border="thin solid #d16161" />
            <Box height="5%" p="5px">
                Page {currPageIndex + 1}
            </Box>
            <PageFooter
                currPage={currPage}
                currPageIndex={currPageIndex}
                setCurrPageIndex={setCurrPageIndex}
                pageCountM1={pageCountM1}
            />
        </Flex>
    );
};

export default ReadPages;
