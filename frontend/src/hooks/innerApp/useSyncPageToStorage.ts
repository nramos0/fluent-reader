import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSyncPageToStorage = () => {
    const location = useLocation();
    useEffect(() => {
        localStorage.setItem('lastPage', location.pathname);
    }, [location.pathname]);
};
