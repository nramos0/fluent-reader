import React, { useContext } from 'react';
import { observable } from 'mobx';
import { markArticle } from '../net/requests/markArticle';
import { deleteMark } from '../net/requests/deleteMark';

const binarySearch = <T extends unknown>(
    arr: T[],
    item: T,
    compare: (a: T, b: T) => number
) => {
    if (arr.length === 0) return -1;
    else if (compare(arr[arr.length - 1], item) <= 0) {
        return arr.length;
    }

    let min = 0;
    let max = arr.length;

    while (max >= min) {
        const mid = Math.floor((min + max) / 2);
        const comparison1 = mid > 0 ? compare(arr[mid - 1], item) : -1;
        const comparison2 = compare(arr[mid], item);

        if (comparison1 <= 0) {
            if (comparison2 >= 0) {
                // item is greater than or equal to arr[mid - 1] and less than or equal to arr[mid]
                return mid;
            } else {
                // item is greater than or equal to both arr[mid] and arr[mid - 1]
                min = mid + 1;
            }
        } else {
            // item is less than arr[mid - 1], so it is certainly less than arr[mid]
            max = mid - 1;
        }
    }

    return -1;
};

const compare = <T extends number>(a: T, b: T) => {
    return a - b;
};

interface ReaderStore {
    store: Store | null;

    currentWord: {
        word: string;
        status: WordStatus;
        id: string;
    } | null;
    setCurrentWord: (
        newWord: string,
        newStatus: WordStatus,
        newId: string
    ) => void;
    clearCurrentWord: () => void;

    updateWordStatus: (newStatus: WordStatus) => void;

    wordStatusMap: WordStatus[] | null;

    wordIndexMap: Dictionary<number[]> | null;
    setWordIndexMap: (map: Dictionary<number[]>) => void;

    visitedPageIndices: Dictionary<number>;
    clearVisitedPages: () => void;

    markPageAsKnown: (page: string[]) => void;

    doesPageSkipMoveToKnown: boolean;
    toggleDoesPageSkipMoveToKnown: () => void;

    penState: 'disabled' | 'enabled' | 'delete';
    togglePenEnabled: () => void;
    setPenDelete: () => void;
    penColor: MarkColor;
    setPenColor: (color: MarkColor, enablePen?: boolean) => void;

    underlineRanges: Mark[] | null;
    setUnderlineRanges: (ranges: Mark[]) => void;
    addUnderline: (mark: Mark) => void;
    removeUnderline: (index: number, articleId: number) => void;
    underlineMap: Dictionary<
        { color: MarkColor; index: number } | undefined
    > | null;
    computeUnderlineMap: () => boolean;

    pageOffsetMap: number[] | null;
    computePageOffsetMap: (pages: string[][]) => void;

    pageIndexRange: {
        start: number;
        end: number;
    } | null;
    computePageIndexRange: (page: number, length: number) => void;

    pageIndex: number;
    setPageIndex: (pageIndex: number) => void;
}

