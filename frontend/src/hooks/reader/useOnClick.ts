import { useCallback } from 'react';
import { useReaderStore } from '../../components/read/Reader/Reader';
import { useStore } from '../useStore';

export const useOnClick = () => {
    const store = useStore();
    const readerStore = useReaderStore();
    return useCallback<OnClickFunction>(
        (e) => {
            if (readerStore.wordStatusMap === null) {
                return;
            }
            const element = e.target;

            const word = element.innerText as string;
            const index = element.id;

            if (
                readerStore.penState === 'delete' &&
                readerStore.underlineMap !== null
            ) {
                const underline = readerStore.underlineMap[index];
                if (underline && store.readArticle) {
                    readerStore.removeUnderline(
                        underline.index,
                        store.readArticle.id
                    );
                }
            }

            readerStore.setCurrentWord(
                word,
                readerStore.wordStatusMap[index],
                index
            );
        },
        [readerStore, store.readArticle]
    );
};
