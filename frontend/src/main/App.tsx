import React, { useCallback, useState, useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import { Switch, Route } from 'react-router-dom';

import InnerApp from '../components/general/InnerApp/InnerApp';
import LoadWrapper from '../components/general/LoadWrapper/LoadWrapper';
import Logout from '../components/general/Logout/Logout';
import I18nBind from '../components/general/I18nBind/I18nBind';
import DataFetch from '../components/DataFetch/DataFetch';
import AccountPage from '../components/account/AccountPage/AccountPage';

import { observer } from 'mobx-react';
import { useContext } from 'react';

import './App.css';
import {
    useAppRedirectOnGotData,
    useAuthCheck,
    useLogoutRedirect,
    useStartInitialLoad,
} from '../hooks/app';

interface AppState {
    shouldFetchUserData: boolean;
    hasData: boolean;
    isLoggingOut: boolean;
}

interface AppInfo {
    setShouldFetchUserData: (shouldFetchUserData: boolean) => void;
    setHasData: (hasData: boolean) => void;
    setIsLoggingOut: (isLoggingOut: boolean) => void;
}

const AppContext = React.createContext<AppInfo>(undefined!);

export const useAppContext = () => {
    return useContext(AppContext);
};

export enum NonAppLocation {
    Account = '/account',
    Logout = '/logout',
}

export interface InitialLoadData {
    startInitialLoad: boolean;
    promiseList: Promise<unknown>[];
}

const App = () => {
    const [
        { shouldFetchUserData, hasData, isLoggingOut },
        setAppState,
    ] = useState<AppState>({
        shouldFetchUserData: false,
        hasData: false,
        isLoggingOut: false,
    });

    const [initialLoadData, setInitialLoadData] = useState<InitialLoadData>({
        startInitialLoad: false,
        promiseList: [],
    });

    const setShouldFetchUserData = useCallback(
        (shouldFetchUserData: boolean) => {
            setAppState((prev) => ({
                ...prev,
                shouldFetchUserData,
            }));
        },
        []
    );
    const setHasData = useCallback((hasData: boolean) => {
        setAppState((prev) => ({
            ...prev,
            hasData,
        }));
    }, []);

    const setIsLoggingOut = useCallback((isLoggingOut: boolean) => {
        setAppState((prev) => ({
            ...prev,
            isLoggingOut,
        }));
    }, []);

    useAppRedirectOnGotData(hasData, setShouldFetchUserData);

    useLogoutRedirect(isLoggingOut, hasData, shouldFetchUserData);

    const { onAuth } = useAuthCheck(setShouldFetchUserData);
    const initialLoad = useCallback(async () => {
        // cannot reject, onAuth() wraps its awaited promise in a to() call
        await onAuth();
    }, [onAuth]);

    useStartInitialLoad(initialLoad, setInitialLoadData);

    const contextData = useMemo(() => {
        return { setShouldFetchUserData, setHasData, setIsLoggingOut };
    }, [setHasData, setIsLoggingOut, setShouldFetchUserData]);

    return (
        <Box
            w="100vw"
            h="100vh"
            bgGradient="linear(to-b, #c15151, #c70505, #b82e2e, #902323, c1)"
        >
            <Box className="App" h="inherit">
                <AppContext.Provider value={contextData}>
                    <LoadWrapper
                        promiseList={initialLoadData.promiseList}
                        startInitialLoad={initialLoadData.startInitialLoad}
                    >
                        <I18nBind />
                        <DataFetch
                            fetch={shouldFetchUserData}
                            setHasData={setHasData}
                        />
                        <Switch>
                            <Route path={NonAppLocation.Account}>
                                <AccountPage />
                            </Route>
                            <Route path="/app">{hasData && <InnerApp />}</Route>
                            <Route path={NonAppLocation.Logout}>
                                <Logout />
                            </Route>
                        </Switch>
                    </LoadWrapper>
                </AppContext.Provider>
            </Box>
        </Box>
    );
};

export default observer(App);
