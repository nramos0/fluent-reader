import { useEffect } from 'react';
import { useReaderStore } from '../../components/read/Reader/Reader';

export const useComputeUnderlineMap = () => {
    const readerStore = useReaderStore();
    useEffect(() => {
        readerStore.computeUnderlineMap();
    }, [readerStore]);
};
