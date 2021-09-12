import React from 'react';
import { Text } from '@chakra-ui/react';
import { observer } from 'mobx-react';
import useDetectUnderline from '../../../hooks/reader/useDetectUnderline';
import { useOnClick } from '../../../hooks/reader/useOnClick';
import { useOnDoubleClick } from '../../../hooks/reader/useOnDoubleClick';
import { useSyncWordStatusMap } from '../../../hooks/reader/useSyncWordStatusMap';
import { useWordDisplayMaps } from '../../../hooks/reader/useWordDisplayMaps';
import './PageText.css';
import { useOnUnderline } from '../../../hooks/reader/useOnUnderline';
import { useSelectPageFirstWord } from '../../../hooks/reader/useSelectPageFirstWord';
import { useMarkDeletionHandler } from '../../../hooks/reader/useMarkDeletionHandler';

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

const PageTextWrapper: React.FC<{ lang: Language }> = ({ children, lang }) => {
    return (
        <Text
            as="pre"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            flex={1}
            padding="10px 20px 0px 20px"
            mb="10px"
            fontSize={lang === 'zh' ? '26px' : '22px'}
            overflowY="auto"
            textAlign="left"
            userSelect="none"
            id="reader-text"
        >
            {children}
        </Text>
    );
};

interface Props {
    page: string[];
    pageOffset: number;
    stopWordMap: Dictionary<boolean>;
    lang: Language;
}

const PageText: React.FC<Props> = ({ page, pageOffset, stopWordMap, lang }) => {
    const { classNameMap, wordStatusMap } = useWordDisplayMaps(
        page,
        pageOffset,
        stopWordMap
    );

    useSyncWordStatusMap(wordStatusMap);

    const onUnderline = useOnUnderline(pageOffset);
    useDetectUnderline(onUnderline);
    const markDeletionHandler = useMarkDeletionHandler(pageOffset);

    const onClick = useOnClick(markDeletionHandler);
    const onDoubleClick = useOnDoubleClick();

    useSelectPageFirstWord(page, pageOffset, stopWordMap);

    return (
        <PageTextWrapper lang={lang}>
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
                    // words will never change order reactively
                    key={index}
                />
            ))}
        </PageTextWrapper>
    );
};

export default observer(PageText);
