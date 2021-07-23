import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';

interface CreateArticleReqProps {
    title: string;
    author: string;
    content: string;
    language: string;
    tags: string[];
    is_private: boolean;
}

interface CreateArticleResData {
    article: SimpleArticle;
}

export const createArticle: API.Request<
    CreateArticleReqProps,
    CreateArticleResData
> = async (data, token) => {
    const url = ENDPOINTS.article._;

    return request(url, data, 'POST', {
        'content-type': 'application/json',
        authorization: token,
    });
};
