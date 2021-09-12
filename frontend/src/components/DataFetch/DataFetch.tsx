import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { useGetWordData } from '../../net/requests';
import { useGetUser } from '../../net/requests/getUser';
import { useStore } from '../../hooks/useStore';
import i18n, { i18nInitPromise } from '../../i18n';
import { useLoadInfo } from '../general/LoadWrapper/LoadWrapper';

interface Props {
    fetch: boolean;
    setHasData: (val: boolean) => void;
}

const DataFetch: React.FC<Props> = ({ fetch, setHasData }) => {
    const store = useStore();

    const { refetch: fetchWordData } = useGetWordData();
    const { refetch: fetchUser } = useGetUser();
    const loadInfo = useLoadInfo();

    useEffect(() => {
        if (fetch) {
            loadInfo.loadUntilResolve(
                Promise.all([fetchWordData(), fetchUser()])
                    .then(([wordDataResult, userResult]) => {
                        if (
                            wordDataResult === null ||
                            wordDataResult.data === undefined ||
                            userResult === null ||
                            userResult.data === undefined
                        ) {
                            throw new Error('data is null');
                        }

                        const user = userResult.data.data.user;
                        store.setWordData(wordDataResult.data.data.data);
                        store.setUser(user);
                        i18nInitPromise.then(() => {
                            i18n.changeLanguage(user.display_lang);
                        });

                        setHasData(true);
                    })
                    .catch(() => {
                        // do something
                        console.error('data was null');
                    })
            );
        }
    }, [fetch, fetchUser, fetchWordData, loadInfo, setHasData, store]);

    return null;
};

export default observer(DataFetch);
