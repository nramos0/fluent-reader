import React from 'react';
import { Flex, Button } from '@chakra-ui/react';
import { useReaderStore } from '../Reader/Reader';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

interface Props {
    currPage: string[];
    currPageIndex: number;
    setCurrPageIndex: React.Dispatch<React.SetStateAction<number>>;
    pageCountM1: number;
}

const PageFooter: React.FC<Props> = ({
    currPage,
    currPageIndex,
    setCurrPageIndex,
    pageCountM1,
}) => {
    const { t } = useTranslation();
    const readerStore = useReaderStore();

    const onPageLeft = () => {
        if (currPageIndex > 0) {
            setCurrPageIndex((prev) => prev - 1);
        }
    };

    const onPageRight = () => {
        if (currPageIndex < pageCountM1) {
            if (readerStore.visitedPageIndices[currPageIndex] === 1) {
                readerStore.markPageAsKnown(currPage);
                readerStore.visitedPageIndices[currPageIndex] = 2;
            }
            setCurrPageIndex((prev) => prev + 1);
        }
    };

    return (
        <Flex height="10%" direction="row" p="10px" width="100%">
            <Button
                flex={1}
                mr="5px"
                onClick={onPageLeft}
                disabled={currPageIndex <= 0}
            >
                {t('prev')}
            </Button>

            <Button
                flex={1}
                mr="5px"
                onClick={onPageRight}
                disabled={currPageIndex >= pageCountM1}
            >
                {t('next')}
            </Button>
        </Flex>
    );
};

export default observer(PageFooter);
