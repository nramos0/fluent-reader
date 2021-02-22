import React, { useState, useEffect } from 'react';
import { Flex, Spinner } from '@chakra-ui/react';
import Article from '../Article/Article';
import { useGetSysArticleList } from '../../../net/requests/getSysArticleList';
// import { useTranslation } from 'react-i18next';

const ArticleList: React.FC = () => {
    // const t = useTranslation('library');
    // const showToast = useToast();

    const [list, setList] = useState<SimpleArticle[]>([]);

    const [offset, setOffset] = useState(0);
    const [lang] = useState();
    const [search] = useState<string>();

    const { refetch, isLoading, isError } = useGetSysArticleList(
        {
            offset: offset,
            lang: lang,
            search: search,
        },
        {
            onSuccess: (res) => {
                setList((previousList) => {
                    return [...previousList, ...res.data.articles];
                });
                setOffset((previousOffset) => previousOffset + res.data.count);
            },
            onError: (err) => {
                console.log(err);
            },
        }
    );

    useEffect(() => {
        refetch();
    }, [refetch]);

    if (isLoading) {
        return (
            <Flex direction="row" wrap="wrap" w="100%" h="100vh" ml={3}>
                <Spinner size="xl" />
            </Flex>
        );
    } else if (isError) {
    }

    return (
        <Flex direction="row" wrap="wrap" w="100%" ml={3}>
            {list.map((article, index) => (
                <Article article={article} key={index} />
            ))}
        </Flex>
    );
};

export default ArticleList;
