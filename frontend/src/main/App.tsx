import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import { Switch, Route, useHistory, useLocation } from 'react-router-dom';
import to from 'await-to-js';

import InnerApp from '../components/general/InnerApp/InnerApp';
import LoadWrapper from '../components/general/LoadWrapper/LoadWrapper';
import Logout from '../components/general/Logout/Logout';
import I18nBind from '../components/general/I18nBind/I18nBind';
import DataFetch from '../components/DataFetch/DataFetch';
import AccountPage from '../components/account/AccountPage/AccountPage';

import { i18nInitPromise } from '../i18n';
import { useAuth } from '../components/general/AuthWrapper/AuthWrapper';
import { authenticate } from '../net/requests/auth';
import { observer } from 'mobx-react';
import { useContext } from 'react';

import './App.css';

interface AppInfo {
    setShouldFetchUserData: React.Dispatch<React.SetStateAction<boolean>>;
    setHasData: React.Dispatch<React.SetStateAction<boolean>>;
    setIsLoggingOut: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = React.createContext<AppInfo>(undefined!);

export const useAppContext = () => {
    return useContext(AppContext);
};

function App() {
    const auth = useAuth();
    const history = useHistory();
    const location = useLocation();
    const showToast = useToast();

    const [shouldFetchUserData, setShouldFetchUserData] = useState(false);
    const [hasData, setHasData] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [initialLoadData, setInitialLoadData] = useState({
        startInitialLoad: false,
        promiseList: [] as Promise<unknown>[],
    });

    useEffect(() => {
        if (hasData) {
            if (!location.pathname.includes('app')) {
                history.push('/app');
            }
            setShouldFetchUserData(false);
        }
    }, [hasData, history, location.pathname]);

    useEffect(() => {
        if (isLoggingOut && !hasData && !shouldFetchUserData) {
            history.push('/account');
        }
    }, [hasData, history, isLoggingOut, shouldFetchUserData]);

    const [authErr, setAuthErr] = useState<{
        initialLocation: string | null;
        err: boolean;
    }>({
        initialLocation: null,
        err: false,
    });

    const initialLoad = useCallback(async () => {
        if (history.location.pathname === '/account') {
            return;
        }

        const [err] = await to(authenticate({ token: auth.token }));
        if (err !== null) {
            await i18nInitPromise;

            setAuthErr({
                initialLocation: history.location.pathname,
                err: true,
            });
            history.push('/account');
        } else {
            setShouldFetchUserData(true);
        }
    }, [auth.token, history]);

    useEffect(() => {
        if (authErr.err && authErr.initialLocation !== '/') {
            i18nInitPromise.then((t) => {
                showToast({
                    title: t('prompt-login-title'),
                    description: t('prompt-login-info'),
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            });
            setAuthErr((prev) => {
                return {
                    ...prev,
                    err: false,
                };
            });
        }
    }, [authErr, history.location.pathname, showToast]);

    useEffect(() => {
        setInitialLoadData((prevData) => {
            return {
                ...prevData,
                promiseList: [...prevData.promiseList, initialLoad()],
                startInitialLoad: true,
            };
        });
    }, [initialLoad]);

    const contextData = useMemo(() => {
        return { setShouldFetchUserData, setHasData, setIsLoggingOut };
    }, []);

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
                        {/* <ReactQueryDevtools initialIsOpen={true} /> */}
                        <Switch>
                            <Route path="/account">
                                <AccountPage />
                            </Route>
                            <Route path="/app">{hasData && <InnerApp />}</Route>
                            <Route path="/logout">
                                <Logout />
                            </Route>
                        </Switch>
                    </LoadWrapper>
                </AppContext.Provider>
            </Box>
        </Box>
    );
}

export default observer(App);
