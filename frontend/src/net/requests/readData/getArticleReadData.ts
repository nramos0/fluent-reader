import { ENDPOINTS } from '../../apiEndpoints';
import { request } from '../../request';
import { useAuth } from '../../../components/general/AuthWrapper/AuthWrapper';
import { useQuery } from 'react-query';
import { AxiosResponse, AxiosError } from 'axios';
import { prepareURL } from '../../apiUtil';

type GetArticleReadDataReqProps = {
    article_id: number;
};

type GetArticleReadDataResData = {
    data: ArticleReadData;
};

export const getArticleReadData: API.Request<
    GetArticleReadDataReqProps,
    GetArticleReadDataResData
> = async (data, token) => {
    const url = prepareURL(
        ENDPOINTS.user.data.read._,
        [],
        [],
        ['article_id'],
        [data.article_id]
    );
    return request(url, {}, 'GET', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useGetArticleReadData = (
    query: GetArticleReadDataReqProps,
    fn?: {
        onSuccess?: API.OnSuccessFn<GetArticleReadDataResData>;
        onError?: API.OnFailureFn;
    }
) => {
    const { token } = useAuth();
    return useQuery<AxiosResponse<GetArticleReadDataResData>, AxiosError>(
        ['getArticleReadData', query.article_id],
        () => {
            return getArticleReadData(query, token);
        },
        {
            onSuccess: fn?.onSuccess,
            onError: fn?.onError,
            enabled: false,
        }
    );
};
