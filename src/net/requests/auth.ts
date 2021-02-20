import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';

interface AuthReqProps {
    token: string;
}

export const authenticate: API.Request<AuthReqProps, {}> = async (data) => {
    const url = ENDPOINTS.user.auth;
    return request(url, {}, 'POST', {
        'content-type': 'application/json',
        authorization: `Bearer ${data.token}`,
    });
};
