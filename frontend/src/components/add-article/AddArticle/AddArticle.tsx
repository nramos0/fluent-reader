import React from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ScrollBox from '../../general/ScrollBox/ScrollBox';
import AddArticleForm from '../AddArticleForm/AddArticleForm';
import { useLocation } from 'react-router-dom';

const AddArticle: React.FC = () => {
    const location = useLocation();
    const { t } = useTranslation();

    return (
        <ScrollBox overflowX="hidden" m={1} flex={1} display="flex">
            <Flex direction="column" align="center" flex={1} p={3}>
                <Heading color="white" textAlign="center" fontSize="4xl" mb={3}>
                    {location.pathname.includes('add-article')
                        ? t('add-article')
                        : t('edit-article')}
                </Heading>
                <Flex
                    direction="column"
                    width="100%"
                    bgColor="white"
                    color="c1"
                    p={3}
                    borderRadius="lg"
                    flex={1}
                >
                    <AddArticleForm />
                </Flex>
            </Flex>
        </ScrollBox>
    );
};

export default AddArticle;
