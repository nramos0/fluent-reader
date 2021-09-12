import { useQuery } from 'react-query';
import { AxiosResponse, AxiosError } from 'axios';
import { ENDPOINTS } from '../../apiEndpoints';
import { prepareURL } from '../../apiUtil';
import { request } from '../../request';
import { useAuth } from '../../../components/general/AuthWrapper/AuthWrapper';

interface GetFullArticleReqProps {
    id: number;
    isSystem: boolean;
    onlyEditInfo?: boolean;
}

interface GetFullArticleResData {
    article: Article;
}

export const getFullArticle: API.Request<
    GetFullArticleReqProps,
    GetFullArticleResData
> = async ({ isSystem, onlyEditInfo, ...data }, token) => {
    const url = prepareURL(
        isSystem
            ? ENDPOINTS.article.system.single
            : ENDPOINTS.article.user.single,
        ['only_edit_info'],
        [onlyEditInfo ? 'true' : undefined],
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
        ['getFullArticle', query.id, query.isSystem, query.onlyEditInfo],
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
