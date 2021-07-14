import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';
import { useAuth } from '../../components/general/AuthWrapper/AuthWrapper';
import { useEffect, useState } from 'react';
import to from 'await-to-js';

type GetWordDataReqProps = {};

type GetWordDataResData = {
    data: WordData;
};

export const getWordData: API.Request<
    GetWordDataReqProps,
    GetWordDataResData
> = async (data, token) => {
    const url = ENDPOINTS.user.data._;
    return request(url, data, 'GET', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useGetWordData = () => {
    const auth = useAuth();
    const [wordData, setWordData] = useState<WordData | null>(null);

    useEffect(() => {
        const fetch = async () => {
            const [err, data] = await to(getWordData({}, auth.token));
            if (err !== null || data === undefined) {
                return;
            }

            setWordData(data.data.data);
        };

        fetch();
    }, [auth.token]);

    return wordData;
};
