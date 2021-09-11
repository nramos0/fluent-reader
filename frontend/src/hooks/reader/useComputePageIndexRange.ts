import { useEffect } from 'react';
import { useReaderStore } from '../../store/readerStore';

export const useComputePageIndexRange = (
    currPageIndex: number,
    currPageLength: number
) => {
    const readerStore = useReaderStore();
    useEffect(() => {
        readerStore.computePageIndexRange(currPageIndex, currPageLength);
    }, [currPageLength, currPageIndex, readerStore, readerStore.pageOffsetMap]);
};
