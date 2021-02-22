import React, { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import { Route, useHistory } from 'react-router-dom';
import SideBar from '../SideBar/SideBar';
import Library from '../../library/Library/Library';
import AddArticle from '../../add-article/AddArticle/AddArticle';

const InnerApp: React.FC = () => {
    const history = useHistory();

    useEffect(() => {
        const lastPage = localStorage.getItem('lastPage');
        history.push('/app/add-article');

        if (lastPage === null) {
            // history.push('/app/add-article');
        } else {
            // history.push(lastPage);
        }
    }, [history]);

    useEffect(() => {
        localStorage.setItem('lastPage', history.location.pathname);
    }, [history.location.pathname]);

    return (
        <Flex direction="row" w="100%" h="100%">
            <SideBar />
            <Route path="/app/library">
                <Library />
            </Route>
            <Route path="/app/read">Read</Route>
            <Route path="/app/add-article">
                <AddArticle />
            </Route>
            <Route path="/app/settings">Settings</Route>
        </Flex>
    );
};

export default InnerApp;
