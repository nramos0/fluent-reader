import { useMemo } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import AccountPage from '../components/account/AccountPage/AccountPage';
import { Switch, Route, useHistory } from 'react-router-dom';
import to from 'await-to-js';
import { ReactQueryDevtools } from 'react-query/devtools';
import i18n, { i18nInitPromise } from '../i18n';

import InnerApp from '../components/general/InnerApp/InnerApp';
import LoadWrapper from '../components/general/LoadWrapper/LoadWrapper';
import Logout from '../components/general/Logout/Logout';

import './App.css';
import { useAuth } from '../components/general/AuthWrapper/AuthWrapper';
import { authenticate } from '../net/requests/auth';
import { useStore } from '../hooks/useStore';
import { getWordData } from '../net/requests';

function App() {
    const auth = useAuth();
    const history = useHistory();
    const showToast = useToast();

    const initialRoutePromise = useMemo(() => {
        return (async () => {
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
                return;
            } else {
                if (!history.location.pathname.includes('app')) {
                    history.push('/app');
                }
                return;
            }
        })();
    }, [auth.token, history, showToast]);

    const store = useStore();

    const userDataFetchPromise = useMemo(() => {
        return (async () => {
            const [err, data] = await to(getWordData({}, auth.token));
            if (err !== null || data === undefined) {
                return;
            }

            store.wordData = data.data.data;
        })();
    }, [auth.token, store]);

    const promiseList = useMemo(() => {
        return [initialRoutePromise, i18nInitPromise, userDataFetchPromise];
    }, [initialRoutePromise, userDataFetchPromise]);

    return (
        <Box className="App" h="inherit">
            <LoadWrapper promiseList={promiseList}>
                <ReactQueryDevtools initialIsOpen={true} />
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

export default App;
