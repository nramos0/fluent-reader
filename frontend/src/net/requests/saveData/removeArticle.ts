import { to } from 'await-to-js';
import { AxiosError } from 'axios';
import { useMutation } from 'react-query';
import { useAuth } from '../../../components/general/AuthWrapper/AuthWrapper';
import { ENDPOINTS } from '../../apiEndpoints';
import { request } from '../../request';

interface RemoveArticleReqProps {
    article_id: number;
}

interface RemoveArticleResData {
    message: String;
}

export const removeArticle: API.Request<
    RemoveArticleReqProps,
    RemoveArticleResData
> = async (data, token) => {
    const url = ENDPOINTS.article.user.saved.single;

    return request(url, data, 'DELETE', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useRemoveArticle = () => {
    const { token } = useAuth();
    return useMutation<
        [AxiosError | null, API.Response<RemoveArticleResData> | undefined],
        unknown,
        RemoveArticleReqProps
    >({
        // @ts-ignore
        mutationFn: async (vars) => {
            return await to(removeArticle(vars, token));
        },
    });
};
