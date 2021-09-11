import { useEffect } from 'react';
import { useReaderStore } from '../../components/read/Reader/Reader';

export const useInitPageVisit = (currPageIndex: number) => {
    const readerStore = useReaderStore();

    useEffect(() => {
        if (readerStore.visitedPageIndices[currPageIndex] === undefined) {
            readerStore.visitedPageIndices[currPageIndex] = 1;
        }
    }, [currPageIndex, readerStore.visitedPageIndices]);
};
