import React, { useCallback, useEffect } from 'react';
import { Text } from '@chakra-ui/react';
import { useStore } from '../../../hooks/useStore';
import { useMemo } from 'react';
import { observer } from 'mobx-react';
import { useReaderStore } from '../Reader/Reader';
import './PageText.css';
import useDetectUnderline from '../../../hooks/useDetectUnderline';

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
    pageOffset: number;
    stopWordMap: Dictionary<boolean>;
}

const PageText: React.FC<Props> = ({ page, pageOffset, stopWordMap }) => {
    const store = useStore();
    const readerStore = useReaderStore();

    /**
     * Todo: move this work to the backend
     */
    const { classNameMap, wordStatusMap } = useMemo(() => {
        const wordCount = page.length;

        const underlineMap = readerStore.underlineMap!;

        const classNameMap: string[] = [];
        classNameMap[wordCount] = ''; // extend array (1 extra)

        const wordStatusMap: WordStatus[] = [];
        wordStatusMap[wordCount] = 'new'; // extend array (1 extra)

        for (let i = 0; i < wordCount; ++i) {
            const word = page[i];
            if (stopWordMap[i + pageOffset]) {
                classNameMap[i] = '';
                if (underlineMap[i + pageOffset] !== undefined) {
                    classNameMap[i] += ` underline-${
                        underlineMap[i + pageOffset]
                    }`;
                }
                continue;
            }

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

            if (underlineMap[i + pageOffset] !== undefined) {
                classNameMap[i] += ` underline-${underlineMap[i + pageOffset]}`;
            }
        }

        return {
            classNameMap: classNameMap,
            wordStatusMap: wordStatusMap,
        };
    }, [page, pageOffset, readerStore.underlineMap, stopWordMap, store]);

    const onUnderline = useCallback(
        (start: number, end: number) => {
            const newRanges =
                readerStore.underlineRanges === null
                    ? []
                    : [...readerStore.underlineRanges];

            const selection: RangeSelect = {
                start: start + pageOffset,
                end: end + pageOffset,
            };

            newRanges.push({
                selection,
                color: readerStore.penColor,
            });

            readerStore.setUnderlineRanges(newRanges);
            readerStore.computeUnderlineMap();
        },
        [pageOffset, readerStore]
    );

    useDetectUnderline(onUnderline);

    useEffect(() => {
        // no need to separate into two effects.
        // one changes iff the other changes.
        readerStore.wordStatusMap = wordStatusMap;
    }, [readerStore, wordStatusMap]);

    useEffect(() => {
        // find first word that is not a stop word and select it on page change
        const pageLength = page.length;
        for (let i = 0; i < pageLength; ++i) {
            if (stopWordMap[i + pageOffset]) {
                continue;
            }
            readerStore.setCurrentWord(page[i], wordStatusMap[i], String(i));
            return;
        }

        readerStore.clearCurrentWord();
    }, [page, pageOffset, readerStore, stopWordMap, wordStatusMap]);

    const onClick: OnClickFunction = useCallback(
        (e) => {
            if (readerStore.wordStatusMap === null) {
                return;
            }

            const element = e.target;

            const word = element.innerText as string;
            const index = element.id;
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
            id="reader-text"
        >
            {page.map((word, index) => (
                <Word
                    word={word}
                    className={classNameMap[index]}
                    onClick={
                        stopWordMap[index + pageOffset] ? undefined : onClick
                    }
                    onDoubleClick={
                        stopWordMap[index + pageOffset]
                            ? undefined
                            : onDoubleClick
                    }
                    index={index}
                    key={index}
                />
            ))}
        </Text>
    );
};

export default observer(PageText);
