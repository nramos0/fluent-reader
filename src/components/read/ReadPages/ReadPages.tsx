import React, { useEffect, useState } from 'react';
import {
    Flex,
    Box,
    Text,
    NumberInput,
    NumberInputField,
    NumberIncrementStepper,
    NumberDecrementStepper,
    NumberInputStepper,
} from '@chakra-ui/react';
import PageText from '../PageText/PageText';
import PageFooter from '../PageFooter/PageFooter';
import { useReaderStore } from '../Reader/Reader';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../../hooks/useStore';

interface Props {
    pages: string[][];
    wordIndexMap: Dictionary<number[]>;
}

const ReadPages: React.FC<Props> = ({ pages, wordIndexMap }) => {
    const { t } = useTranslation();
    const [currPageIndex, setCurrPageIndex] = useState(0);
    const pageCountM1 = pages.length - 1;
    const currPage = pages[currPageIndex];

    const store = useStore();
    const readerStore = useReaderStore();

    useEffect(() => {
        readerStore.setPageIndex(currPageIndex);
    }, [currPageIndex, readerStore]);

    useEffect(() => {
        if (readerStore.visitedPageIndices[currPageIndex] === undefined) {
            readerStore.visitedPageIndices[currPageIndex] = 1;
        }
    }, [currPageIndex, readerStore.visitedPageIndices]);

    useEffect(() => {
        readerStore.setWordIndexMap(wordIndexMap);
        readerStore.computePageOffsetMap(pages);

        readerStore.setUnderlineRanges(store.articleReadData?.underlines ?? []);
        readerStore.computeUnderlineMap();
    }, [pages, readerStore, store.articleReadData?.underlines, wordIndexMap]);

    useEffect(() => {
        readerStore.computePageIndexRange(currPageIndex, currPage.length);
    }, [
        currPage.length,
        currPageIndex,
        readerStore,
        readerStore.pageOffsetMap,
    ]);

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
            <Flex align="center" direction="row" height="5%" p="5px">
                <Text as="span" mr={1}>
                    {t('page')}
                </Text>
                <NumberInput
                    value={currPageIndex + 1}
                    onChange={(newPageIndex) => {
                        const intIndex = parseInt(newPageIndex, 10);
                        if (intIndex > 0 && intIndex <= pages.length) {
                            setCurrPageIndex(intIndex - 1);
                        }
                    }}
                    min={1}
                    max={pages.length}
                    size="xs"
                    w="50px"
                >
                    <NumberInputField />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>

                <Text ml={1}> / {pages.length}</Text>
            </Flex>
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
