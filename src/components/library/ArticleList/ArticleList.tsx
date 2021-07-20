import React, { useState, useEffect } from 'react';
import { Flex, Text, Skeleton, Button } from '@chakra-ui/react';
import Article from '../Article/Article';
import { useGetSysArticleList } from '../../../net/requests/getSysArticleList';
import { useGetUserArticleList } from '../../../net/requests/getUserArticleList';
import { useLibraryInfo } from '../Library/Library';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { sampleData } from './sampleData';
import usePagination from '../../../hooks/usePagination';
// import { useTranslation } from 'react-i18next';

const ArticleList: React.FC = () => {
    const { t } = useTranslation('library');

    const [lang] = useState();
    const [search] = useState<string>();

    const [sysList, setSysList] = useState<SimpleArticle[]>(sampleData);
    const [userList, setUserList] = useState<SimpleArticle[]>(sampleData);

    const libraryInfo = useLibraryInfo();

    const list = libraryInfo.libraryType === 'user' ? userList : sysList;

    const {
        data,
        incrementPage,
        decrementPage,
        currentPage,
        pageCount,
    } = usePagination(list, 8);

    const [sysOffset, setSysOffset] = useState(0);

    const {
        refetch: sysRefetch,
        isLoading: sysIsLoading,
        isError: sysIsError,
    } = useGetSysArticleList(
        {
            offset: sysOffset,
            lang: lang,
            search: search,
        },
        {
            onSuccess: (res) => {
                setSysList((prevList) => {
                    if (prevList === sampleData) {
                        return [...res.data.articles];
                    } else {
                        return [...prevList, ...res.data.articles];
                    }
                });
                setSysOffset((prev) => prev + res.data.count);
            },
            onError: (err) => {
                console.log(err);
            },
        }
    );

    const [userOffset, setUserOffset] = useState(0);
    const {
        refetch: userRefetch,
        isLoading: userIsLoading,
        isError: userIsError,
    } = useGetUserArticleList(
        {
            offset: userOffset,
            lang: lang,
            search: search,
        },
        {
            onSuccess: (res) => {
                setUserList((prevList) => {
                    if (prevList === sampleData) {
                        return [...res.data.articles];
                    } else {
                        return [...prevList, ...res.data.articles];
                    }
                });
                setUserOffset((prev) => prev + res.data.count);
            },
            onError: (err) => {
                console.log(err);
            },
        }
    );

    useEffect(() => {
        if (libraryInfo.libraryType === 'user') {
            userRefetch();
        } else if (libraryInfo.libraryType === 'system') {
            sysRefetch();
        }
    }, [libraryInfo.libraryType, sysRefetch, userRefetch]);

    const isLoading = userIsLoading || sysIsLoading;

    if (userIsError || sysIsError) {
    } else if (list.length === 0) {
        return (
            <Text
                fontStyle="bold"
                fontSize="28px"
                width="100%"
                mt={2}
                color="white"
                textAlign="center"
            >
                {t('no-articles')}
            </Text>
        );
    }

    return (
        <Flex
            direction="column"
            w="100%"
            bg="#fff"
            borderRadius="15px"
            p="15px 100px"
        >
            <Flex mb={3} align="center">
                <Button
                    flex={1}
                    onClick={decrementPage}
                    disabled={currentPage <= 0}
                >
                    Prev
                </Button>
                <Button m="0 5px 0 5px">Page: {currentPage + 1}</Button>
                <Button
                    flex={1}
                    onClick={incrementPage}
                    disabled={currentPage >= pageCount - 1}
                >
                    Next
                </Button>
            </Flex>
            {data.map((article, index) => (
                <Skeleton key={index} isLoaded={!isLoading} mb={3}>
                    <Article article={article} />
                </Skeleton>
            ))}
        </Flex>
    );
};

export default observer(ArticleList);
