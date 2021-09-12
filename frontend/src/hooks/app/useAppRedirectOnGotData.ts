import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

export const useAppRedirectOnGotData = (
    hasData: boolean,
    setShouldFetchUserData: (shouldFetchUserData: boolean) => void
) => {
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        if (hasData) {
            if (!location.pathname.includes('app')) {
                history.push('/app');
            }
            setShouldFetchUserData(false);
        }
    }, [hasData, history, location.pathname, setShouldFetchUserData]);
};
