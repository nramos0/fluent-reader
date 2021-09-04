import { to } from 'await-to-js';
import { AxiosError } from 'axios';
import { useMutation } from 'react-query';
import { useAuth } from '../../components/general/AuthWrapper/AuthWrapper';
import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';

interface UpdateUserReqProps {
    display_lang?: Language;
    study_lang?: Language;
}

interface UpdateUserResData {
    message: String;
}

export const updateUser: API.Request<
    UpdateUserReqProps,
    UpdateUserResData
> = async (data, token) => {
    const url = ENDPOINTS.user._;

    return request(url, data, 'PATCH', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useUpdateUser = () => {
    const { token } = useAuth();
    return useMutation<
        [AxiosError | null, API.Response<UpdateUserResData> | undefined],
        unknown,
        UpdateUserReqProps
    >({
        // @ts-ignore
        mutationFn: async (vars) => {
            return await to(updateUser(vars, token));
        },
    });
};
