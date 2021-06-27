import React from 'react';
import { Flex } from '@chakra-ui/react';
import NavBar from '../NavBar/NavBar';
import AppTitle from '../AppTitle/AppTitle';

interface Props {}

const SideBar: React.FC<Props> = (_props) => {
    return (
        <Flex
            direction={{ md: 'row', lg: 'column' }}
            align="flex-start"
            w={{ base: '100%', lg: '12.5%' }}
            h="100%"
            bgColor="white"
            alignItems="stretch"
        >
            <AppTitle />
            <NavBar />
        </Flex>
    );
};

export default SideBar;
