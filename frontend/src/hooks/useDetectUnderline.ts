import { useCallback, useEffect, useState } from 'react';
import { useReaderStore } from '../components/read/Reader/Reader';

function useMouseEvent(
    handler: (e: MouseEvent) => void,
    type: 'mousedown' | 'mouseup'
) {
    useEffect(() => {
        window.addEventListener(type, handler);
        return () => {
            window.removeEventListener(type, handler);
        };
    }, [handler, type]);
}

// currently only works for adding new underlines
const useDetectUnderline = (
    onUnderline: (start: number, end: number) => void
) => {
    const readerStore = useReaderStore();

    const [{ isUnderlining, start, end }, setUnderlineState] = useState<{
        isUnderlining: boolean;
        start: number | null;
        end: number | null;
    }>({ isUnderlining: false, start: null, end: null });

    const onMouseUp = useCallback(
        (e: MouseEvent) => {
            if (e.target === null || readerStore.penState !== 'enabled') {
                return;
            }

            const target = e.target as any;
            if (
                typeof target.className === 'string' &&
                target.className.includes('word')
            ) {
                setUnderlineState((prev) => {
                    return {
                        ...prev,
                        end: parseInt(target.id),
                    };
                });
            }
        },
        [readerStore]
    );

    const onMouseDown = useCallback(
        (e: MouseEvent) => {
            if (e.target === null || readerStore.penState !== 'enabled') {
                return;
            }

            const target = e.target as any;
            if (
                typeof target.className === 'string' &&
                target.className.includes('word')
            ) {
                setUnderlineState({
                    isUnderlining: true,
                    start: parseInt(target.id),
                    end: null,
                });
            }
        },
        [readerStore]
    );

    useMouseEvent(onMouseUp, 'mouseup');
    useMouseEvent(onMouseDown, 'mousedown');

    useEffect(() => {
        if (isUnderlining && start !== null && end !== null) {
            const { realStart, realEnd } =
                start < end
                    ? { realStart: start, realEnd: end }
                    : { realStart: end, realEnd: start };

            onUnderline(realStart, realEnd);
            setUnderlineState({
                isUnderlining: false,
                start: null,
                end: null,
            });
        }
    }, [end, isUnderlining, onUnderline, start]);

    return null;
};

export default useDetectUnderline;
