import { useQuery } from 'react-query';
import { AxiosResponse, AxiosError } from 'axios';
import { ENDPOINTS } from '../../apiEndpoints';
import { request } from '../../request';
import { useAuth } from '../../../components/general/AuthWrapper/AuthWrapper';

interface GetWordStatusCountsReqProps {
    article_id_list: Array<number>;
    lang: string;
}

interface GetWordStatusCountsResData {
    word_status_count_list: WordStatusCountData[];
}

export const getWordStatusCounts: API.Request<
    GetWordStatusCountsReqProps,
    GetWordStatusCountsResData
> = async (data, token) => {
    const url = ENDPOINTS.user.all_article_word_data.word_status_counts;
    return request(url, data, 'POST', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useGetWordStatusCounts = (
    query: GetWordStatusCountsReqProps,
    fn?: {
        onSuccess?: API.OnSuccessFn<GetWordStatusCountsResData>;
        onError?: API.OnFailureFn;
    }
) => {
    const { token } = useAuth();
    return useQuery<AxiosResponse<GetWordStatusCountsResData>, AxiosError>(
        ['getWordStatusCounts', query.article_id_list, query.lang],
        () => {
            return getWordStatusCounts(query, token);
        },
        {
            enabled: true,
            onSuccess: fn?.onSuccess,
            onError: fn?.onError,
        }
    );
};
