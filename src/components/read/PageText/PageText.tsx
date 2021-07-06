import React from 'react';
import { Text } from '@chakra-ui/react';
import { useStore } from '../../../hooks/useStore';
import { useMemo } from 'react';
import { isStopWord } from '../../../util/lang';
import { observer } from 'mobx-react';

import './PageText.css';

interface Props {
    page: string[];
}

const Word: React.FC<{ word: string }> = observer(({ word }) => {
    const store = useStore();

    const className: string = useMemo(() => {
        if (isStopWord(word)) {
            return '';
        }

        const status = store.getWordStatus(word);

        switch (status) {
            case 'known':
                return 'word';
            case 'new':
                return 'word non-known new';
            case 'learning':
                return 'word non-known learning';
        }
    }, [store, word]);

    return (
        <Text as="span" className={className}>
            {word}
        </Text>
    );
});

const PageText: React.FC<Props> = ({ page }) => {
    return (
        <Text
            as="pre"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            flex={1}
            padding="10px 20px 0px 20px"
            mb="10px"
            fontSize="24px"
            overflowY="auto"
            textAlign="left"
        >
            {page.map((word, index) => (
                <Word word={word} key={index} />
            ))}
        </Text>
    );
};

export default PageText;
