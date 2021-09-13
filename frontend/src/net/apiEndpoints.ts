interface APIConfig {
    protocol: string;
    root: string;
    prefix: string;
}

const forceRemoteAPI = false;

const config: APIConfig = {
    protocol:
        process.env.NODE_ENV === 'development' && !forceRemoteAPI
            ? 'http://'
            : 'https://',
    root:
        process.env.NODE_ENV === 'development' && !forceRemoteAPI
            ? '127.0.0.1'
            : 'fluentreader.cc:2244',
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

const getUserDataReadEndpoint = (inner: string) => {
    return getUserDataEndpoint(`/read${inner}`);
};

const getUserDataMarkArticleEndpoint = (inner: string) => {
    return getUserDataEndpoint(`/mark_article${inner}`);
};

const getUserAllArticleWordDataEndpoint = (inner: string) => {
    return getUserEndpoint(`/all_article_word_data${inner}`);
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
            read: {
                _: getUserDataReadEndpoint('/{article_id}'),
            },
            mark_article: {
                _: getUserDataMarkArticleEndpoint('/'),
            },
            definition: getUserDataEndpoint('/definition/'),
        },

        all_article_word_data: {
            insert_articles: getUserAllArticleWordDataEndpoint(
                '/insert_articles/'
            ),
            word_status_counts: getUserAllArticleWordDataEndpoint(
                '/word_status_counts/'
            ),
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
                single: getArticleUserEndpoint('/saved/single/'),
            },
        },
    },
};
