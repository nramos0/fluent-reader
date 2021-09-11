import { useEffect } from 'react';
import { useReaderStore } from '../../store/readerStore';

export const useComputePageOffsetMap = (pages: string[][]) => {
    const readerStore = useReaderStore();
    useEffect(() => {
        readerStore.computePageOffsetMap(pages);
    }, [readerStore, pages]);
};
