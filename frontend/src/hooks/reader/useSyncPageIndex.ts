import { useEffect } from 'react';
import { useReaderStore } from '../../components/read/Reader/Reader';

export const useSyncPageIndex = (currPageIndex: number) => {
    const readerStore = useReaderStore();
    useEffect(() => {
        readerStore.setPageIndex(currPageIndex);
    }, [currPageIndex, readerStore]);
};
