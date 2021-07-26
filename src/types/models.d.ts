declare interface SimpleUser {
    id: number;
    username: string;
    display_lang: Language;
    study_lang: Language;
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

declare interface WordStatusData {
    en: SingleLangStatusData;
    zh: SingleLangStatusData;
}

declare interface SingleLangStatusData {
    known: Dictionary<number>;
    learning: Dictionary<number>;
}
declare type SingleLangDefData = Dictionary<string>;

declare interface WordDefinitionData {
    en: SingleLangDefData;
    zh: SingleLangDefData;
}

declare interface WordData {
    word_status_data: WordStatusData;
    word_definition_data: WordDefinitionData;
}

declare type LibraryType =
    | 'system'
    | 'user-saved'
    | 'user-created'
    | 'all-user';

type UnderlineColor =
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'purple'
    | 'gray'
    | 'black';

declare interface RangeSelect {
    start: number;
    end: number;
}

declare interface UnderlineRange {
    selection: RangeSelect;
    color: UnderlineColor;
}
