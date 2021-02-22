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
};

interface GetSysArticleResData {
    articles: SimpleArticle[];
    count: number;
}

export const getSysArticleList: API.Request<
    GetSysArticleListReqProps,
    GetSysArticleResData
> = async (data, token) => {
    const url = prepareURL(
        ENDPOINTS.article.system.list,
        ['offset', 'lang', 'search'],
        [data.offset, data.lang, data.search]
    );

    return request(url, data, 'GET', {
        'content-type': 'application/json',
        authorization: token === undefined ? undefined : `Bearer ${token}`,
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
        ['getSysArticleList', query.offset, query.lang, query.search],
        () => {
            return getSysArticleList(query, token);
        },
        {
            staleTime: Infinity,
            onSuccess: fn?.onSuccess,
            onError: fn?.onError,
        }
    );
};
