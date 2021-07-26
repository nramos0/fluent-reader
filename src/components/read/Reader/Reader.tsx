import React, { useContext, useEffect } from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';
import ReadPages from '../ReadPages/ReadPages';
import ReaderSidebar from '../ReaderSidebar/ReaderSidebar';
import { observable } from 'mobx';
import { useStore } from '../../../hooks/useStore';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

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

    visitedPageIndices: Dictionary<number>;
    clearVisitedPages: () => void;

    markPageAsKnown: (page: string[]) => void;

    doesPageSkipMoveToKnown: boolean;
    toggleDoesPageSkipMoveToKnown: () => void;

    penEnabled: boolean;
    togglePenEnabled: () => void;
    penColor: UnderlineColor;
    setPenColor: (color: UnderlineColor) => void;

    underlineRanges: UnderlineRange[] | null;
    setUnderlineRanges: (ranges: UnderlineRange[]) => void;
    underlineMap: (UnderlineColor | undefined)[] | null;
    computeUnderlineMap: () => boolean;

    pageOffsetMap: number[] | null;
    computePageOffsetMap: (pages: string[][]) => void;
}

const readerStore = observable({
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
            this.wordIndexMap === null
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
        for (const index of otherOccurrences) {
            const otherWordElement = wordList[index];

            otherWordElement.className = newClassName;
            this.wordStatusMap[index] = newStatus;
        }
    },

    wordStatusMap: null,
    wordIndexMap: null,

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

    penEnabled: false,

    togglePenEnabled() {
        this.penEnabled = !this.penEnabled;
    },

    penColor: 'black',

    setPenColor(color) {
        this.penColor = color;
    },

    underlineRanges: [
        { selection: { start: 0, end: 40 }, color: 'red' },
        { selection: { start: 16, end: 16 }, color: 'blue' },
        { selection: { start: 80, end: 91 }, color: 'green' },
        { selection: { start: 215, end: 229 }, color: 'black' },
    ],
    setUnderlineRanges(ranges: UnderlineRange[]) {
        this.underlineRanges = ranges;
    },
    underlineMap: [] as (UnderlineColor | undefined)[],
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

        const underlineMap: (UnderlineColor | undefined)[] = [];
        underlineMap[length] = undefined; // extend the array

        const underlines = this.underlineRanges;
        const underlineCount = underlines.length;

        for (let i = 0; i < underlineCount; ++i) {
            const underline = underlines[i];
            const range = underline.selection;
            for (let j = range.start; j <= range.end; ++j) {
                underlineMap[j] = underline.color;
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
            map[i] = map[i - 1] + pages[i].length;
        }

        this.pageOffsetMap = map;
    },
} as ReaderStore);

const ReaderContext = React.createContext(readerStore);

export const useReaderStore = () => {
    return useContext(ReaderContext);
};

// binds a store reference to the reader store
const useStoreBind = () => {
    const store = useStore();
    const readerStore = useReaderStore();

    useEffect(() => {
        readerStore.store = store;
    }, [readerStore, store]);

    return null;
};

const StoreBind: React.FC = observer(() => {
    return useStoreBind();
});

const ArticleEffect: React.FC = observer(() => {
    const store = useStore();
    const article = store.readArticle;

    const readerStore = useReaderStore();

    useEffect(() => {
        readerStore.clearCurrentWord();
        readerStore.clearVisitedPages();
    }, [article, readerStore]);

    useEffect(() => {
        readerStore.clearVisitedPages();
    }, [readerStore, readerStore.doesPageSkipMoveToKnown]);

    return null;
});

const Reader: React.FC<{}> = () => {
    const { t } = useTranslation('reader');

    const history = useHistory();

    const store = useStore();
    const article = store.readArticle;

    return (
        <ReaderContext.Provider value={readerStore}>
            <Flex
                flex={1}
                direction="row"
                justify="center"
                align="center"
                height="100%"
            >
                <StoreBind />
                <ArticleEffect />
                {article === null ? (
                    <Flex
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                        backgroundColor="#fff"
                        borderRadius="lg"
                        margin="0 auto"
                        color="#222"
                        w="80%"
                        p="100px 0px"
                        fontSize="20px"
                        fontWeight="bold"
                    >
                        <Text mb={3} color="#661919">
                            {t('no-article-open')}
                        </Text>
                        <Button
                            size="lg"
                            bgColor="#661919"
                            color="white"
                            border="2px solid #661919"
                            _hover={{
                                bgColor: 'white',
                                color: '#661919',
                            }}
                            _active={{
                                borderColor: '#ccc',
                                bgColor: '#ccc',
                            }}
                            onClick={() => {
                                history.push('/app/library');
                            }}
                        >
                            {t('common:library')}
                        </Button>
                    </Flex>
                ) : (
                    <>
                        <ReadPages pages={article.page_data[2].pages} />
                        <ReaderSidebar />
                    </>
                )}
            </Flex>
        </ReaderContext.Provider>
    );
};

export default observer(Reader);
