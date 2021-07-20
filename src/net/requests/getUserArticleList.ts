import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';
import { useQuery } from 'react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { useAuth } from '../../components/general/AuthWrapper/AuthWrapper';
import { prepareURL } from '../apiUtil';

type GetUserArticleListReqProps = {
    offset?: number;
    user_id?: number;
    lang?: string;
    search?: string;
};

export interface GetUserArticleResData {
    articles: SimpleArticle[];
    count: number;
}

export const getUserArticleList: API.Request<
    GetUserArticleListReqProps,
    GetUserArticleResData
> = async (data, token) => {
    const url = prepareURL(
        ENDPOINTS.article.user.list,
        ['offset', 'user_id', 'lang', 'search'],
        [data.offset, data.user_id, data.lang, data.search]
    );

    return request(url, data, 'GET', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useGetUserArticleList = (
    query: GetUserArticleListReqProps,
    fn?: {
        onSuccess?: API.OnSuccessFn<GetUserArticleResData>;
        onError?: API.OnFailureFn;
    }
) => {
    const { token } = useAuth();
    return useQuery<AxiosResponse<GetUserArticleResData>, AxiosError>(
        ['getUserArticleList', query.offset, query.lang, query.search],
        () => {
            return getUserArticleList(query, token);
        },
        {
            onSuccess: fn?.onSuccess,
            onError: fn?.onError,
            enabled: false,
            keepPreviousData: true,
        }
    );
};
