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

interface Props {
    pages: string[][];
}

const ReadPages: React.FC<Props> = ({ pages }) => {
    const { t } = useTranslation();
    const [currPageIndex, setCurrPageIndex] = useState(0);
    const pageCountM1 = pages.length - 1;
    const currPage = pages[currPageIndex];

    const readerStore = useReaderStore();

    useEffect(() => {
        if (readerStore.visitedPageIndices[currPageIndex] === undefined) {
            readerStore.visitedPageIndices[currPageIndex] = 1;
        }
    }, [currPageIndex, readerStore.visitedPageIndices]);

    useEffect(() => {
        readerStore.computePageOffsetMap(pages);
        readerStore.computeUnderlineMap();
    }, [pages, readerStore]);

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
                readerStore.pageOffsetMap !== null && (
                    <PageText
                        page={currPage}
                        pageOffset={readerStore.pageOffsetMap[currPageIndex]}
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
