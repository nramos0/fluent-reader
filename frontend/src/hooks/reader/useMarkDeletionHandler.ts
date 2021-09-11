import { useCallback } from 'react';
import { useReaderStore } from '../../store/readerStore';
import { useStore } from '../useStore';

export const useMarkDeletionHandler = (pageOffset: number) => {
    const store = useStore();
    const readerStore = useReaderStore();

    return useCallback(
        (clickedWordIndex: number) => {
            if (
                readerStore.penState === 'delete' &&
                readerStore.underlineMap !== null
            ) {
                const underline =
                    readerStore.underlineMap[clickedWordIndex + pageOffset];

                if (underline && store.readArticle) {
                    readerStore.removeUnderline(
                        underline.index,
                        store.readArticle.id
                    );
                }
            }
        },
        [pageOffset, readerStore, store.readArticle]
    );
};
