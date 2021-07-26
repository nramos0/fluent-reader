import React from 'react';
import { Flex } from '@chakra-ui/react';
import { observer } from 'mobx-react';
import Dictionary from '../Dictionary/Dictionary';
import Pen from '../Pen/Pen';

const ReaderSidebar: React.FC<{}> = () => {
    return (
        <Flex
            backgroundColor="#fff"
            flex={3}
            height="90%"
            borderRadius="lg"
            color="#661919"
            overflowY="auto"
            direction="column"
            align="center"
            margin="0px 15px 0px 7.5px"
            padding="0px 10px 7.5px 10px"
        >
            <Dictionary />
            <Pen />
        </Flex>
    );
};

export default observer(ReaderSidebar);
