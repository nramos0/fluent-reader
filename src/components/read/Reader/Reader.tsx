import React, { useContext } from 'react';
import { Flex } from '@chakra-ui/react';
import ReadPages from '../ReadPages/ReadPages';
import ReaderSidebar from '../ReaderSidebar/ReaderSidebar';
import article from './test1.json';
import { observable } from 'mobx';

interface ReaderStore {
    currentWord: string | null;
    setCurrentWord: (newWord: string, newStatus: WordStatus) => void;
    currentWordStatus: WordStatus | null;
}

const readerStore = observable({
    currentWord: null,
    currentWordStatus: null,
    setCurrentWord: function (newWord, newStatus) {
        this.currentWord = newWord;
        this.currentWordStatus = newStatus;
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
