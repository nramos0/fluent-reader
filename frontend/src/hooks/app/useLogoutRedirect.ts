import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { NonAppLocation } from '../../main/App';

export const useLogoutRedirect = (
    isLoggingOut: boolean,
    hasData: boolean,
    shouldFetchUserData: boolean
) => {
    const history = useHistory();

    useEffect(() => {
        if (isLoggingOut && !hasData && !shouldFetchUserData) {
            history.push(NonAppLocation.Account);
        }
    }, [hasData, history, isLoggingOut, shouldFetchUserData]);
};
