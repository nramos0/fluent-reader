declare interface Dictionary<T> {
    [index: string]: T;
}

declare interface Store {
    studyLanguage: Language;
    setStudyLanguage: (newLanguage: Lagnuage) => void;

    displayLanguage: Language;
    setDisplayLanguage: (newLanguage: Lagnuage) => void;

    wordData: WordData;
    getWordStatus: (word: string) => WordStatus;
}

declare type Language = 'en' | 'zh';
declare type WordStatus = 'known' | 'learning' | 'new';
