import React from 'react';
import { observable } from 'mobx';
import { updateWordStatus, updateWordStatusBatch } from './net/requests/index';

export const store: Store = observable({
    token: '',

    studyLanguage: 'en',
    setStudyLanguage(newLanguage) {
        this.studyLanguage = newLanguage;
    },

    displayLanguage: 'en',
    setDisplayLanguage(newLanguage) {
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

    getWordStatus(word) {
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

    updateWordStatus(word, newStatus, isBatch) {
        word = word.toLowerCase();

        const wordStatusData = this.wordData.word_status_data[
            this.studyLanguage
        ];

        let didUpdate = false;

        switch (newStatus) {
            case 'known':
                if (wordStatusData.known[word] === 1) {
                    break;
                }
                if (wordStatusData.learning[word] === 1) {
                    delete wordStatusData.learning[word];
                }
                wordStatusData.known[word] = 1;
                didUpdate = true;
                break;

            case 'learning':
                if (wordStatusData.learning[word] === 1) {
                    break;
                }
                if (wordStatusData.known[word] === 1) {
                    delete wordStatusData.known[word];
                }
                wordStatusData.learning[word] = 1;
                didUpdate = true;
                break;

            case 'new':
                if (wordStatusData.known[word] === 1) {
                    delete wordStatusData.known[word];
                    didUpdate = true;
                }
                if (wordStatusData.learning[word] === 1) {
                    delete wordStatusData.learning[word];
                    didUpdate = true;
                }
                break;
        }

        if (!isBatch && didUpdate) {
            updateWordStatus(
                {
                    lang: this.studyLanguage,
                    word: word,
                    status: newStatus,
                },
                this.token
            );
        }

        return didUpdate;
    },
    updateWordStatusBatch(words, newStatus) {
        updateWordStatusBatch(
            {
                lang: this.studyLanguage,
                words: words,
                status: newStatus,
            },
            this.token
        );

        return true;
    },
} as Store);

export default React.createContext(store);
