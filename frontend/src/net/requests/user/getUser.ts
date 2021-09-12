import { ENDPOINTS } from '../../apiEndpoints';
import { request } from '../../request';
import { useAuth } from '../../../components/general/AuthWrapper/AuthWrapper';
import { AxiosResponse, AxiosError } from 'axios';
import { useQuery } from 'react-query';

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

export const useGetUser = (fn?: {
    onSuccess?: (data?: AxiosResponse<GetUserResData>) => void;
    onError?: API.OnFailureFn;
}) => {
    const { token } = useAuth();
    return useQuery<AxiosResponse<GetUserResData> | undefined, AxiosError>(
        ['getUser'],
        () => {
            if (!token) {
                return undefined;
            }

            return getUser({}, token);
        },
        {
            onSuccess: fn?.onSuccess,
            onError: fn?.onError,
            enabled: false,
        }
    );
};
