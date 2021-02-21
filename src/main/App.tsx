import { useMemo } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import AccountPage from '../components/account/AccountPage/AccountPage';
import { Switch, Route, useHistory } from 'react-router-dom';
import to from 'await-to-js';
import i18n, { i18nInitPromise } from '../i18n';

import InnerApp from '../components/general/InnerApp/InnerApp';
import LoadProvider from '../components/general/LoadWrapper/LoadWrapper';
import Logout from '../components/general/Logout/Logout';

import './App.css';
import { useAuth } from '../components/general/AuthWrapper/AuthWrapper';
import { authenticate } from '../net/requests/auth';

function App() {
    const auth = useAuth();
    const history = useHistory();
    const showToast = useToast();

    const initialRoutePromise = useMemo(() => {
        return new Promise<void>(async (resolve) => {
            if (history.location.pathname === '/account') {
                resolve();
                return;
            }

            await i18nInitPromise;

            const t = i18n.getFixedT(i18n.language, 'common');

            const [err] = await to(authenticate({ token: auth.token }));
            if (err !== null) {
                history.push('/account');
                resolve();
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
                resolve();
                return;
            }
        });
    }, [auth.token, history, showToast]);

    const promiseList = useMemo(() => {
        return [initialRoutePromise, i18nInitPromise];
    }, [initialRoutePromise]);

    return (
        <Box className="App" h="inherit">
            <LoadProvider promiseList={promiseList}>
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
            </LoadProvider>
        </Box>
    );
}

export default App;
