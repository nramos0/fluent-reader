declare interface SimpleUser {
    id: number;
    username: string;
}

declare interface Timestamp {
    secs_since_epoch: number;
    nanos_since_epoch: number;
}

declare interface SimpleArticle {
    id: number;
    title: string;
    author: string | null;
    // no content
    content_length: number;
    // no words
    // no unique words
    created_on: Timestamp;
    is_system: boolean;
    // no uploader_id
    lang: string;
    tags: string[];
}

declare interface Article {
    id: number;
    title: string;
    author: string | null;
    content: string;
    content_length: number;
    words: string[];
    sentences: string[][];
    unique_words: Dictionary<number>;
    page_data: PageTypeData[];
    created_on: Timestamp;
    is_system: boolean;
    uploader_id: number;
    lang: string;
    tags: string[];
}

declare interface PageTypeData {
    pages: string[][];
}

declare interface WordData {
    word_status_data: {
        en: {
            known: Dictionary<number>;
            learning: Dictionary<number>;
        };
        zh: {
            known: Dictionary<number>;
            learning: Dictionary<number>;
        };
    };
    word_definition_data: {
        en: Dictionary<string>;
        zh: Dictionary<string>;
    };
}

declare type LibraryType =
    | 'system'
    | 'user-saved'
    | 'user-created'
    | 'all-user';
