import to from 'await-to-js';
import { AxiosError } from 'axios';
import { useMutation } from 'react-query';
import { useAuth } from '../../components/general/AuthWrapper/AuthWrapper';
import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';

interface DeleteMarkReqProps {
    index: number;
    article_id: number;
}

interface DeleteMarkResData {}

export const deleteMark: API.Request<
    DeleteMarkReqProps,
    DeleteMarkResData
> = async (data, token) => {
    const url = ENDPOINTS.user.data.mark_article._;

    return request(url, data, 'DELETE', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useDeleteMark = () => {
    const { token } = useAuth();
    return useMutation<
        [AxiosError | null, API.Response<DeleteMarkResData> | undefined],
        unknown,
        DeleteMarkReqProps
    >({
        // @ts-ignore
        mutationFn: async (vars) => {
            return await to(deleteMark(vars, token));
        },
    });
};
