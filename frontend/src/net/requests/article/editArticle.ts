import { to } from 'await-to-js';
import { AxiosError } from 'axios';
import { useMutation } from 'react-query';
import { useAuth } from '../../../components/general/AuthWrapper/AuthWrapper';
import { ENDPOINTS } from '../../apiEndpoints';
import { request } from '../../request';

export interface EditArticleReqProps {
    article_id: number;
    title?: string;
    author?: string;
    content?: string;
    content_description?: string;
    language?: string;
    tags?: Array<string>;
    is_private?: boolean;

    [key: string]: string | string[] | number | boolean | undefined;
}

interface EditArticleResData {
    message: string;
}

export const editArticle: API.Request<
    EditArticleReqProps,
    EditArticleResData
> = async (data, token) => {
    const url = ENDPOINTS.article._;

    return request(url, data, 'PATCH', {
        'content-type': 'application/json',
        authorization: token,
    });
};

export const useEditArticle = () => {
    const { token } = useAuth();
    return useMutation<
        [AxiosError | null, API.Response<EditArticleResData> | undefined],
        unknown,
        EditArticleReqProps
    >({
        // @ts-ignore
        mutationFn: async (vars) => {
            return await to(editArticle(vars, token));
        },
    });
};
