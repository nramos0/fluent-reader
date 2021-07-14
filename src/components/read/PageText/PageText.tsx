import React, { useCallback, useEffect } from 'react';
import { Text } from '@chakra-ui/react';
import { useStore } from '../../../hooks/useStore';
import { useMemo } from 'react';
import { isStopWord } from '../../../util/lang';
import { observer } from 'mobx-react';
import { useReaderStore } from '../Reader/Reader';
import './PageText.css';

interface WordProps {
    word: string;
    onClick?: OnClickFunction;
    onDoubleClick?: OnClickFunction;
    className: string;
    index: number;
}

const Word: React.FC<WordProps> = ({
    word,
    className,
    index,
    onClick,
    onDoubleClick,
}) => {
    return (
        <Text
            as="span"
            className={className}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            id={String(index)}
        >
            {word}
        </Text>
    );
};

interface Props {
    page: string[];
}

const PageText: React.FC<Props> = ({ page }) => {
    const store = useStore();

    /**
     * Todo: move this work to the backend
     */
    const {
        classNameMap,
        stopWordMap,
        wordStatusMap,
        wordIndexMap,
    } = useMemo(() => {
        const wordCount = page.length;

        const classNameMap: string[] = [];
        classNameMap[wordCount] = ''; // extend array (1 extra)

        const stopWordMap: boolean[] = [];
        stopWordMap[wordCount] = false; // extend array (1 extra)

        const wordStatusMap: WordStatus[] = [];
        wordStatusMap[wordCount] = 'new'; // extend array (1 extra)

        const wordIndexMap: Dictionary<number[]> = {};

        for (let i = 0; i < wordCount; ++i) {
            const word = page[i];
            if (isStopWord(word)) {
                classNameMap[i] = '';
                stopWordMap[i] = true;
                continue;
            }

            const lowercase = word.toLowerCase();
            if (wordIndexMap[lowercase] === undefined) {
                wordIndexMap[lowercase] = [];
            }
            wordIndexMap[lowercase].push(i);

            stopWordMap[i] = false;

            const status = store.getWordStatus(word);
            wordStatusMap[i] = status;

            let className = '';
            switch (status) {
                case 'known':
                    className = 'word';
                    break;
                case 'new':
                    className = 'word new';
                    break;
                case 'learning':
                    className = 'word learning';
                    break;
            }

            classNameMap[i] = className;
        }

        return {
            classNameMap: classNameMap,
            stopWordMap: stopWordMap,
            wordStatusMap: wordStatusMap,
            wordIndexMap: wordIndexMap,
        };
    }, [store, page]);

    const readerStore = useReaderStore();

    useEffect(() => {
        // no need to separate into two effects.
        // one changes iff the other changes.
        readerStore.wordStatusMap = wordStatusMap;
        readerStore.wordIndexMap = wordIndexMap;
    }, [readerStore, wordIndexMap, wordStatusMap]);

    useEffect(() => {
        // find first word that is not a stop word and select it on page change
        const pageLength = page.length;
        for (let i = 0; i < pageLength; ++i) {
            if (stopWordMap[i]) {
                continue;
            }
            readerStore.setCurrentWord(page[i], wordStatusMap[i], String(i));
            return;
        }

        readerStore.clearCurrentWord();
    }, [page, readerStore, stopWordMap, wordStatusMap]);

    const onClick: OnClickFunction = useCallback(
        (e) => {
            if (readerStore.wordStatusMap === null) {
                return;
            }

            const word = e.target.innerText as string;
            const index = e.target.id;
            readerStore.setCurrentWord(
                word,
                readerStore.wordStatusMap[index],
                index
            );
        },
        [readerStore]
    );

    const onDoubleClick: OnClickFunction = useCallback(
        (e) => {
            if (readerStore.wordStatusMap === null) {
                return;
            }

            const word = e.target.innerText as string;
            const index = e.target.id;
            const status = readerStore.wordStatusMap[index];

            const newStatus =
                status === 'new'
                    ? 'learning'
                    : status === 'learning'
                    ? 'known'
                    : 'learning';

            if (readerStore.currentWord !== null) {
                store.updateWordStatus(word, newStatus, false);
                readerStore.updateWordStatus(newStatus);
            }
        },
        [readerStore, store]
    );

    return (
        <Text
            as="pre"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            flex={1}
            padding="10px 20px 0px 20px"
            mb="10px"
            fontSize="22px"
            overflowY="auto"
            textAlign="left"
            userSelect="none"
        >
            {page.map((word, index) => (
                <Word
                    word={word}
                    className={classNameMap[index]}
                    onClick={stopWordMap[index] ? undefined : onClick}
                    onDoubleClick={
                        stopWordMap[index] ? undefined : onDoubleClick
                    }
                    index={index}
                    key={index}
                />
            ))}
        </Text>
    );
};

export default observer(PageText);
