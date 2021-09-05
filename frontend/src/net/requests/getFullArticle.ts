import { useQuery } from 'react-query';
import { AxiosResponse, AxiosError } from 'axios';
import { ENDPOINTS } from '../apiEndpoints';
import { prepareURL } from '../apiUtil';
import { request } from '../request';
import { useAuth } from '../../components/general/AuthWrapper/AuthWrapper';

type GetFullArticleReqProps = {
    id: number;
    isSystem: boolean;
};

type GetFullArticleResData = {
    article: Article;
};

export const getFullArticle: API.Request<
    GetFullArticleReqProps,
    GetFullArticleResData
> = async ({ isSystem, ...data }, token) => {
    const url = prepareURL(
        isSystem
            ? ENDPOINTS.article.system.single
            : ENDPOINTS.article.user.single,
        [],
        [],
        ['article_id'],
        [data.id]
    );
    return request(url, data, 'GET', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useGetFullArticle = (
    query: GetFullArticleReqProps,
    fn?: {
        onSuccess?: API.OnSuccessFn<GetFullArticleResData>;
        onError?: API.OnFailureFn;
    }
) => {
    const { token } = useAuth();
    return useQuery<AxiosResponse<GetFullArticleResData>, AxiosError>(
        ['getFullArticle', query.id],
        () => {
            return getFullArticle(query, token);
        },
        {
            enabled: false,
            onSuccess: fn?.onSuccess,
            onError: fn?.onError,
        }
    );
};
