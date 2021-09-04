import { to } from 'await-to-js';
import { AxiosError } from 'axios';
import { useMutation } from 'react-query';
import { useAuth } from '../../components/general/AuthWrapper/AuthWrapper';
import { ENDPOINTS } from '../apiEndpoints';
import { prepareURL } from '../apiUtil';
import { request } from '../request';

interface DeleteArticleReqProps {
    article_id: number;
}

interface DeleteArticleResData {
    message: String;
}

export const deleteArticle: API.Request<
    DeleteArticleReqProps,
    DeleteArticleResData
> = async (data, token) => {
    const url = prepareURL(
        ENDPOINTS.article.user.single,
        [],
        [],
        ['article_id'],
        [data.article_id]
    );

    return request(url, {}, 'DELETE', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useDeleteArticle = () => {
    const { token } = useAuth();
    return useMutation<
        [AxiosError | null, API.Response<DeleteArticleResData> | undefined],
        unknown,
        DeleteArticleReqProps
    >({
        // @ts-ignore
        mutationFn: async (vars) => {
            return await to(deleteArticle(vars, token));
        },
    });
};
