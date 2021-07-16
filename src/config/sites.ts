const sites = {
    en: {
        en: [
            {
                name: 'Merriam-Webster',
                link: 'https://www.merriam-webster.com/dictionary/',
                wordInLink: true,
            },
            {
                name: 'Longman Dictionary',
                link: 'https://www.ldoceonline.com/search/?q=',
                wordInLink: true,
            },
            {
                name: 'Verb Conjugation',
                link: 'http://conjugator.reverso.net/conjugation-english-verb-',
                wordInLink: true,
                ending: '.html',
            },
        ],
        zh: [
            {
                name: '有道词典',
                link: 'https://www.youdao.com/w/eng/',
                wordInLink: true,
            },
            {
                name: '欧路词典',
                link: 'https://dict.eudic.net/dicts/en/',
                wordInLink: true,
            },
            {
                name: 'Cambridge Dictionary (简体)',
                link:
                    'https://dictionary.cambridge.org/dictionary/english-chinese-simplified/',
                wordInLink: true,
            },
            {
                name: 'Cambridge Dictionary (繁體)',
                link:
                    'https://dictionary.cambridge.org/dictionary/english-chinese-traditional/',
                wordInLink: true,
            },
            {
                name: 'MDBG Dictionary',
                link:
                    'https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=',
                wordInLink: true,
            },
            {
                name: 'Google Translate (简体)',
                link: 'https://translate.google.com/#en/zh-CN/',
                wordInLink: true,
            },
            {
                name: 'Google Translate (繁體)',
                link: 'https://translate.google.com/#en/zh-TW/',
                wordInLink: true,
            },
        ],
    },
    zh: {
        zh: [
            {
                name: '有道词典',
                link: 'https://www.youdao.com/w/eng/',
                wordInLink: true,
            },
            {
                name: '欧路词典',
                link: 'https://dict.eudic.net/dicts/en/',
                wordInLink: true,
            },

            {
                name: 'ZDic.net',
                link: 'https://www.zdic.net/hans/',
                wordInLink: true,
            },
            {
                name: 'Dict.cn',
                link: 'dict.cn/',
                wordInLink: true,
            },
            {
                name: '百度百科',
                link: 'https://baike.baidu.com/item/',
                wordInLink: true,
            },
            {
                name: 'Forvo Pronunciation',
                link: 'https://forvo.com/word/',
                wordInLink: true,
            },
        ],
        en: [
            {
                name: '有道词典',
                link: 'https://www.youdao.com/w/eng/',
                wordInLink: true,
            },
            {
                name: '欧路词典',
                link: 'https://dict.eudic.net/dicts/en/',
                wordInLink: true,
            },
            {
                name: 'MDBG Dictionary',
                link:
                    'https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=',
                wordInLink: true,
            },
            {
                name: 'Jukuu Example Sentences',
                link: 'http://www.jukuu.com/search.php?q=',
                wordInLink: true,
            },
            {
                name: 'LINE Dict',
                link:
                    'https://dict.naver.com/linedict/zhendict/#/cnen/example?query=',
                wordInLink: true,
            },
            {
                name: 'Google Translate',
                link: 'https://translate.google.com/#zh-CN/en/',
                wordInLink: true,
            },
        ],
    },
    // hk: [
    //     {
    //         name: 'CantoDict',
    //         link: 'http://www.cantonese.sheik.co.uk/scripts/wordsearch.php',
    //         wordInLink: false,
    //     },
    //     {
    //         name: 'Cantonese.org',
    //         link: 'http://www.cantonese.org/search.php?q=',
    //         wordInLink: true,
    //     },
    //     {
    //         name: 'Cantonese Class 101',
    //         link: 'https://www.cantoneseclass101.com/cantonese-dictionary/',
    //         wordInLink: false,
    //     },
    //     {
    //         name: 'Forvo Pronunciation',
    //         link: 'https://forvo.com/word/',
    //         wordInLink: true,
    //     },
    //     {
    //         name: 'MDBG Dictionary',
    //         link:
    //             'https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=',
    //         wordInLink: true,
    //     },
    //     {
    //         name: 'Google Translate',
    //         link: 'https://translate.google.com/#zh-CN/en/',
    //         wordInLink: true,
    //     },
    // ],
} as Sites;

export interface Site {
    name: string;
    link: string;
    wordInLink: boolean;
    ending?: string;
}

interface Sites {
    en: Dictionary<Site[]>;
    zh: Dictionary<Site[]>;
}

export default sites;
