import { useCallback, useEffect, useState } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import AccountPage from '../components/account/AccountPage/AccountPage';
import { Switch, Route, useHistory } from 'react-router-dom';
import to from 'await-to-js';
import i18n, { i18nInitPromise } from '../i18n';

import InnerApp from '../components/general/InnerApp/InnerApp';
import LoadWrapper from '../components/general/LoadWrapper/LoadWrapper';
import Logout from '../components/general/Logout/Logout';
import I18nBind from '../components/general/I18nBind/I18nBind';

import './App.css';
import { useAuth } from '../components/general/AuthWrapper/AuthWrapper';
import { authenticate } from '../net/requests/auth';
import { useStore } from '../hooks/useStore';
import { getWordData } from '../net/requests';
import { observer } from 'mobx-react';

function App() {
    const auth = useAuth();
    const history = useHistory();
    const showToast = useToast();

    const [initialLoadData, setInitialLoadData] = useState({
        startInitialLoad: false,
        promiseList: [] as Promise<any>[],
    });

    const initialLoad = useCallback(async () => {
        if (history.location.pathname === '/account') {
            return;
        }
        const [err] = await to(authenticate({ token: auth.token }));
        if (err !== null) {
            await i18nInitPromise;
            const t = i18n.getFixedT(i18n.language, 'common');

            history.push('/account');

            showToast({
                title: t('prompt-login-title'),
                description: t('prompt-login-info'),
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } else {
            if (!history.location.pathname.includes('app')) {
                history.push('/app');
            }
        }
    }, [auth.token, history, showToast]);

    const store = useStore();

    const userDataFetch = useCallback(async () => {
        const [err, data] = await to(getWordData({}, auth.token));
        if (err !== null || data === undefined) {
            return;
        }

        store.setWordData(data.data.data);
    }, [auth.token, store]);

    useEffect(() => {
        setInitialLoadData((prevData) => {
            return {
                ...prevData,
                promiseList: [...prevData.promiseList, initialLoad()],
            };
        });
    }, [initialLoad]);

    useEffect(() => {
        setInitialLoadData((prevData) => {
            return {
                ...prevData,
                promiseList: [...prevData.promiseList, userDataFetch()],
            };
        });
    }, [userDataFetch]);

    useEffect(() => {
        if (initialLoadData.promiseList.length === 2) {
            setInitialLoadData((prevData) => {
                return {
                    ...prevData,
                    startInitialLoad: true,
                };
            });
        }
    }, [initialLoadData.promiseList.length]);

    return (
        <Box className="App" h="inherit">
            <LoadWrapper
                promiseList={initialLoadData.promiseList}
                startInitialLoad={initialLoadData.startInitialLoad}
            >
                <I18nBind />
                {/* <ReactQueryDevtools initialIsOpen={true} /> */}
                <Switch>
                    <Route path="/account">
                        <AccountPage />
                    </Route>
                    <Route path="/app">
                        <InnerApp />
                    </Route>
                    <Route path="/logout">
                        <Logout />
                    </Route>
                </Switch>
            </LoadWrapper>
        </Box>
    );
}

export default observer(App);
