import React from 'react';
import { observable } from 'mobx';
import { updateWordStatus, updateWordStatusBatch } from './net/requests/index';
import { updateWordDefinition } from './net/requests/updateWordDefinition';

const definitionUpdateCooldown = 1500;

export const store: Store = observable({
    token: '',

    studyLanguage: 'en',
    setStudyLanguage(newLanguage) {
        this.studyLanguage = newLanguage;
    },

    displayLanguage: 'en',
    setDisplayLanguage(newLanguage) {
        this.displayLanguage = newLanguage;

        if (!this.i18n) {
            return;
        }

        return this.i18n.changeLanguage(newLanguage);
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
                chapter: '章',
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

    updateWordDefinition(word, definition) {
        // if there currently exists a cached update when this
        // function is, run, this update is surely newer than it,
        // so first immediately remove it before updating
        if (this.defUpdateCache !== null) {
            clearTimeout(this.defUpdateCache.timeout);
            this.defUpdateCache = null;
        }
        word = word.toLowerCase();

        this.wordData.word_definition_data[this.studyLanguage][
            word
        ] = definition;

        const currentTime = new Date().getTime();
        if (currentTime - this.lastDefUpdate < definitionUpdateCooldown) {
            this.defUpdateCache = {
                word: word,
                definition: definition,
                timeout: setTimeout(() => {
                    this.updateWordDefinition(word, definition);
                }, definitionUpdateCooldown),
            };
            return false;
        }

        updateWordDefinition(
            {
                lang: this.studyLanguage,
                word: word,
                definition: definition,
            },
            this.token
        );

        this.lastDefUpdate = new Date().getTime();
        return true;
    },

    getDefinition(word) {
        return this.wordData.word_definition_data[this.studyLanguage][
            word.toLowerCase()
        ];
    },

    lastDefUpdate: 0,
    defUpdateCache: null,

    readArticle: null,

    i18n: null,

    setI18n(val) {
        this.i18n = val;
    },
} as Store);

export default React.createContext(store);
