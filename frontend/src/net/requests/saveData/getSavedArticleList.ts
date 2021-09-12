import { ENDPOINTS } from '../../apiEndpoints';
import { request } from '../../request';
import { useQuery } from 'react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { useAuth } from '../../../components/general/AuthWrapper/AuthWrapper';
import { prepareURL } from '../../apiUtil';

type GetSavedArticleListReqProps = {
    offset?: number;
    lang?: string;
    search?: string;
    limit?: number;
};

export interface GetSavedArticleResData {
    articles: SimpleArticle[];
    count: number;
}

export const getSavedArticleList: API.Request<
    GetSavedArticleListReqProps,
    GetSavedArticleResData
> = async (data, token) => {
    const url = prepareURL(
        ENDPOINTS.article.user.saved.list,
        ['offset', 'lang', 'search', 'limit'],
        [data.offset, data.lang, data.search, data.limit]
    );

    return request(url, data, 'GET', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useGetSavedArticleList = (
    query: GetSavedArticleListReqProps,
    fn?: {
        onSuccess?: API.OnSuccessFn<GetSavedArticleResData>;
        onError?: API.OnFailureFn;
    }
) => {
    const { token } = useAuth();
    return useQuery<AxiosResponse<GetSavedArticleResData>, AxiosError>(
        [
            'getSavedArticleList',
            query.offset,
            query.lang,
            query.search,
            query.limit,
        ],
        () => {
            return getSavedArticleList(query, token);
        },
        {
            staleTime: Infinity,
            onSuccess: fn?.onSuccess,
            onError: fn?.onError,
            enabled: false,
            keepPreviousData: true,
        }
    );
};
