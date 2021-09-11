import { useEffect } from 'react';
import { useReaderStore } from '../../store/readerStore';

export const useComputeUnderlineMap = () => {
    const readerStore = useReaderStore();
    useEffect(() => {
        readerStore.computeUnderlineMap();
    }, [readerStore]);
};
