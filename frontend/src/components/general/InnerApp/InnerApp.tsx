import React, { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import { Route, useHistory, useLocation } from 'react-router-dom';
import SideBar from '../SideBar/SideBar';
import Library from '../../library/Library/Library';
import AddArticle from '../../add-article/AddArticle/AddArticle';
import Reader from '../../read/Reader/Reader';
import Settings from '../../settings/Settings/Settings';
import About from '../../about/About/About';

const validLocations = [
    '/app/library',
    '/app/read',
    '/app/add-article',
    '/app/edit-article',
    '/app/about',
    '/app/settings',
];

const InnerApp: React.FC = () => {
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        const lastPage = localStorage.getItem('lastPage');

        if (lastPage === null) {
            history.push('/app/library');
        } else {
            if (
                !validLocations.some((validPath) =>
                    location.pathname.includes(validPath)
                )
            ) {
                history.push(lastPage);
            }
        }
    }, [history, location.pathname]);

    useEffect(() => {
        localStorage.setItem('lastPage', location.pathname);
    }, [location.pathname]);

    return (
        <Flex w="100%" h="100%">
            <SideBar />
            <Route path="/app/library">
                <Library />
            </Route>
            <Route path="/app/read">
                <Reader />
            </Route>
            <Route path="/app/add-article">
                <AddArticle />
            </Route>
            <Route path="/app/edit-article/:id">
                <AddArticle />
            </Route>
            <Route path="/app/about">
                <About />
            </Route>
            <Route path="/app/settings">
                <Settings />
            </Route>
        </Flex>
    );
};

export default InnerApp;
