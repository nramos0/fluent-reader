import React from 'react';
import { observable } from 'mobx';

export const store: Store = observable({
    studyLanguage: 'en' as Language,
    setStudyLanguage: function (newLanguage: Language) {
        this.studyLanguage = newLanguage;
    },

    displayLanguage: 'en' as Language,
    setDisplayLanguage: function (newLanguage: Language) {
        this.displayLanguage = newLanguage;
    },

    wordData: {
        word_status_data: {
            en: {
                known: {
                    both: 1,
                    did: 1,
                    from: 1,
                    in: 1,
                    left: 1,
                    see: 1,
                    something: 1,
                },
                learning: {
                    i: 1,
                    a: 1,
                    and: 1,
                    as: 1,
                    his: 1,
                    like: 1,
                    some: 1,
                    that: 1,
                    the: 1,
                },
            },
            zh: {
                known: {},
                learning: {},
            },
        },
        word_definition_data: {
            en: {
                at: '在',
                dark: '暗',
                did: '有',
                in: '在',
                us: '我们',
            },
            zh: {},
        },
    },

    getWordStatus: function (word: string) {
        const wordStatusData = this.wordData.word_status_data[
            this.studyLanguage
        ];

        word = word.toLowerCase();

        let status: WordStatus = 'new';
        // @ts-ignore
        if (wordStatusData.known[word] === 1) {
            status = 'known';
            // @ts-ignore
        } else if (wordStatusData.learning[word] === 1) {
            status = 'learning';
        }

        return status;
    },
});

export default React.createContext(store);
