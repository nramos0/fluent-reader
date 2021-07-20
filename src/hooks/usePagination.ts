import { useState, useMemo, useEffect } from 'react';
import usePages from './usePages';

interface PageCache<T> {
    [index: number]: T[];
}

export default function usePagination<T>(
    data: T[],
    nPerPage: number,
    initialPage = 0
) {
    const {
        currentPage,
        setCurrentPage,
        pageCount,
        setPageCount,
        incrementPage,
        decrementPage,
    } = usePages(initialPage);
    const [pageCache, setPageCache] = useState<PageCache<T>>({});

    useEffect(() => {
        setPageCache({});
    }, [data]);

    useEffect(() => {
        setPageCount(Math.ceil(data.length / nPerPage));
    }, [data.length, nPerPage, setPageCount]);

    const paginatedData = useMemo(() => {
        const startIndex = currentPage * nPerPage;
        const endIndex = (currentPage + 1) * nPerPage;

        if (pageCache[currentPage] !== undefined) {
            return pageCache[currentPage];
        }

        const newPage = data.slice(startIndex, endIndex);

        setPageCache((previousState) => {
            const newState = {
                ...previousState,
            };

            newState[currentPage] = newPage;

            return newState;
        });

        return newPage;
    }, [data, nPerPage, currentPage, pageCache]);

    return {
        data: paginatedData,
        currentPage: currentPage,
        setCurrentPage: setCurrentPage,
        pageCount: pageCount,
        decrementPage: decrementPage,
        incrementPage: incrementPage,
    };
}
