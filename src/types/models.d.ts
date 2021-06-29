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
    pages_sm: string[][];
    pages_md: string[][];
    pages_lg: string[][];
    created_on: Timestamp;
    is_system: boolean;
    uploader_id: number;
    lang: string;
    tags: string[];
}
