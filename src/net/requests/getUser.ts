import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';
import { useAuth } from '../../components/general/AuthWrapper/AuthWrapper';
import { useEffect, useState } from 'react';
import to from 'await-to-js';

type GetUserReqProps = {};

type GetUserResData = {
    user: SimpleUser;
};

export const getUser: API.Request<GetUserReqProps, GetUserResData> = async (
    data,
    token
) => {
    const url = ENDPOINTS.user._;
    return request(url, data, 'GET', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useGetUser = () => {
    const auth = useAuth();
    const [user, setUser] = useState<SimpleUser | null>(null);
    const [promise, setPromise] = useState<Promise<void> | null>(null);

    useEffect(() => {
        const fetch = async () => {
            const [err, data] = await to(getUser({}, auth.token));
            if (err !== null || data === undefined) {
                return;
            }

            setUser(data.data.user);
        };

        setPromise(fetch());
    }, [auth.token]);

    return { user, promise };
};
