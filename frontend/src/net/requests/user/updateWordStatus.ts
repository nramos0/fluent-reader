import { ENDPOINTS } from '../../apiEndpoints';
import { request } from '../../request';

interface UpdateWordStatusReqProps {
    lang: string;
    word: string;
    status: string;
}

interface UpdateWordStatusResData {
    message: string;
}

export const updateWordStatus: API.Request<
    UpdateWordStatusReqProps,
    UpdateWordStatusResData
> = async (data, token) => {
    const url = ENDPOINTS.user.data.status._;
    return request(url, data, 'PUT', {
        'content-type': 'application/json',
        authorization: token,
    });
};
