import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { appLocationValues } from '../../components/general/InnerApp/InnerApp';

export const useReturnToLastPage = () => {
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        // if the current page the user started on is valid, do nothing
        if (
            appLocationValues.some((validPath) =>
                location.pathname.includes(validPath)
            )
        ) {
            return;
        }

        // if the current page is not valid, try to jump to the page stored in local storage
        const lastPage = localStorage.getItem('lastPage');

        // if there is no local storage page, go to the library
        if (lastPage === null) {
            history.push('/app/library');
        } else {
            history.push(lastPage);
        }
    }, [history, location.pathname]);
};
