import React, { useContext } from 'react';
import { Flex } from '@chakra-ui/react';
import ReadPages from '../ReadPages/ReadPages';
import ReaderSidebar from '../ReaderSidebar/ReaderSidebar';
import article from './test1.json';
import { observable } from 'mobx';

interface ReaderStore {
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

    visitedPageIndices: Dictionary<number>;

    markPageAsKnown: (
        page: string[],
        updateWordStatus: (word: string, status: WordStatus) => void
    ) => void;
}

const readerStore = observable({
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
            this.currentWord.status === newStatus
        ) {
            return;
        }

        const wordElement = document.getElementById(this.currentWord.id);

        if (wordElement === null) {
            return;
        }

        this.setCurrentWord(
            this.currentWord.word,
            newStatus,
            this.currentWord.id
        );

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

        wordElement.className = newClassName + newStatus;

        if (this.wordStatusMap !== null) {
            this.wordStatusMap[Number(this.currentWord.id)] = newStatus;
        }
    },

    wordStatusMap: null,

    visitedPageIndices: {},

    markPageAsKnown: function (page, updateWordStatus) {
        if (this.wordStatusMap === null) {
            return;
        }

        const pageLength = page.length;
        for (let i = 0; i < pageLength; ++i) {
            const word = page[i];
            if (this.wordStatusMap[i] === 'new') {
                updateWordStatus(word, 'known');
            }
        }
    },
} as ReaderStore);

const ReaderContext = React.createContext(readerStore);

export const useReaderStore = () => {
    return useContext(ReaderContext);
};

const Reader: React.FC<{}> = () => {
    return (
        <ReaderContext.Provider value={readerStore}>
            <Flex
                flex={1}
                direction="row"
                justify="center"
                align="center"
                height="100%"
            >
                <ReadPages pages={article.pages_lg} />
                <ReaderSidebar />
            </Flex>
        </ReaderContext.Provider>
    );
};

export default Reader;
