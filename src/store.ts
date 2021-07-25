import React from 'react';
import { observable } from 'mobx';
import { updateWordStatus, updateWordStatusBatch } from './net/requests/index';
import { updateWordDefinition } from './net/requests/updateWordDefinition';
import { updateUser } from './net/requests/updateUser';

const definitionUpdateCooldown = 1500;

export const store: Store = observable({
    token: '',

    studyLang() {
        return this.getUser().study_lang;
    },

    setStudyLanguage(newLanguage) {
        this.getUser().study_lang = newLanguage;

        updateUser(
            {
                study_lang: newLanguage,
            },
            this.token
        );
    },

    displayLang() {
        return this.getUser().display_lang;
    },

    setDisplayLanguage(newLanguage) {
        this.getUser().display_lang = newLanguage;

        updateUser(
            {
                display_lang: newLanguage,
            },
            this.token
        );

        if (!this.i18n) {
            return;
        }

        return this.i18n.changeLanguage(newLanguage);
    },

    wordData: null,

    getWordData() {
        if (this.wordData === null) {
            throw new Error('Word data is null, but getWordStatus was called');
        }
        return this.wordData;
    },

    setWordData(wordData) {
        this.wordData = wordData;
    },

    getWordStatus(word) {
        word = word.toLowerCase();

        const wordStatusData = this.getWordStatusData();

        let status: WordStatus = 'new';
        if (wordStatusData.known[word] === 1) {
            status = 'known';
        } else if (wordStatusData.learning[word] === 1) {
            status = 'learning';
        }

        return status;
    },

    getWordStatusData() {
        return this.getWordData().word_status_data[this.studyLang()];
    },

    getWordDefinitionData() {
        return this.getWordData().word_definition_data[this.studyLang()];
    },

    updateWordStatus(word, newStatus, isBatch) {
        word = word.toLowerCase();

        const wordStatusData = this.getWordStatusData();

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
                    lang: this.studyLang(),
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
                lang: this.studyLang(),
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

        this.getWordDefinitionData()[word] = definition;

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
                lang: this.studyLang(),
                word: word,
                definition: definition,
            },
            this.token
        );

        this.lastDefUpdate = new Date().getTime();
        return true;
    },

    getDefinition(word) {
        return this.getWordDefinitionData()[word.toLowerCase()];
    },

    lastDefUpdate: 0,
    defUpdateCache: null,

    readArticle: null,

    i18n: null,

    setI18n(val) {
        this.i18n = val;
    },

    user: null,

    getUser() {
        if (this.user === null) {
            throw new Error('user is null, but getUser() was called');
        }
        return this.user;
    },

    setUser(user) {
        this.user = user;
    },
} as Store);

export default React.createContext(store);