export const readerStore = observable({
    store: null,

    currentWord: null,
    setCurrentWord: function (newWord, newStatus, newId) {
        this.currentWord = {
            word: newWord,
            status: newStatus,
            id: newId,
        };
    },

    clearCurrentWord: function () {
        this.currentWord = null;
    },

    updateWordStatus: function (newStatus) {
        if (
            this.currentWord === null ||
            this.currentWord.status === newStatus ||
            this.wordStatusMap === null ||
            this.wordIndexMap === null ||
            this.pageIndexRange === null ||
            this.pageOffsetMap === null
        ) {
            return;
        }

        const wordElement = document.getElementById(this.currentWord.id);

        if (wordElement === null) {
            return;
        }

        const removeStatusList = (() => {
            switch (newStatus) {
                case 'new':
                    return ['learning', 'known'];
                case 'learning':
                    return ['new', 'known'];
                case 'known':
                    return ['new', 'learning'];
            }
        })();

        const classList = wordElement.className.split(' ');

        let newClassName = '';
        for (const className of classList) {
            if (!removeStatusList.includes(className)) {
                newClassName += className + ' ';
            }
        }
        newClassName += newStatus;

        wordElement.className = newClassName;
        this.wordStatusMap[Number(this.currentWord.id)] = newStatus;
        this.currentWord.status = newStatus;

        // update other occurrences of the current word in the page
        const pageTextParent = wordElement.parentElement;
        if (pageTextParent === null) {
            console.error(
                'Reader word has no parent! This should be impossible.'
            );
            return;
        }

        const wordList = pageTextParent.children;

        const otherOccurrences = this.wordIndexMap[
            this.currentWord.word.toLowerCase()
        ];

        const pageStart = this.pageIndexRange.start;
        const pageEnd = this.pageIndexRange.end;

        // binary search to find the start of the current page range
        const startIndex = binarySearch(otherOccurrences, pageStart, compare);
        if (startIndex === -1) {
            console.error(
                'updateWordStatus otherOccurrences startIndex search failed! pageStart:',
                pageStart,
                'otherOccurrences: ',
                otherOccurrences
            );
            return;
        }

        const endIndex = binarySearch(otherOccurrences, pageEnd, compare);
        if (endIndex === -1) {
            console.error(
                'updateWordStatus otherOccurrences endIndex search failed! pageEnd:',
                pageEnd,
                'otherOccurrences: ',
                otherOccurrences
            );
            return;
        }

        const pageOffset = this.pageOffsetMap[this.pageIndex];

        for (let index = startIndex; index < endIndex; ++index) {
            const wordListIndex = otherOccurrences[index] - pageOffset;
            const otherWordElement = wordList[wordListIndex];

            otherWordElement.className = newClassName;
            this.wordStatusMap[wordListIndex] = newStatus;
        }
    },

    wordStatusMap: null,

    wordIndexMap: null,
    setWordIndexMap(map) {
        this.wordIndexMap = map;
    },

    visitedPageIndices: {},
    clearVisitedPages() {
        this.visitedPageIndices = {};
    },

    markPageAsKnown: function (page) {
        if (
            !this.doesPageSkipMoveToKnown ||
            this.wordStatusMap === null ||
            this.store === null
        ) {
            return;
        }

        const wordStatusData = this.store.getWordStatusData();

        const newWords: string[] = [];

        const pageLength = page.length;
        for (let i = 0; i < pageLength; ++i) {
            const word = page[i];
            if (this.wordStatusMap[i] === 'new') {
                const lowercase = word.toLowerCase();
                newWords.push(lowercase);
                wordStatusData.known[lowercase] = 1;
            }
        }

        this.store.updateWordStatusBatch(newWords, 'known');
    },

    doesPageSkipMoveToKnown: false,

    toggleDoesPageSkipMoveToKnown() {
        this.doesPageSkipMoveToKnown = !this.doesPageSkipMoveToKnown;
    },

    penState: 'disabled',

    togglePenEnabled() {
        this.penState = this.penState !== 'disabled' ? 'disabled' : 'enabled';
    },

    setPenDelete() {
        this.penState = 'delete';
    },

    penColor: 'black',

    setPenColor(color, enablePen = false) {
        this.penColor = color;

        if (enablePen) {
            this.penState = 'enabled';
        }
    },

    underlineRanges: null,
    setUnderlineRanges(ranges) {
        this.underlineRanges = ranges;
    },

    addUnderline(mark) {
        if (this.store === null || this.store.readArticle === null) {
            return;
        }

        const newRanges =
            this.underlineRanges === null ? [] : [...this.underlineRanges];

        newRanges.push(mark);

        this.underlineRanges = newRanges;
        this.computeUnderlineMap();

        if (this.store.articleReadData) {
            this.store.articleReadData.underlines = newRanges;
        }

        markArticle(
            {
                article_id: this.store.readArticle.id,
                mark,
            },
            this.store.token
        );
    },

    removeUnderline(index, articleId) {
        if (this.underlineRanges === null) {
            return;
        }

        this.underlineRanges.splice(index, 1);
        this.underlineRanges = this.underlineRanges.concat();
        this.computeUnderlineMap();

        deleteMark(
            {
                article_id: articleId,
                index,
            },
            this.store?.token
        );
    },

    underlineMap: {},
    computeUnderlineMap() {
        if (
            this.underlineRanges === null ||
            this.store === null ||
            this.store.readArticle === null
        ) {
            return false;
        }

        let length = 0;
        const article = this.store.readArticle;
        const pages = article.page_data[2].pages;

        for (let i = 0; i < pages.length; ++i) {
            length += pages[i].length;
        }

        const underlineMap: Dictionary<
            { color: MarkColor; index: number } | undefined
        > = {};
        underlineMap[length] = undefined; // extend the array

        const underlines = this.underlineRanges;
        const underlineCount = underlines.length;

        for (let i = 0; i < underlineCount; ++i) {
            const underline = underlines[i];
            const range = underline.selection;
            for (let j = range.start; j <= range.end; ++j) {
                underlineMap[j] = {
                    color: underline.color,
                    index: i,
                };
            }
        }

        this.underlineMap = underlineMap;

        return true;
    },

    pageOffsetMap: null,
    computePageOffsetMap(pages) {
        const map: number[] = [];

        map[0] = 0;

        for (let i = 1; i < pages.length; ++i) {
            map[i] = map[i - 1] + pages[i - 1].length;
        }

        this.pageOffsetMap = map;
    },

    pageIndexRange: null,
    computePageIndexRange(page: number, length: number) {
        if (this.pageOffsetMap === null) {
            return;
        }

        const start = this.pageOffsetMap[page];
        const end = start + length;

        this.pageIndexRange = {
            start,
            end,
        };
    },

    pageIndex: 0,
    setPageIndex(pageIndex) {
        this.pageIndex = pageIndex;
    },
} as ReaderStore);

export const ReaderContext = React.createContext(readerStore);

export const useReaderStore = () => {
    return useContext(ReaderContext);
};
