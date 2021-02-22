const injectValue = (
    url: string,
    valueName: string,
    value: number | string
): string => {
    return url.replace(`/{${valueName}}`, `/${String(value)}`);
};

const getURLWithQuery = (
    url: string,
    queryParameterNames: string[],
    queryParameters: (number | string | undefined)[]
): string => {
    if (queryParameterNames.length === 0) return url;
    else if (queryParameterNames.length !== queryParameters.length) {
        throw new Error(
            'queryParameterNames and queryParameters must be arrays of the same length'
        );
    }

    let query = '?';
    for (let i = 0; i < queryParameterNames.length - 1; ++i) {
        if (queryParameters[i] === undefined) continue;

        const parameterName = queryParameterNames[i];
        const parameterValue = String(queryParameters[i]);
        query += parameterName + '=' + parameterValue + '&';
    }

    if (queryParameters[queryParameters.length - 1] !== undefined) {
        const lastParameterName =
            queryParameterNames[queryParameterNames.length - 1];
        const lastParameterValue = String(
            queryParameters[queryParameters.length - 1]
        );
        query += lastParameterName + '=' + lastParameterValue;
    } else {
        query = query.slice(0, query.length - 1);
    }

    return url + query;
};

const getURLWithValues = (
    url: string,
    urlParameterNames: string[],
    urlParameters: (number | string)[]
): string => {
    if (urlParameterNames.length !== urlParameters.length) {
        throw new Error(
            'urlParameterNames and urlParameters must be arrays of the same length'
        );
    }
    for (let i = 0; i < urlParameterNames.length; ++i) {
        const parameterName = urlParameterNames[i];
        const parameterValue = urlParameters[i];
        url = injectValue(url, parameterName, parameterValue);
    }
    return url;
};

export const prepareURL = (
    url: string,
    queryParameterNames: Array<string> = [],
    queryParameters: Array<number | string | undefined> = [],
    urlParameterNames: Array<string> = [],
    urlParameters: Array<number | string> = []
): string => {
    const urlWithValues = getURLWithValues(
        url,
        urlParameterNames,
        urlParameters
    );

    const urlWithQuery = getURLWithQuery(
        urlWithValues,
        queryParameterNames,
        queryParameters
    );
    return urlWithQuery;
};
