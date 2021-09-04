import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';

interface RegisterReqProps {
    username: string;
    display_name: string;
    password: string;
    study_lang: string;
    display_lang: string;
}

interface RegisterResData {
    user: SimpleUser;
}

export const register: API.Request<RegisterReqProps, RegisterResData> = async (
    data
) => {
    const url = ENDPOINTS.user.reg;
    return request(url, data, 'POST', {
        'content-type': 'application/json',
    });
};
