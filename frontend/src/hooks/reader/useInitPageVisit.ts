import { useEffect } from 'react';
import { useReaderStore } from '../../store/readerStore';
import { useStore } from '../useStore';

export const useHandleVisitedPages = (currPageIndex: number) => {
    const store = useStore();
    const readerStore = useReaderStore();

    // clear visited pages whenever the article changes
    useEffect(() => {
        readerStore.clearVisitedPages();
    }, [readerStore, store.readArticle]);

    // clear visited pages whenever the "paging moves new words
    // to known" setting is changed
    useEffect(() => {
        readerStore.clearVisitedPages();
    }, [readerStore, readerStore.doesPageSkipMoveToKnown]);

    // initialize the current page as being visited
    useEffect(() => {
        if (readerStore.visitedPageIndices[currPageIndex] === undefined) {
            readerStore.visitedPageIndices[currPageIndex] = 1;
        }
    }, [currPageIndex, readerStore.visitedPageIndices]);
};
