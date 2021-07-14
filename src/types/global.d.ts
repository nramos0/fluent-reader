declare interface Dictionary<T> {
    [index: string]: T;
}

declare interface Store {
    token: string;

    studyLanguage: Language;
    setStudyLanguage: (newLanguage: Lagnuage) => void;

    displayLanguage: Language;
    setDisplayLanguage: (newLanguage: Lagnuage) => void;

    wordData: WordData;
    getWordStatus: (word: string) => WordStatus;
    updateWordStatus: (
        word: string,
        newStatus: WordStatus,
        isBatch: boolean
    ) => boolean;
    updateWordStatusBatch: (words: string[], newStatus: WordStatus) => boolean;
}

declare type Language = 'en' | 'zh';
declare type WordStatus = 'known' | 'learning' | 'new';

declare type OnClickFunction = (e: MouseEvent<HTMLElement>) => void;
