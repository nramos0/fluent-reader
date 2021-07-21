interface APIConfig {
    protocol: string;
    root: string;
    prefix: string;
}

const config: APIConfig = {
    protocol: 'http://',
    root:
        process.env.NODE_ENV === 'development'
            ? '127.0.0.1'
            : '47.101.129.250:2244',
    prefix: '',
};

const parentEndpoint = config.protocol + config.root + config.prefix;

const getEndpoint = (endpoint: string) => {
    return parentEndpoint + endpoint;
};

// user

const getUserEndpoint = (inner: string) => {
    return getEndpoint(`/user${inner}`);
};

const getUserDataEndpoint = (inner: string) => {
    return getUserEndpoint(`/data${inner}`);
};

const getUserDataStatusEndpoint = (inner: string) => {
    return getUserDataEndpoint(`/status${inner}`);
};

// article

const getArticleEndpoint = (inner: string) => {
    return getEndpoint(`/article${inner}`);
};

const getArticleSystemEndpoint = (inner: string) => {
    return getArticleEndpoint(`/system${inner}`);
};

const getArticleUserEndpoint = (inner: string) => {
    return getArticleEndpoint(`/user${inner}`);
};

export const ENDPOINTS = {
    user: {
        _: getUserEndpoint('/'),
        log: getUserEndpoint('/log/'),
        reg: getUserEndpoint('/reg/'),
        refresh: getUserEndpoint('/refresh/'),
        auth: getUserEndpoint('/auth/'),

        data: {
            _: getUserDataEndpoint('/'),
            status: {
                _: getUserDataStatusEndpoint('/'),
                batch: getUserDataStatusEndpoint('/batch/'),
            },
            definition: getUserDataEndpoint('/definition/'),
        },
    },

    article: {
        _: getArticleEndpoint('/'),
        system: {
            list: getArticleSystemEndpoint('/list/'),
            single: getArticleSystemEndpoint('/single/{article_id}/'),
        },
        user: {
            list: getArticleUserEndpoint('/list/'),
            single: getArticleUserEndpoint('/single/{article_id}/'),

            all: {
                list: getArticleUserEndpoint('/all/list/'),
            },

            saved: {
                list: getArticleUserEndpoint('/saved/list/'),
                single: getArticleUserEndpoint('/saved/list/single/'),
            },
        },
    },
};
