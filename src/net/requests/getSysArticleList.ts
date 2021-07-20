import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';
import { useQuery } from 'react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { useAuth } from '../../components/general/AuthWrapper/AuthWrapper';
import { prepareURL } from '../apiUtil';

type GetSysArticleListReqProps = {
    offset?: number;
    lang?: string;
    search?: string;
    limit?: number;
};

export interface GetSysArticleResData {
    articles: SimpleArticle[];
    count: number;
}

export const getSysArticleList: API.Request<
    GetSysArticleListReqProps,
    GetSysArticleResData
> = async (data, token) => {
    const url = prepareURL(
        ENDPOINTS.article.system.list,
        ['offset', 'lang', 'search', 'limit'],
        [data.offset, data.lang, data.search, data.limit]
    );

    return request(url, data, 'GET', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useGetSysArticleList = (
    query: GetSysArticleListReqProps,
    fn?: {
        onSuccess?: API.OnSuccessFn<GetSysArticleResData>;
        onError?: API.OnFailureFn;
    }
) => {
    const { token } = useAuth();
    return useQuery<AxiosResponse<GetSysArticleResData>, AxiosError>(
        [
            'getSysArticleList',
            query.offset,
            query.lang,
            query.search,
            query.limit,
        ],
        () => {
            return getSysArticleList(query, token);
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
