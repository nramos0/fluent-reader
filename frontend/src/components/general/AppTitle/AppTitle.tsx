import React from 'react';
import { Heading } from '@chakra-ui/react';

const AppTitle: React.FC = () => {
    return (
        <Heading
            textAlign="center"
            fontSize="x-large"
            pt={3}
            pb={3}
            pl={1}
            pr={1}
            bgGradient="linear(to-b, #D16161, #D70505, #b82e2e, #A02323, #881919)"
            color="white"
        >
            Fluent Reader
        </Heading>
    );
};

export default AppTitle;
