import React, { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import { useStore } from '../../../hooks/useStore';
import { observer } from 'mobx-react';
import NoArticleDisplay from './NoArticleDisplay';
import ReaderDisplay from './ReaderDisplay';
import {
    ReaderContext,
    readerStore,
    useReaderStore,
} from '../../../store/readerStore';

// binds a store reference to the reader store
const StoreBind: React.FC = observer(() => {
    const store = useStore();
    const readerStore = useReaderStore();

    useEffect(() => {
        readerStore.store = store;
    }, [readerStore, store]);

    return null;
});

const ArticleEffect: React.FC = observer(() => {
    const store = useStore();
    const article = store.readArticle;

    const readerStore = useReaderStore();

    // clear current word when article changes
    useEffect(() => {
        readerStore.clearCurrentWord();
    }, [article, readerStore]);

    return null;
});

const Reader: React.FC = () => {
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
                    <NoArticleDisplay />
                ) : (
                    <ReaderDisplay
                        pages={article.page_data[2].pages}
                        wordIndexMap={article.word_index_map}
                    />
                )}
            </Flex>
        </ReaderContext.Provider>
    );
};

export default observer(Reader);
