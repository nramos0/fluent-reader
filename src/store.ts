import React from 'react';
import { observable } from 'mobx';

export const store: Store = observable({
    token: '',

    studyLanguage: 'en',
    setStudyLanguage: function (newLanguage) {
        this.studyLanguage = newLanguage;
    },

    displayLanguage: 'en',
    setDisplayLanguage: function (newLanguage) {
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

    getWordStatus: function (word) {
        word = word.toLowerCase();

        const wordStatusData = this.wordData.word_status_data[
            this.studyLanguage
        ];

        let status: WordStatus = 'new';
        if (wordStatusData.known[word] === 1) {
            status = 'known';
        } else if (wordStatusData.learning[word] === 1) {
            status = 'learning';
        }

        return status;
    },

    updateWordStatus: function (word, status) {
        word = word.toLowerCase();

        const wordStatusData = this.wordData.word_status_data[
            this.studyLanguage
        ];

        switch (status) {
            case 'known':
                if (wordStatusData.known[word] === 1) {
                    return false;
                }
                if (wordStatusData.learning[word] === 1) {
                    delete wordStatusData.learning[word];
                }
                wordStatusData.known[word] = 1;
                return true;

            case 'learning':
                if (wordStatusData.learning[word] === 1) {
                    return false;
                }
                if (wordStatusData.known[word] === 1) {
                    delete wordStatusData.known[word];
                }
                wordStatusData.learning[word] = 1;
                return true;

            case 'new':
                let didUpdate = false;
                if (wordStatusData.known[word] === 1) {
                    delete wordStatusData.known[word];
                    didUpdate = true;
                }
                if (wordStatusData.learning[word] === 1) {
                    delete wordStatusData.learning[word];
                    didUpdate = true;
                }
                return didUpdate;
        }
    },
} as Store);

export default React.createContext(store);
