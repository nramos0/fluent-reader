import { useState, useEffect, useCallback } from 'react';

export default function usePages(initialPage = 0) {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [lastPage, setLastPage] = useState(initialPage - 1);
    const [pageCount, setPageCount] = useState<number>(0);

    useEffect(() => {
        if (currentPage >= pageCount) {
            setCurrentPage(initialPage);
            setLastPage(initialPage - 1);
        }
    }, [currentPage, initialPage, pageCount]);

    const incrementPage = useCallback(() => {
        setCurrentPage((previousPage) => {
            if (previousPage + 1 < pageCount) {
                setLastPage(previousPage);
                return previousPage + 1;
            } else return previousPage;
        });
    }, [pageCount]);

    const decrementPage = useCallback(() => {
        setCurrentPage((previousPage) => {
            if (previousPage > 0) {
                setLastPage(previousPage);
                return previousPage - 1;
            } else return previousPage;
        });
    }, []);

    return {
        currentPage: currentPage,
        lastPage: lastPage,
        setCurrentPage: setCurrentPage,
        pageCount: pageCount,
        setPageCount: setPageCount,
        decrementPage: decrementPage,
        incrementPage: incrementPage,
    };
}
