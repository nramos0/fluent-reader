import to from 'await-to-js';
import { AxiosError } from 'axios';
import { useMutation } from 'react-query';
import { useAuth } from '../../components/general/AuthWrapper/AuthWrapper';
import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';

interface MarkArticleReqProps {
    mark: Mark;
    article_id: number;
}

interface MarkArticleResData {}

export const markArticle: API.Request<
    MarkArticleReqProps,
    MarkArticleResData
> = async (data, token) => {
    const url = ENDPOINTS.user.data.mark_article._;

    return request(url, data, 'POST', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useMarkArticle = () => {
    const { token } = useAuth();
    return useMutation<
        [AxiosError | null, API.Response<MarkArticleResData> | undefined],
        unknown,
        MarkArticleReqProps
    >({
        // @ts-ignore
        mutationFn: async (vars) => {
            return await to(markArticle(vars, token));
        },
    });
};
