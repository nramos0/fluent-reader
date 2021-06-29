import React from 'react';
import { Text } from '@chakra-ui/react';

interface Props {
    page: string[];
}

const PageText: React.FC<Props> = ({ page }) => {
    return (
        <Text
            as="pre"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            flex={1}
            mb="10px"
            fontSize="24px"
            overflowY="auto"
            textAlign="left"
        >
            {page.map((word, index) => (
                <Text as="span" key={index}>
                    {word}
                </Text>
            ))}
        </Text>
    );
};

export default PageText;
