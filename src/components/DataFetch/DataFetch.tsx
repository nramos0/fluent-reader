import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { useGetWordData } from '../../net/requests';
import { useGetUser } from '../../net/requests/getUser';
import { useStore } from '../../hooks/useStore';
import i18n, { i18nInitPromise } from '../../i18n';

interface Props {
    fetch: boolean;
    setHasData: (val: boolean) => void;
}

const DataFetch: React.FC<Props> = ({ fetch, setHasData }) => {
    const store = useStore();

    const { fetch: fetchWordData } = useGetWordData();
    const { fetch: fetchUser } = useGetUser();

    useEffect(() => {
        if (fetch) {
            Promise.all([fetchWordData(), fetchUser()])
                .then(([wordData, user]) => {
                    if (wordData === null || user === null) {
                        throw new Error('data is null');
                    }

                    store.setWordData(wordData);
                    store.setUser(user);
                    i18nInitPromise.then(() => {
                        i18n.changeLanguage(user.display_lang);
                    });

                    setHasData(true);
                })
                .catch(() => {
                    // do something
                    console.error('data was null');
                });
        }
    }, [fetch, fetchUser, fetchWordData, setHasData, store]);

    return null;
};

export default observer(DataFetch);
