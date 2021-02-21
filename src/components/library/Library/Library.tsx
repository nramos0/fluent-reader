import React from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ArticleList from '../ArticleList/ArticleList';
import ScrollBox from '../../general/ScrollBox/ScrollBox';

const articleList: SimpleArticle[] = [
    {
        id: 3,
        title: 'Interesting Programming',
        author: null,
        content_length: 19,
        created_on: {
            secs_since_epoch: 1613902585,
            nanos_since_epoch: 880387000,
        },
        is_system: false,
        lang: 'en',
        tags: ['rust', 'programming', 'imperative'],
    },
    {
        id: 2,
        title: 'Cooler Article',
        author: null,
        content_length: 31,
        created_on: {
            secs_since_epoch: 1613902555,
            nanos_since_epoch: 820363000,
        },
        is_system: false,
        lang: 'en',
        tags: ['cat', 'dog'],
    },
    {
        id: 1,
        title: 'Cool Article 1',
        author: null,
        content_length: 30,
        created_on: {
            secs_since_epoch: 1613902494,
            nanos_since_epoch: 960234000,
        },
        is_system: false,
        lang: 'en',
        tags: [],
    },
    {
        id: 3,
        title: 'Interesting Programming',
        author: null,
        content_length: 19,
        created_on: {
            secs_since_epoch: 1613902585,
            nanos_since_epoch: 880387000,
        },
        is_system: false,
        lang: 'en',
        tags: ['rust', 'programming', 'imperative'],
    },
    {
        id: 2,
        title: 'Cooler Article',
        author: null,
        content_length: 31,
        created_on: {
            secs_since_epoch: 1613902555,
            nanos_since_epoch: 820363000,
        },
        is_system: false,
        lang: 'en',
        tags: ['cat', 'dog'],
    },
    {
        id: 1,
        title: 'Cool Article 1',
        author: null,
        content_length: 30,
        created_on: {
            secs_since_epoch: 1613902494,
            nanos_since_epoch: 960234000,
        },
        is_system: false,
        lang: 'en',
        tags: [],
    },
    {
        id: 3,
        title: 'Interesting Programming',
        author: null,
        content_length: 19,
        created_on: {
            secs_since_epoch: 1613902585,
            nanos_since_epoch: 880387000,
        },
        is_system: false,
        lang: 'en',
        tags: ['rust', 'programming', 'imperative'],
    },
    {
        id: 2,
        title: 'Cooler Article',
        author: null,
        content_length: 31,
        created_on: {
            secs_since_epoch: 1613902555,
            nanos_since_epoch: 820363000,
        },
        is_system: false,
        lang: 'en',
        tags: ['cat', 'dog'],
    },
    {
        id: 1,
        title: 'Cool Article 1',
        author: null,
        content_length: 30,
        created_on: {
            secs_since_epoch: 1613902494,
            nanos_since_epoch: 960234000,
        },
        is_system: false,
        lang: 'en',
        tags: [],
    },
    {
        id: 3,
        title: 'Interesting Programming',
        author: null,
        content_length: 19,
        created_on: {
            secs_since_epoch: 1613902585,
            nanos_since_epoch: 880387000,
        },
        is_system: false,
        lang: 'en',
        tags: ['rust', 'programming', 'imperative'],
    },
    {
        id: 2,
        title: 'Cooler Article',
        author: null,
        content_length: 31,
        created_on: {
            secs_since_epoch: 1613902555,
            nanos_since_epoch: 820363000,
        },
        is_system: false,
        lang: 'en',
        tags: ['cat', 'dog'],
    },
    {
        id: 1,
        title: 'Cool Article 1',
        author: null,
        content_length: 30,
        created_on: {
            secs_since_epoch: 1613902494,
            nanos_since_epoch: 960234000,
        },
        is_system: false,
        lang: 'en',
        tags: [],
    },
];

const Library: React.FC = () => {
    const { t } = useTranslation();
    return (
        <ScrollBox overflowX="hidden" m={1} flex={1}>
            <Flex direction="column" align="center" flex={1} p={3}>
                <Heading color="white" textAlign="center" fontSize="4xl" mb={3}>
                    {t('library')}
                </Heading>
                <ArticleList list={articleList} />
            </Flex>
        </ScrollBox>
    );
};

export default Library;
