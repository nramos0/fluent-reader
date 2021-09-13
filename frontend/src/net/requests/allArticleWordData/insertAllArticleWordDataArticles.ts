import to from 'await-to-js';
import { AxiosError } from 'axios';
import { useMutation } from 'react-query';
import { useAuth } from '../../../components/general/AuthWrapper/AuthWrapper';
import { ENDPOINTS } from '../../apiEndpoints';
import { request } from '../../request';

interface InsertAllArticleWordDataArticlesProps {
    article_id_list: number[];
    lang: 'en' | 'zh';
}

interface InsertAllArticleWordDataArticlesResData {
    message: string;
}

export const insertAllArticleWordDataArticles: API.Request<
    InsertAllArticleWordDataArticlesProps,
    InsertAllArticleWordDataArticlesResData
> = async (data, token) => {
    const url = ENDPOINTS.user.all_article_word_data.insert_articles;

    return request(url, data, 'PUT', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useInsertAllArticleWordDataArticles = () => {
    const { token } = useAuth();
    return useMutation<
        [
            AxiosError | null,
            API.Response<InsertAllArticleWordDataArticlesResData> | undefined
        ],
        unknown,
        InsertAllArticleWordDataArticlesProps
    >({
        // @ts-ignore
        mutationFn: async (vars) => {
            return await to(insertAllArticleWordDataArticles(vars, token));
        },
    });
};
