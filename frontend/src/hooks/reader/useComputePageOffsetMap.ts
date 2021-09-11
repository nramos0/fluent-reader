import { useEffect } from 'react';
import { useReaderStore } from '../../components/read/Reader/Reader';

export const useComputePageOffsetMap = (pages: string[][]) => {
    const readerStore = useReaderStore();
    useEffect(() => {
        readerStore.computePageOffsetMap(pages);
    }, [readerStore, pages]);
};
