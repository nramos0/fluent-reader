import React, { useContext, useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import ReadPages from '../ReadPages/ReadPages';
import ReaderSidebar from '../ReaderSidebar/ReaderSidebar';
import article from './test1.json';
import { observable } from 'mobx';
import { useStore } from '../../../hooks/useStore';
import { observer } from 'mobx-react';

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

    markPageAsKnown: (page: string[]) => void;

    doesPageSkipMoveToKnown: boolean;
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

    markPageAsKnown: function (page) {
        if (
            !this.doesPageSkipMoveToKnown ||
            this.wordStatusMap === null ||
            this.store === null
        ) {
            return;
        }

        const wordStatusData = this.store.wordData.word_status_data[
            this.store.studyLanguage
        ];

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

const Reader: React.FC<{}> = () => {
    useStoreBind();

    return (
        <ReaderContext.Provider value={readerStore}>
            <Flex
                flex={1}
                direction="row"
                justify="center"
                align="center"
                height="100%"
            >
                <ReadPages pages={article.page_data[2].pages} />
                <ReaderSidebar />
            </Flex>
        </ReaderContext.Provider>
    );
};

export default observer(Reader);