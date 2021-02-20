import { useMemo } from 'react';
import { Box, Center, useToast, Text } from '@chakra-ui/react';
import AccountPage from '../components/account/AccountPage/AccountPage';
import { Switch, Route, useHistory } from 'react-router-dom';
import to from 'await-to-js';
import LoadProvider from '../components/general/LoadWrapper/LoadWrapper';
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

            const [err] = await to(authenticate({ token: auth.token }));
            if (err !== null) {
                history.push('/account');
                resolve();
                showToast({
                    title: 'Please Login',
                    description: 'Please login in order to use the app',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
                return;
            } else {
                history.push('/app');
                resolve();
                return;
            }
        });
    }, [auth.token, history, showToast]);

    const promiseList = useMemo(() => {
        return [initialRoutePromise];
    }, [initialRoutePromise]);

    return (
        <Box className="App" h="inherit">
            <LoadProvider promiseList={promiseList}>
                <Switch>
                    <Route path="/account">
                        <AccountPage />
                    </Route>
                    <Route path="/app">
                        <Center h="inherit">
                            <Text color="white" fontSize="xl">
                                Hi! The app is currently a work-in-progress.
                            </Text>
                        </Center>
                    </Route>
                </Switch>
            </LoadProvider>
        </Box>
    );
}

export default App;
