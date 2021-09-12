import { AxiosError, AxiosResponse } from 'axios';
import { useQuery } from 'react-query';
import { ENDPOINTS } from '../../apiEndpoints';
import { request } from '../../request';
import { useAuth } from '../../../components/general/AuthWrapper/AuthWrapper';
import { prepareURL } from '../../apiUtil';

type GetArticleListReqProps = {
    offset?: number;
    lang?: string;
    search?: string;
    limit?: number;
    type?: LibraryType;
};

export interface GetArticleResData {
    articles: SimpleArticle[];
    count: number;
}

export const getArticleList: API.Request<
    GetArticleListReqProps,
    GetArticleResData,
    LibraryType
> = async (data, token, libraryType) => {
    if (libraryType === undefined) {
        throw new Error('meta undefined');
    }

    const endpoint = (() => {
        switch (libraryType) {
            case 'system':
                return ENDPOINTS.article.system.list;
            case 'user-saved':
                return ENDPOINTS.article.user.saved.list;
            case 'all-user':
                return ENDPOINTS.article.user.all.list;
            case 'user-created':
                return ENDPOINTS.article.user.list;
        }
    })();

    const url = prepareURL(
        endpoint,
        ['offset', 'lang', 'search', 'limit'],
        [data.offset, data.lang, data.search, data.limit]
    );

    return request(url, data, 'GET', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useGetArticleList = (
    query: GetArticleListReqProps,
    libraryType: LibraryType,
    fn?: {
        onSuccess?: API.OnSuccessFn<GetArticleResData>;
        onError?: API.OnFailureFn;
    }
) => {
    const { token } = useAuth();
    return useQuery<AxiosResponse<GetArticleResData>, AxiosError>(
        [
            'getArticleList',
            libraryType,
            query.offset,
            query.lang,
            query.search,
            query.limit,
        ],
        () => {
            return getArticleList(query, token, libraryType);
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
