import { useEffect } from 'react';
import { useReaderStore } from '../../components/read/Reader/Reader';
import { useStore } from '../useStore';

export const useSyncUnderlineRanges = () => {
    const store = useStore();
    const readerStore = useReaderStore();
    useEffect(() => {
        readerStore.setUnderlineRanges(store.articleReadData?.underlines ?? []);
    }, [readerStore, store.articleReadData?.underlines]);
};
