import axios from 'axios';

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

export const request = async <ReqProps extends object>(
    url: string,
    dataInput: ReqProps,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    headers: HeaderData
) => {
    const data = getRequestData(dataInput, headers['content-type']);

    if (headers.authorization !== undefined) {
        headers.authorization = `Bearer ${headers.authorization}`;
    }

    return axios({
        method: method,
        url: url,
        data: data,
        headers: headers,
    });
};
