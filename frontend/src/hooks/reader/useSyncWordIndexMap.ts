import { useEffect } from 'react';
import { useReaderStore } from '../../store/readerStore';

export const useSyncWordIndexMap = (wordIndexMap: Dictionary<number[]>) => {
    const readerStore = useReaderStore();
    useEffect(() => {
        readerStore.setWordIndexMap(wordIndexMap);
    }, [readerStore, wordIndexMap]);
};
