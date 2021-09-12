import { useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { i18nInitPromise } from '../../i18n';
import { AuthError } from './useAuthCheck';

export const useDisplayAuthError = (
    authErr: AuthError,
    setAuthErr: React.Dispatch<React.SetStateAction<AuthError>>
) => {
    const showToast = useToast();
    const history = useHistory();

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
    }, [authErr, history.location.pathname, setAuthErr, showToast]);
};
