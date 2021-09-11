import { useCallback } from 'react';
import { useReaderStore } from '../../components/read/Reader/Reader';

export const useOnUnderline = (pageOffset: number) => {
    const readerStore = useReaderStore();
    return useCallback(
        (start: number, end: number) => {
            readerStore.addUnderline({
                selection: {
                    start: start + pageOffset,
                    end: end + pageOffset,
                },
                color: readerStore.penColor,
                mark_type: 'underline',
            });
        },
        [pageOffset, readerStore]
    );
};
