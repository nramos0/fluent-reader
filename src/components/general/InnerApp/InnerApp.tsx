import React, { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import { Route, useHistory } from 'react-router-dom';
import SideBar from '../SideBar/SideBar';
import Library from '../../library/Library/Library';

const InnerApp: React.FC = () => {
    const history = useHistory();

    useEffect(() => {
        const lastPage = localStorage.getItem('lastPage');

        if (lastPage === null) {
            history.push('/app/library');
        } else {
            history.push(lastPage);
        }
    }, [history]);

    return (
        <Flex direction="row" w="100%" h="100%">
            <SideBar />
            <Route path="/app/library">
                <Library />
            </Route>
            <Route path="/app/read">Read</Route>
            <Route path="/app/add-article">Add Article</Route>
            <Route path="/app/settings">Settings</Route>
        </Flex>
    );
};

export default InnerApp;
