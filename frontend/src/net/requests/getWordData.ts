import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';
import { useAuth } from '../../components/general/AuthWrapper/AuthWrapper';
import { useQuery } from 'react-query';
import { AxiosError, AxiosResponse } from 'axios';

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

export const useGetWordData = (fn?: {
    onSuccess?: (data?: AxiosResponse<GetWordDataResData>) => void;
    onError?: API.OnFailureFn;
}) => {
    const { token } = useAuth();
    return useQuery<AxiosResponse<GetWordDataResData> | undefined, AxiosError>(
        ['getWordData'],
        () => {
            if (!token) {
                return undefined;
            }

            console.log('getting word data with token ', token);

            return getWordData({}, token);
        },
        {
            onSuccess: fn?.onSuccess,
            onError: fn?.onError,
            enabled: false,
        }
    );
    // const [wordData, setWordData] = useState<WordData | null>(null);
    // const [promise, setPromise] = useState<Promise<unknown> | null>(null);
    // const fetch = useCallback(() => {
    //     const fetch = async () => {
    //         const [err, data] = await to(getWordData({}, auth.token));
    //         if (err !== null || data === undefined) {
    //             return null;
    //         }

    //         setWordData(data.data.data);

    //         return data.data.data;
    //     };
    //     const promise = fetch();
    //     setPromise(promise);
    //     return promise;
    // }, [auth.token]);

    // return { wordData, promise, fetch };
};
