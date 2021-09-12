import React from 'react';
import { Flex } from '@chakra-ui/react';
import { Route } from 'react-router-dom';
import SideBar from '../SideBar/SideBar';
import Library from '../../library/Library/Library';
import AddArticle from '../../add-article/AddArticle/AddArticle';
import Reader from '../../read/Reader/Reader';
import Settings from '../../settings/Settings/Settings';
import About from '../../about/About/About';
import { useSyncPageToStorage } from '../../../hooks/innerApp/useSyncPageToStorage';
import { useReturnToLastPage } from '../../../hooks/innerApp/useReturnToLastPage';

export enum AppLocation {
    Library = '/app/library',
    Read = '/app/read',
    AddArticle = '/app/add-article',
    EditArticle = '/app/edit-article',
    About = '/app/about',
    Settings = '/app/settings',
}

export const appLocationValues = Object.values(AppLocation);

const InnerApp: React.FC = () => {
    useReturnToLastPage();
    useSyncPageToStorage();

    return (
        <Flex w="100%" h="100%">
            <SideBar />
            <Route path={AppLocation.Library}>
                <Library />
            </Route>
            <Route path={AppLocation.Read}>
                <Reader />
            </Route>
            <Route path={AppLocation.AddArticle}>
                <AddArticle />
            </Route>
            <Route path={`${AppLocation.EditArticle}/:id`}>
                <AddArticle />
            </Route>
            <Route path={AppLocation.About}>
                <About />
            </Route>
            <Route path={AppLocation.Settings}>
                <Settings />
            </Route>
        </Flex>
    );
};

export default InnerApp;
