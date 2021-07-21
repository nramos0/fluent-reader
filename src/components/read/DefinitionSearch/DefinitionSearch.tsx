import React from 'react';
import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuGroup,
    Button,
    Link,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { useStore } from '../../../hooks/useStore';
import sites, { Site } from '../../../config/sites';
import { useReaderStore } from '../Reader/Reader';

const DictionaryItem: React.FC<Site> = observer((dict) => {
    const readerStore = useReaderStore();

    if (readerStore.currentWord === null) {
        return null;
    }

    const link =
        dict.link +
        (dict.wordInLink ? readerStore.currentWord.word.toLowerCase() : '');

    return (
        <MenuItem p="none">
            <Link
                p="3px"
                onClick={() => {
                    window.open(link, 'newwindow', 'width=600,height=500');
                }}
                textDecoration="none"
                w="100%"
                h="100%"
                _hover={{
                    textDecoration: 'none',
                }}
            >
                {dict.name}
            </Link>
        </MenuItem>
    );
});

const DefinitionSearch: React.FC<{}> = () => {
    const { t } = useTranslation('reader');
    const store = useStore();

    const displayLang = store.displayLanguage;
    const studyLang = store.studyLanguage;

    const studyLangDicts =
        sites[studyLang === 'zh' ? 'zh-CN' : studyLang][studyLang];
    const displayLangDicts =
        sites[studyLang === 'zh' ? 'zh-CN' : studyLang][displayLang];

    return (
        <Menu>
            <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                bgColor="#661919"
                color="#FFFFFF"
                border="1px solid transparent"
                _hover={{
                    bg: '#FFFFFF',
                    color: '#661919',
                    border: '1px solid #661919',
                }}
                _active={{
                    bg: '#FFFFFF',
                    color: '#661919',
                    border: '1px solid #661919',
                }}
            >
                {t('definition-search')}
            </MenuButton>
            <MenuList overflowY="auto" maxHeight="300px">
                <MenuGroup
                    textAlign="left"
                    title={t('your-lang-dicts').replace(
                        '*',
                        t(`common:${displayLang}`)
                    )}
                >
                    {displayLangDicts.map((dict) => (
                        <DictionaryItem {...dict} key={dict.name} />
                    ))}
                </MenuGroup>
                {displayLang !== studyLang && (
                    <MenuGroup
                        textAlign="left"
                        title={t('native-dicts').replace(
                            '*',
                            t(`common:${studyLang}`)
                        )}
                    >
                        {studyLangDicts.map((dict) => (
                            <DictionaryItem {...dict} key={dict.name} />
                        ))}
                    </MenuGroup>
                )}
            </MenuList>
        </Menu>
    );
};

export default observer(DefinitionSearch);
