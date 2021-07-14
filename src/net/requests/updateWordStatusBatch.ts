import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';

interface UpdateWordStatusBatchReqProps {
    lang: string;
    words: string[];
    status: string;
}

interface UpdateWordStatusBatchResData {
    message: string;
}

export const updateWordStatusBatch: API.Request<
    UpdateWordStatusBatchReqProps,
    UpdateWordStatusBatchResData
> = async (data, token) => {
    const url = ENDPOINTS.user.data.status.batch;
    return request(url, data, 'PUT', {
        'content-type': 'application/json',
        authorization: token,
    });
};
