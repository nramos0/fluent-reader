import React from 'react';
import { Box, ChakraComponent } from '@chakra-ui/react';

const ScrollBox: ChakraComponent<'div', {}> = (props) => {
    return (
        <Box
            overflowY="auto"
            css={{
                '&::-webkit-scrollbar': {
                    width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#EEEEEE',
                    borderRadius: '24px',
                },
            }}
            {...props}
        >
            {props.children}
        </Box>
    );
};

export default ScrollBox;
