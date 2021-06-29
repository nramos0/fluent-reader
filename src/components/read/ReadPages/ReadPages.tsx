import React, { useState } from 'react';
import { Flex, Text, Box, Button } from '@chakra-ui/react';

interface Props {
    pages: string[][];
}

const ReadPages: React.FC<Props> = ({ pages }) => {
    const [page, setPage] = useState(0);
    const pageCountM1 = pages.length - 1;
    return (
        <Flex
            direction="column"
            justifyContent="center"
            alignItems="center"
            overflowY="auto"
            flex={1}
            overflowX="hidden"
        >
            <Box
                backgroundColor="#fff"
                width="90%"
                height="90%"
                borderRadius="lg"
                color="#222"
                padding="10px 20px 0px 20px"
                overflowY="auto"
                display="flex"
                flexDir="column"
            >
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
                    {pages[page].map((word, index) => (
                        <Text as="span" key={index}>
                            {word}
                        </Text>
                    ))}
                </Text>
                <Box w="100%" border="thin solid #CCC" />
                <Box height="5%" p="5px">
                    Page {page + 1}
                </Box>
                <Flex height="10%" direction="row" p="10px">
                    <Button
                        flex={1}
                        mr="5px"
                        onClick={() => {
                            if (page > 0) {
                                setPage((prev) => prev - 1);
                            }
                        }}
                        disabled={page <= 0}
                    >
                        Prev
                    </Button>
                    <Button
                        flex={1}
                        mr="5px"
                        onClick={() => {
                            if (page < pageCountM1) {
                                setPage((prev) => prev + 1);
                            }
                        }}
                        disabled={page >= pageCountM1}
                    >
                        Next
                    </Button>
                </Flex>
            </Box>
        </Flex>
    );
};

export default ReadPages;
