import { to } from 'await-to-js';
import { AxiosError } from 'axios';
import { useMutation } from 'react-query';
import { useAuth } from '../../components/general/AuthWrapper/AuthWrapper';
import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';

interface SaveArticleReqProps {
    article_id: number;
}

interface SaveArticleResData {
    message: String;
}

export const saveArticle: API.Request<
    SaveArticleReqProps,
    SaveArticleResData
> = async (data, token) => {
    const url = ENDPOINTS.article.user.saved.single;

    return request(url, data, 'PUT', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useSaveArticle = () => {
    const { token } = useAuth();
    return useMutation<
        [AxiosError | null, API.Response<SaveArticleResData> | undefined],
        unknown,
        SaveArticleReqProps
    >({
        // @ts-ignore
        mutationFn: async (vars) => {
            return await to(saveArticle(vars, token));
        },
    });
};
