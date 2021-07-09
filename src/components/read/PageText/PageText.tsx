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
    className: string;
    index: number;
}

const Word: React.FC<WordProps> = ({ word, className, index, onClick }) => {
    return (
        <Text
            as="span"
            className={className}
            onClick={onClick}
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

    const { classNameMap, stopWordMap, wordStatusMap } = useMemo(() => {
        const wordCount = page.length;

        const classNameMap: string[] = [];
        classNameMap[wordCount - 1] = ''; // extend array

        const stopWordMap: boolean[] = [];
        stopWordMap[wordCount - 1] = false; // extend array

        const wordStatusMap: WordStatus[] = [];
        wordStatusMap[wordCount - 1] = 'new'; // extend array

        for (let i = 0; i < wordCount; ++i) {
            const word = page[i];
            if (isStopWord(word)) {
                classNameMap[i] = '';
                stopWordMap[i] = true;
                continue;
            }

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
        };
    }, [store, page]);

    const readerStore = useReaderStore();

    useEffect(() => {
        readerStore.wordStatusMap = wordStatusMap;
    }, [readerStore, wordStatusMap]);

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
        >
            {page.map((word, index) => (
                <Word
                    word={word}
                    className={classNameMap[index]}
                    onClick={stopWordMap[index] ? undefined : onClick}
                    index={index}
                    key={index}
                />
            ))}
        </Text>
    );
};

export default observer(PageText);
