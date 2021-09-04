import { AxiosResponse, AxiosError } from 'axios';

declare global {
    namespace API {
        type Request<ReqProps = {}, ResData = {}, Meta = unknown> = (
            data: ReqProps,
            token?: string,
            meta?: Meta
        ) => Response<ResData>;

        type Response<ResData> = Promise<AxiosResponse<ResData>>;

        type ToWrap<T> = [AxiosError | null, AxiosResponse<T> | undefined];

        type OnSuccessFn<T> = (data: AxiosResponse<T>) => void;

        type OnFailureFn = (err: AxiosError) => void;
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
