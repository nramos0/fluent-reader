import React from 'react';
import { Flex, Text } from '@chakra-ui/react';

interface Props {
    tags: string[];
}

const ArticleTags: React.FC<Props> = ({ tags }) => {
    return tags.length > 0 ? (
        <Flex direction="row" align="center" mt={2} wrap="wrap">
            {tags.map((tag) => (
                <Text
                    mr={2}
                    mb={2}
                    pt={1}
                    pb={1}
                    pr={2}
                    pl={2}
                    bgColor="#d16161"
                    color="white"
                    borderRadius="lg"
                    fontSize="smaller"
                    key={tag}
                >
                    {tag}
                </Text>
            ))}
        </Flex>
    ) : null;
};

export default ArticleTags;
