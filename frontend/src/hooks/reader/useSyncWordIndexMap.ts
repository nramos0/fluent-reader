import { useEffect } from 'react';
import { useReaderStore } from '../../components/read/Reader/Reader';

export const useSyncWordIndexMap = (wordIndexMap: Dictionary<number[]>) => {
    const readerStore = useReaderStore();
    useEffect(() => {
        readerStore.setWordIndexMap(wordIndexMap);
    }, [readerStore, wordIndexMap]);
};
