import { useEffect } from 'react';
import { useReaderStore } from '../../store/readerStore';

export const useSyncPageIndex = (currPageIndex: number) => {
    const readerStore = useReaderStore();
    useEffect(() => {
        readerStore.setPageIndex(currPageIndex);
    }, [currPageIndex, readerStore]);
};
