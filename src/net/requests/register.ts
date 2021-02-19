import { ENDPOINTS } from '../apiEndpoints';
import { request } from '../request';
import { useMutation } from 'react-query';

interface RegisterReqProps {
    username: string;
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

export const useRegister = (
    query: RegisterReqProps,
    onSuccessInput: API.OnSuccessFunction<RegisterResData>,
    onFailureInput: API.OnFailureFunction
) => {
    return useMutation(
        () => {
            return register(query);
        },
        {
            onSuccess: onSuccessInput,
            onError: onFailureInput,
        }
    );
};
