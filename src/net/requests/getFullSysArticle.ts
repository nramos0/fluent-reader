import { ENDPOINTS } from '../apiEndpoints';
import { prepareURL } from '../apiUtil';
import { request } from '../request';

type GetFullSysArticleReqProps = {
    id: number;
};

type GetFullSysArticleResData = {
    article: Article;
};

export const getFullSysArticle: API.Request<
    GetFullSysArticleReqProps,
    GetFullSysArticleResData
> = async (data, token) => {
    const url = prepareURL(
        ENDPOINTS.article.system.single,
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
