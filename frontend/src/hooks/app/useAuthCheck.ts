import to from 'await-to-js';
import { useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../components/general/AuthWrapper/AuthWrapper';
import { i18nInitPromise } from '../../i18n';
import { NonAppLocation } from '../../main/App';
import { authenticate } from '../../net/requests';
import { useDisplayAuthError } from './useDisplayAuthError';

export interface AuthError {
    initialLocation: string | null;
    err: boolean;
}

export const useAuthCheck = (
    setShouldFetchUserData: (shouldFetchUserData: boolean) => void
) => {
    const auth = useAuth();
    const history = useHistory();

    const [authErr, setAuthErr] = useState<AuthError>({
        initialLocation: null,
        err: false,
    });

    const onAuth = useCallback(async () => {
        if (history.location.pathname === NonAppLocation.Account) {
            return;
        }

        const [err] = await to(authenticate({ token: auth.token }));
        if (err !== null) {
            await i18nInitPromise;

            setAuthErr({
                initialLocation: history.location.pathname,
                err: true,
            });
            history.push(NonAppLocation.Account);
        } else {
            setShouldFetchUserData(true);
        }
    }, [auth.token, history, setShouldFetchUserData]);

    useDisplayAuthError(authErr, setAuthErr);

    return { onAuth };
};
