import React, { useContext } from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ArticleList from '../ArticleList/ArticleList';
import ScrollBox from '../../general/ScrollBox/ScrollBox';
import LibraryOptions from '../LibraryOptions/LibraryOptions';
import { observable } from 'mobx';

interface LibraryInfo {
    libraryType: 'system' | 'user';
}

const libraryInfo: LibraryInfo = observable({
    libraryType: 'user',
});

const LibraryContext = React.createContext(libraryInfo);

export const useLibraryInfo = () => {
    return useContext(LibraryContext);
};

const Library: React.FC = () => {
    const { t } = useTranslation();
    return (
        <LibraryContext.Provider value={libraryInfo}>
            <ScrollBox overflowX="hidden" m={1} flex={1}>
                <Flex direction="column" align="center" flex={1} p="2% 7.5%">
                    <Heading
                        p="5px 10px"
                        borderRadius="15px"
                        bg="white"
                        color="#661919"
                        textAlign="center"
                        fontSize="4xl"
                        width="100%"
                        mb={3}
                    >
                        {t('library')}
                    </Heading>
                    <LibraryOptions />
                    <ArticleList />
                </Flex>
            </ScrollBox>
        </LibraryContext.Provider>
    );
};

export default Library;
