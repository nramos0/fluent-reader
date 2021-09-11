import { useReaderStore } from '../../store/readerStore';
import { useMemo } from 'react';
import { useStore } from '../useStore';

/**
 * Consider underlining as a side effect instead of
 * being coupled with recomputing both classNameMap and wordStatusMap
 */
export const useWordDisplayMaps = (
    page: string[],
    pageOffset: number,
    stopWordMap: Dictionary<boolean>
) => {
    const store = useStore();
    const readerStore = useReaderStore();

    return useMemo(() => {
        const wordCount = page.length;

        const underlineMap = readerStore.underlineMap!;

        const classNameMap: string[] = [];
        classNameMap[wordCount] = ''; // extend array (1 extra)

        const wordStatusMap: WordStatus[] = [];
        wordStatusMap[wordCount] = 'new'; // extend array (1 extra)

        for (let i = 0; i < wordCount; ++i) {
            const word = page[i];
            if (stopWordMap[i + pageOffset]) {
                classNameMap[i] = '';
                if (underlineMap[i + pageOffset] !== undefined) {
                    classNameMap[i] += ` underline-${
                        underlineMap[i + pageOffset]?.color
                    }`;
                }
                continue;
            }

            const status = store.getWordStatus(word);
            wordStatusMap[i] = status;

            let className = '';
            switch (status) {
                case 'known':
                    className = 'word';
                    break;
                case 'new':
                    className = 'word new';
                    break;
                case 'learning':
                    className = 'word learning';
                    break;
            }

            classNameMap[i] = className;

            if (underlineMap[i + pageOffset] !== undefined) {
                classNameMap[i] += ` underline-${
                    underlineMap[i + pageOffset]?.color
                }`;
            }
        }

        return {
            classNameMap: classNameMap,
            wordStatusMap: wordStatusMap,
        };
    }, [page, pageOffset, readerStore.underlineMap, stopWordMap, store]);
};
