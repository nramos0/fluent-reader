import React, { useState } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import PageText from '../PageText/PageText';
import PageFooter from '../PageFooter/PageFooter';
import { observer } from 'mobx-react';
import { useStore } from '../../../hooks/useStore';
import PageStepper from '../PageStepper';
import { useHandleVisitedPages } from '../../../hooks/reader/useInitPageVisit';
import { useSyncPageIndex } from '../../../hooks/reader/useSyncPageIndex';
import { useSyncWordIndexMap } from '../../../hooks/reader/useSyncWordIndexMap';
import { useComputePageOffsetMap } from '../../../hooks/reader/useComputePageOffsetMap';
import { useSyncUnderlineRanges } from '../../../hooks/reader/useSyncUnderlineRanges';
import { useComputeUnderlineMap } from '../../../hooks/reader/useComputeUnderlineMap';
import { useComputePageIndexRange } from '../../../hooks/reader/useComputePageIndexRange';
import { useReaderStore } from '../../../store/readerStore';

interface Props {
    pages: string[][];
    wordIndexMap: Dictionary<number[]>;
}

const ReadPages: React.FC<Props> = ({ pages, wordIndexMap }) => {
    const [currPageIndex, setCurrPageIndex] = useState(0);
    const pageCountM1 = pages.length - 1;
    const currPage = pages[currPageIndex];

    useSyncPageIndex(currPageIndex);
    useHandleVisitedPages(currPageIndex);
    useSyncWordIndexMap(wordIndexMap);
    useComputePageOffsetMap(pages);

    // these two must be run in order, computing the underline map
    // requires the underlines from the article object be synced
    // into the readerStore
    useSyncUnderlineRanges();
    useComputeUnderlineMap();

    useComputePageIndexRange(currPageIndex, currPage.length);

    const store = useStore();
    const readerStore = useReaderStore();

    return (
        <Flex
            direction="column"
            justifyContent="center"
            alignItems="center"
            overflowY="auto"
            flex={9}
            overflowX="hidden"
            backgroundColor="#fff"
            width="90%"
            height="90%"
            borderRadius="lg"
            margin="0px 7.5px 0px 15px"
            color="#222"
        >
            {readerStore.underlineMap !== null &&
                readerStore.pageOffsetMap !== null &&
                store.readArticle !== null && (
                    <PageText
                        page={currPage}
                        pageOffset={readerStore.pageOffsetMap[currPageIndex]}
                        stopWordMap={store.readArticle.stop_word_map}
                        lang={store.readArticle.lang}
                    />
                )}

            <Box w="100%" border="thin solid #d16161" />
            <PageStepper
                currPageIndex={currPageIndex}
                setCurrPageIndex={setCurrPageIndex}
                pages={pages}
            />
            <PageFooter
                currPage={currPage}
                currPageIndex={currPageIndex}
                setCurrPageIndex={setCurrPageIndex}
                pageCountM1={pageCountM1}
            />
        </Flex>
    );
};

export default observer(ReadPages);
