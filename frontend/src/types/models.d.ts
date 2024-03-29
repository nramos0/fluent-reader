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
    created_on: Timestamp;
    uploader_id: number;
    content_description: string | null;

    is_system: boolean;
    is_private: boolean;

    lang: string;
    tags: string[];

    unique_word_count: number;
}

declare interface Article {
    id: number;

    title: string;
    author: string | null;
    created_on: Timestamp;
    uploader_id: number;

    is_system: boolean;
    is_private: boolean;

    lang: Language;
    tags: string[];

    word_count: number;

    unique_word_count: number;

    word_index_map: Dictionary<number[]>;
    stop_word_map: Dictionary<boolean>;

    page_data: {
        pages: string[][];
    }[];
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

type MarkColor =
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'purple'
    | 'gray'
    | 'black';

declare interface Mark {
    mark_type: 'underline'; // | 'highlight';
    selection: RangeSelect;
    color: MarkColor;
}

declare interface ArticleReadData {
    fruser_id: number;
    article_id: number;
    learned_words: {
        [word: string]: string;
    }[];
    underlines: Mark[];
}

declare interface WordStatusCountData {
    new: number;
    learning: number;
    known: number;
    total: number;
    article_id: number;
}
