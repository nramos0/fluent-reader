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
import { useGetWordData } from '../net/requests';
import { observer } from 'mobx-react';
import { useGetUser } from '../net/requests/getUser';

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

    const { wordData, promise: wordDataPromise } = useGetWordData();
    const { user, promise: userPromise } = useGetUser();

    useEffect(() => {
        if (wordData !== null) {
            store.setWordData(wordData);
        }
    }, [store, wordData]);

    useEffect(() => {
        if (user !== null) {
            store.setUser(user);
            i18nInitPromise.then(() => {
                i18n.changeLanguage(user.display_lang);
            });
        }
    }, [store, user]);

    useEffect(() => {
        setInitialLoadData((prevData) => {
            return {
                ...prevData,
                promiseList: [...prevData.promiseList, initialLoad()],
            };
        });
    }, [initialLoad]);

    useEffect(() => {
        if (wordDataPromise === null) {
            return;
        }

        setInitialLoadData((prevData) => {
            return {
                ...prevData,
                promiseList: [...prevData.promiseList, wordDataPromise],
            };
        });
    }, [wordDataPromise]);

    useEffect(() => {
        if (userPromise === null) {
            return;
        }

        setInitialLoadData((prevData) => {
            return {
                ...prevData,
                promiseList: [...prevData.promiseList, userPromise],
            };
        });
    }, [userPromise]);

    useEffect(() => {
        if (initialLoadData.promiseList.length === 3) {
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
