import React, { useState, useEffect, useCallback } from 'react';
import { Flex, Text, Skeleton, Button } from '@chakra-ui/react';
import Article from '../Article/Article';
import { useGetSysArticleList } from '../../../net/requests/getSysArticleList';
import { useGetUserArticleList } from '../../../net/requests/getUserArticleList';
import { useLibraryInfo } from '../Library/Library';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { sampleData } from './sampleData';
import usePagination from '../../../hooks/usePagination';
import { useStore } from '../../../hooks/useStore';

const pageSize = 4;
const fetchSize = pageSize * 2 + 1;

const ArticleList: React.FC = () => {
    const { t } = useTranslation('library');

    const store = useStore();

    const [search] = useState<string>();

    const [sysList, setSysList] = useState<SimpleArticle[]>(sampleData);
    const [sysOffset, setSysOffset] = useState(0);

    const [userList, setUserList] = useState<SimpleArticle[]>(sampleData);
    const [userOffset, setUserOffset] = useState(0);

    const libraryInfo = useLibraryInfo();

    // useEffect(() => {
    //     setUserOffset(0);
    //     setSysOffset(0);
    // }, [libraryInfo.libraryType]);

    const list = libraryInfo.libraryType === 'user' ? userList : sysList;

    const [ready, setReady] = useState(false);

    const {
        data,
        incrementPage,
        decrementPage,
        currentPage,
        pageCount,
        lastPage,
    } = usePagination(list, pageSize);

    const {
        refetch: sysRefetch,
        isLoading: sysIsLoading,
        isError: sysIsError,
    } = useGetSysArticleList(
        {
            offset: sysOffset,
            lang: store.studyLanguage,
            search: search,
            limit: fetchSize,
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
                setReady(true);
            },
            onError: (err) => {
                console.log(err);
                setReady(true);
            },
        }
    );

    const {
        refetch: userRefetch,
        isLoading: userIsLoading,
        isError: userIsError,
    } = useGetUserArticleList(
        {
            offset: userOffset,
            lang: store.studyLanguage,
            search: search,
            limit: fetchSize,
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
                setReady(true);
            },
            onError: (err) => {
                console.log(err);
                setReady(true);
            },
        }
    );

    const fetchByLibrary = useCallback(() => {
        if (libraryInfo.libraryType === 'user') {
            userRefetch();
        } else if (libraryInfo.libraryType === 'system') {
            sysRefetch();
        }
    }, [libraryInfo.libraryType, sysRefetch, userRefetch]);

    useEffect(() => {
        fetchByLibrary();
    }, [fetchByLibrary]);

    useEffect(() => {
        if (lastPage < currentPage) {
            fetchByLibrary();
        }
    }, [currentPage, fetchByLibrary, lastPage]);

    const isLoading =
        libraryInfo.libraryType === 'system' ? sysIsLoading : userIsLoading;

    useEffect(() => {
        if (isLoading && ready) {
            setReady(false);
        } else if (!isLoading && !ready) {
            setReady(true);
        }
    }, [isLoading, ready]);

    useEffect(() => {
        setReady(false);
    }, [libraryInfo.libraryType]);

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
                    {t('common:prev')}
                </Button>
                <Button m="0 5px 0 5px">
                    {t('common:page')}: {currentPage + 1}
                </Button>
                <Button
                    flex={1}
                    onClick={incrementPage}
                    disabled={currentPage >= pageCount - 1}
                >
                    {t('common:next')}
                </Button>
            </Flex>
            {data.map((article, index) => (
                <Skeleton key={index} isLoaded={ready && !isLoading} mb={3}>
                    <Article article={article} />
                </Skeleton>
            ))}
        </Flex>
    );
};

export default observer(ArticleList);
