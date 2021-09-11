import { useCallback } from 'react';
import { useReaderStore } from '../../store/readerStore';
import { useStore } from '../useStore';

export const useOnDoubleClick = () => {
    const store = useStore();
    const readerStore = useReaderStore();

    return useCallback<OnClickFunction>(
        (e) => {
            if (readerStore.wordStatusMap === null) {
                return;
            }

            const word = e.target.innerText as string;
            const index = e.target.id;
            const status = readerStore.wordStatusMap[index];

            const newStatus =
                status === 'new'
                    ? 'learning'
                    : status === 'learning'
                    ? 'known'
                    : 'learning';

            if (readerStore.currentWord !== null) {
                store.updateWordStatus(word, newStatus, false);
                readerStore.updateWordStatus(newStatus);
            }
        },
        [readerStore, store]
    );
};
