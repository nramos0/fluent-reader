import { useEffect } from 'react';
import { useReaderStore } from '../../store/readerStore';

export const useSelectPageFirstWord = (
    page: string[],
    pageOffset: number,
    stopWordMap: Dictionary<boolean>
) => {
    const readerStore = useReaderStore();

    useEffect(() => {
        if (readerStore.wordStatusMap === null) {
            return;
        }

        // find first word that is not a stop word and select it on page change
        const pageLength = page.length;
        for (let i = 0; i < pageLength; ++i) {
            if (stopWordMap[i + pageOffset]) {
                continue;
            }
            readerStore.setCurrentWord(
                page[i],
                readerStore.wordStatusMap[i],
                String(i)
            );
            return;
        }

        readerStore.clearCurrentWord();
    }, [page, pageOffset, readerStore, stopWordMap]);
};
