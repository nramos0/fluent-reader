import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';

interface LoginReqProps {
    username: string;
    password: string;
}

interface LoginResData {
    token: string;
    refresh_token: string;
}

export const login: API.Request<LoginReqProps, LoginResData> = async (data) => {
    const url = ENDPOINTS.user.log;
    return request(url, data, 'POST', {
        'content-type': 'application/json',
    });
};
