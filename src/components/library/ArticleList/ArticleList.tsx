import React, { useState, useEffect, useMemo } from 'react';
import { Flex, Text, Skeleton, Button } from '@chakra-ui/react';
import Article from '../Article/Article';
import { useGetArticleList } from '../../../net/requests/getArticleList';
import { useLibraryInfo } from '../Library/Library';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { sampleData } from './sampleData';
import usePagination from '../../../hooks/usePagination';
import { useStore } from '../../../hooks/useStore';
import { useCallback } from 'react';

const pageSize = 4;
const fetchSize = pageSize * 2 + 1;

enum LibraryTypeEnum {
    SYSTEM = 'system',
    USER_SAVED = 'user-saved',
    USER_CREATED = 'user-created',
    ALL_USER = 'all-user',
}

type LibraryTypeMap<T> = {
    [index in LibraryTypeEnum]: T;
};

type ListData = LibraryTypeMap<{
    list: SimpleArticle[];
    offset: number;
}>;

const ArticleList: React.FC = () => {
    const { t } = useTranslation('library');

    const store = useStore();

    const [search] = useState<string>();

    const [listData, setListData] = useState<ListData>({
        system: {
            list: sampleData,
            offset: 0,
        },
        'user-saved': {
            list: sampleData,
            offset: 0,
        },
        'user-created': {
            list: sampleData,
            offset: 0,
        },
        'all-user': {
            list: sampleData,
            offset: 0,
        },
    });

    const libraryInfo = useLibraryInfo();

    const { list, offset } = listData[libraryInfo.libraryType];

    const [ready, setReady] = useState(false);

    const {
        data,
        incrementPage,
        decrementPage,
        setCurrentPage,
        currentPage,
        pageCount,
        lastPage,
    } = usePagination(list, pageSize);

    useEffect(() => {
        setReady(false);
        setCurrentPage(0);
    }, [libraryInfo.libraryType, setCurrentPage]);

    const { refetch, isLoading, isError } = useGetArticleList(
        {
            offset: offset,
            lang: store.studyLang(),
            search: search,
            limit: fetchSize,
        },
        libraryInfo.libraryType,
        {
            onSuccess: (res) => {
                setListData((prevData) => {
                    const prevList = prevData[libraryInfo.libraryType].list;

                    const newData: ListData = {
                        system: {
                            ...prevData.system,
                        },
                        'user-saved': {
                            ...prevData['user-saved'],
                        },
                        'user-created': {
                            ...prevData['user-created'],
                        },
                        'all-user': {
                            ...prevData['all-user'],
                        },
                    };

                    const currentLibNewData = newData[libraryInfo.libraryType];
                    if (prevList === sampleData) {
                        currentLibNewData.list = [...res.data.articles];
                    } else {
                        currentLibNewData.list = [
                            ...list,
                            ...res.data.articles,
                        ];
                    }
                    currentLibNewData.offset += res.data.count;

                    return newData;
                });
                setReady(true);
            },
            onError: (err) => {
                console.log(err);
                setReady(false);
            },
        }
    );

    useEffect(() => {
        refetch();
    }, [refetch, libraryInfo.libraryType]);

    useEffect(() => {
        if (lastPage < currentPage) {
            refetch();
        }
    }, [currentPage, refetch, lastPage]);

    useEffect(() => {
        if (isLoading && ready) {
            setReady(false);
        }
    }, [isLoading, ready]);

    const onAdd = useCallback((article: SimpleArticle) => {
        setListData((prevData) => {
            return {
                system: {
                    ...prevData.system,
                },
                'user-saved': {
                    list: [
                        article,
                        ...(prevData['user-saved'].list === sampleData
                            ? []
                            : prevData['user-saved'].list),
                    ],
                    offset: prevData['user-saved'].offset + 1,
                },
                'user-created': {
                    ...prevData['user-created'],
                },
                'all-user': {
                    ...prevData['all-user'],
                },
            };
        });
    }, []);

    const idIndexMap = useMemo(() => {
        const map: Dictionary<number> = {};

        const length = list.length;
        for (let i = 0; i < length; ++i) {
            map[list[i].id] = i;
        }

        return map;
    }, [list]);

    const onRemove = useCallback(
        (id: number) => {
            setListData((prevData) => {
                const newData: ListData = {
                    system: {
                        ...prevData.system,
                    },
                    'user-saved': {
                        ...prevData['user-saved'],
                    },
                    'user-created': {
                        ...prevData['user-created'],
                    },
                    'all-user': {
                        ...prevData['all-user'],
                    },
                };
                const currentLibNewData = newData[libraryInfo.libraryType];

                currentLibNewData.list = [...currentLibNewData.list];
                currentLibNewData.list.splice(idIndexMap[id], 1);

                currentLibNewData.offset -= 1;

                return newData;
            });
        },
        [idIndexMap, libraryInfo.libraryType]
    );

    if (isError) {
        return (
            <Text
                fontStyle="bold"
                fontSize="28px"
                width="100%"
                mt={2}
                color="white"
                textAlign="center"
            >
                {t('article-fetch-error')}
            </Text>
        );
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
                    <Article
                        article={article}
                        onRemoveSuccess={onRemove}
                        onAdd={onAdd}
                    />
                </Skeleton>
            ))}
        </Flex>
    );
};

export default observer(ArticleList);
