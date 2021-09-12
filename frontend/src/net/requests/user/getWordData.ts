import { ENDPOINTS } from '../../apiEndpoints';
import { request } from '../../request';
import { useAuth } from '../../../components/general/AuthWrapper/AuthWrapper';
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

            return getWordData({}, token);
        },
        {
            onSuccess: fn?.onSuccess,
            onError: fn?.onError,
            enabled: false,
        }
    );
};
