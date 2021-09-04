import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';

interface UpdateWordDefinitionReqProps {
    lang: string;
    word: string;
    definition: string;
}

interface UpdateWordDefinitionResData {
    message: string;
}

export const updateWordDefinition: API.Request<
    UpdateWordDefinitionReqProps,
    UpdateWordDefinitionResData
> = async (data, token) => {
    const url = ENDPOINTS.user.data.definition;
    return request(url, data, 'PUT', {
        'content-type': 'application/json',
        authorization: token,
    });
};
