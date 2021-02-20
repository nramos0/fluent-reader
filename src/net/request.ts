import axios, { AxiosPromise } from 'axios';

const convertToUrlEncoded = (data: Dictionary<any>): string => {
    return Object.keys(data)
        .reduce((keyValueList, key) => {
            const encodedKey = encodeURIComponent(key);
            const encodedValue = encodeURIComponent(data[key]);

            keyValueList.push(encodedKey + '=' + encodedValue);

            return keyValueList;
        }, [] as string[])
        .join('&');
};

const convertToFormData = (data: Dictionary<any>) => {
    return Object.keys(data).reduce((formData, key) => {
        formData.append(key, data[key]);
        return formData;
    }, new FormData());
};

const getRequestData = (data: object, contentType: ContentType) => {
    switch (contentType) {
        case 'application/json':
            return data;
        case 'application/x-www-form-urlencoded':
            return convertToUrlEncoded(data);
        case 'multipart/form-data':
            return convertToFormData(data);
        default:
            throw new Error('Invalid Content Type!');
    }
};

export const request = <ReqProps extends object, ResData>(
    url: string,
    dataInput: ReqProps,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    headers: HeaderData
) => {
    const data = getRequestData(dataInput, headers['content-type']);

    return axios({
        method: method,
        url: url,
        data: data,
        headers: headers,
    }) as AxiosPromise<ResData>;
};
