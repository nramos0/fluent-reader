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
    content_length: number;
    created_on: Timestamp;
    is_system: boolean;
    lang: string;
    tags: string[];
}
