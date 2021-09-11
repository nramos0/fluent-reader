import { useEffect } from 'react';
import { useReaderStore } from '../../components/read/Reader/Reader';

export const useSyncWordStatusMap = (wordStatusMap: WordStatus[]) => {
    const readerStore = useReaderStore();
    useEffect(() => {
        // no need to separate into two effects.
        // one changes iff the other changes.
        readerStore.wordStatusMap = wordStatusMap;
    }, [readerStore, wordStatusMap]);
};
