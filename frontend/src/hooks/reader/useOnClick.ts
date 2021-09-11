import { useCallback } from 'react';
import { useReaderStore } from '../../store/readerStore';

export const useOnClick = (markDeletionHandler: (index: number) => void) => {
    const readerStore = useReaderStore();

    return useCallback<OnClickFunction>(
        (e) => {
            if (readerStore.wordStatusMap === null) {
                return;
            }
            const element = e.target;

            const word = element.innerText as string;
            const index = element.id as string;

            const indexInt = (() => {
                try {
                    return Number.parseInt(index);
                } catch (err) {
                    return undefined;
                }
            })();

            if (indexInt === undefined) {
                console.error(
                    `Got non-integer index '${index}' for word '${word}'`
                );
                return;
            }

            markDeletionHandler(indexInt);

            readerStore.setCurrentWord(
                word,
                readerStore.wordStatusMap[indexInt],
                index
            );
        },
        [markDeletionHandler, readerStore]
    );
};
