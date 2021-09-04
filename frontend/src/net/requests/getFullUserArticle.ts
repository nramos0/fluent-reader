import { ENDPOINTS } from '../apiEndpoints';
import { prepareURL } from '../apiUtil';
import { request } from '../request';

type GetFullUserArticleReqProps = {
    id: number;
};

type GetFullUserArticleResData = {
    article: Article;
};

export const getFullUserArticle: API.Request<
    GetFullUserArticleReqProps,
    GetFullUserArticleResData
> = async (data, token) => {
    const url = prepareURL(
        ENDPOINTS.article.user.single,
        [],
        [],
        ['article_id'],
        [data.id]
    );
    return request(url, data, 'GET', {
        'content-type': 'application/json',
        authorization: token,
    });
};
