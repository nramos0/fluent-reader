import React, { useCallback, useState } from 'react';
import { Flex, Button, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useLoadInfo } from '../../general/LoadWrapper/LoadWrapper';
import { useAuth } from '../../general/AuthWrapper/AuthWrapper';
import { getFullSysArticle } from '../../../net/requests/getFullSysArticle';
import { getFullUserArticle } from '../../../net/requests/getFullUserArticle';
import to from 'await-to-js';
import { useHistory } from 'react-router-dom';
import { useStore } from '../../../hooks/useStore';
import { observer } from 'mobx-react';
import { useLibraryInfo } from '../Library/Library';
import { useSaveArticle } from '../../../net/requests/saveArticle';
import { useRemoveArticle } from '../../../net/requests/removeArticle';
// import { useDeleteArticle } from '../../../net/requests/deleteArticle';
import { getArticleReadData } from '../../../net/requests/getArticleReadData';

interface Props {
    article: SimpleArticle;
    onAdd: (article: SimpleArticle) => void;
    onRemoveSuccess: (id: number) => void;
}

const ArticleControls: React.FC<Props> = ({
    article,
    onAdd,
    onRemoveSuccess,
}) => {
    const { t } = useTranslation('library');
    const [isLoading, setIsLoading] = useState(false);

    const loadInfo = useLoadInfo();
    const history = useHistory();
    const store = useStore();
    const libraryInfo = useLibraryInfo();

    const { token } = useAuth();
    const onOpen = useCallback(async () => {
        setIsLoading(true);

        const getArticlePromise = article.is_system
            ? getFullSysArticle({ id: article.id }, token)
            : getFullUserArticle({ id: article.id }, token);

        const getReadDataPromise = getArticleReadData(
            {
                article_id: article.id,
            },
            token
        );

        const promise = Promise.all([getArticlePromise, getReadDataPromise]);

        loadInfo.loadUntilResolve(promise);

        const [getArticleErr, getArticleData] = await to(getArticlePromise);
        const [getReadDataErr, getReadDataData] = await to(getReadDataPromise);

        if (
            getArticleErr !== null ||
            getArticleData === undefined ||
            getReadDataErr !== null ||
            getReadDataData === undefined
        ) {
            return;
        }

        store.setReadArticle(getArticleData.data.article);
        store.setArticleReadData(getReadDataData.data.data);

        setIsLoading(false);

        history.push('/app/read');
    }, [article.id, article.is_system, history, loadInfo, store, token]);

    const showToast = useToast();

    const saveMutation = useSaveArticle();
    const onSave = useCallback(async () => {
        setIsLoading(true);

        const promise = saveMutation.mutateAsync({
            article_id: article.id,
        });
        loadInfo.loadUntilResolve(promise);

        const [err, data] = await promise;
        if (err && data === undefined) {
            if (err?.response?.status === 409) {
                // console.log('conflict');
                showToast({
                    description: t('article-saved-before'),
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                // console.log('other error');
            }
        } else {
            // err === null && data !== undefined
            onAdd(article);
            showToast({
                description: t('article-saved-success'),
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        }
        setIsLoading(false);
    }, [article, loadInfo, onAdd, saveMutation, showToast, t]);

    const removeMutation = useRemoveArticle();
    const onRemove = useCallback(async () => {
        setIsLoading(true);

        const promise = removeMutation.mutateAsync({
            article_id: article.id,
        });
        loadInfo.loadUntilResolve(promise);

        const [err, data] = await promise;
        if (err && data === undefined) {
            showToast({
                description: t('article-remove-error'),
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } else {
            // err === null && data !== undefined
            onRemoveSuccess(article.id);
            showToast({
                description: t('article-remove-success'),
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        }
        setIsLoading(false);
    }, [article.id, loadInfo, onRemoveSuccess, removeMutation, showToast, t]);

    // const deleteMutation = useDeleteArticle();
    // const onDelete = useCallback(async () => {
    //     setIsLoading(true);

    //     const promise = deleteMutation.mutateAsync({
    //         article_id: article.id,
    //     });
    //     loadInfo.loadUntilResolve(promise);

    //     const [err, data] = await promise;
    //     if (err && data === undefined) {
    //         showToast({
    //             description: t('article-remove-error'),
    //             status: 'error',
    //             duration: 5000,
    //             isClosable: true,
    //         });
    //     } else {
    //         // err === null && data !== undefined
    //         onRemoveSuccess(article.id);
    //         showToast({
    //             description: t('article-remove-success'),
    //             status: 'success',
    //             duration: 5000,
    //             isClosable: true,
    //         });
    //     }
    //     setIsLoading(false);
    // }, [article.id, deleteMutation, loadInfo, onRemoveSuccess, showToast, t]);

    return (
        <Flex direction="row" p="3px 0px" justify="flex-start">
            <Button variant="type2" onClick={onOpen} disabled={isLoading}>
                {t('open')}
            </Button>
            {libraryInfo.libraryType !== 'user-saved' && (
                <Button
                    variant="type2"
                    onClick={onSave}
                    disabled={isLoading}
                    ml={3}
                >
                    {t('save')}
                </Button>
            )}
            {libraryInfo.libraryType === 'user-saved' && (
                <Button
                    variant="type2"
                    onClick={onRemove}
                    disabled={isLoading}
                    ml={3}
                >
                    {t('remove')}
                </Button>
            )}
            {/* {article.uploader_id === store.getUser().id && (
                <Button
                    variant="type2"
                    onClick={onDelete}
                    disabled={isLoading}
                    ml={3}
                >
                    {t('delete')}
                </Button>
            )} */}
        </Flex>
    );
};

export default observer(ArticleControls);
