import { AxiosResponse } from 'axios';

declare global {
    namespace API {
        type Request<ReqProps, ResData> = (data: ReqProps) => Response<ResData>;

        type Response<ResData> = Promise<AxiosResponse<ResData>>;

        type OnSuccessFunction<T> = (data: AxiosResponse<T>) => void;

        type OnFailureFunction = (err: API.Error) => void;
    }

    type ContentType =
        | 'application/json'
        | 'application/x-www-form-urlencoded'
        | 'multipart/form-data';

    interface HeaderData {
        authorization?: string;
        'content-type': ContentType;
    }
}
