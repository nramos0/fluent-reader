import React, { useCallback, useMemo } from 'react';
import { Flex, Button, useToast } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import to from 'await-to-js';
import * as Yup from 'yup';
import TitleField from '../TitleField/TitleField';
import AuthorField from '../AuthorField/AuthorField';
import LanguageField from '../LanguageField/LanguageField';
import PrivateField from '../PrivateField/PrivateField';
import TagField from '../TagField/TagField';
import ContentField from '../ContentField/ContentField';
import { useLoadInfo } from '../../general/LoadWrapper/LoadWrapper';
import { createArticle } from '../../../net/requests/createArticle';
import { useAuth } from '../../general/AuthWrapper/AuthWrapper';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import {
    EditArticleReqProps,
    useEditArticle,
} from '../../../net/requests/editArticle';
import { useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { useGetFullArticle } from '../../../net/requests/getFullArticle';
import { useState } from 'react';

interface AddArticleFormValues {
    title: string;
    author: string;
    content: string;
    language: string;
    tags: string[];
    is_private: boolean;
    [key: string]: string | string[] | boolean;
}

const addArticleFormInitialValues: AddArticleFormValues = {
    title: '',
    author: '',
    content: '',
    language: 'default',
    tags: [],
    is_private: false,
};

const cloneInitialValues = () => {
    return {
        ...addArticleFormInitialValues,
        tags: [],
    };
};

const EditHandler: React.FC<{
    id?: string;
    isArticleEdit: boolean;
    didEdit: boolean;
    props: FormikProps<AddArticleFormValues>;
    setEditArticleInitialData: React.Dispatch<
        React.SetStateAction<AddArticleFormValues>
    >;
}> = ({ id, isArticleEdit, didEdit, props, setEditArticleInitialData }) => {
    const { loadUntilResolve } = useLoadInfo();
    const store = useStore();
    const { refetch: fetchEditArticle } = useGetFullArticle(
        {
            id: id ? Number.parseInt(id) : 0,
            onlyEditInfo: true,
            isSystem: store.getUser().id === 1,
        },
        {
            onSuccess: (data) => {
                const article = data.data.article;

                // set initial values to dif with new values before submitting edit form
                props.initialValues.title = article.title;
                props.initialValues.author = article.author ?? '';
                // @ts-ignore
                props.initialValues.content = article.content ?? '';
                props.initialValues.language = article.lang;
                props.initialValues.tags = article.tags;
                props.initialValues.is_private = article.is_private;

                const newValues: AddArticleFormValues = {
                    title: article.title,
                    author: article.author ?? '',
                    // @ts-ignore
                    content: article.content,
                    language: article.lang,
                    tags: article.tags,
                    is_private: article.is_private,
                };

                setEditArticleInitialData({
                    ...newValues,
                    tags: [...newValues.tags],
                });
                props.setValues(newValues);
            },
        }
    );

    useEffect(() => {
        if (isArticleEdit && id && !didEdit) {
            loadUntilResolve(fetchEditArticle());
        }
    }, [didEdit, fetchEditArticle, id, isArticleEdit, loadUntilResolve]);

    return null;
};

const AddArticleForm = () => {
    const { t } = useTranslation('add-article');
    const { loadUntilResolve } = useLoadInfo();
    const showToast = useToast();
    const auth = useAuth();

    const validationSchema = useMemo(() => {
        const required = t('common:required');
        const tooShort = t('common:too-short');
        const tooLong = t('common:too-long');

        return Yup.object().shape({
            title: Yup.string()
                .required(required)
                .min(2, tooShort)
                .max(250, tooLong),
            author: Yup.string().max(100, tooLong),
            content: Yup.string().required(required).max(100000, tooLong),
            language: Yup.string()
                .required(required)
                .oneOf(['en', 'zh'], t('must-select-language')),
            tags: Yup.array(Yup.string()),
            is_private: Yup.bool(),
        });
    }, [t]);

    const location = useLocation<{ autoEditNavigate: boolean }>();
    const history = useHistory();
    const { id } = useParams<{ id?: string }>();
    const isArticleEdit =
        location.pathname.includes('edit-article') && id !== undefined;
    const editMutation = useEditArticle();

    const [
        editArticleInitialData,
        setEditArticleInitialData,
    ] = useState<AddArticleFormValues>(cloneInitialValues());
    const [didEdit, setDidEdit] = useState(false);

    const onSubmit = useCallback(
        async (
            values: AddArticleFormValues,
            actions: FormikHelpers<AddArticleFormValues>
        ) => {
            const [validationError] = await to(actions.validateForm(values));

            if (validationError !== null) {
                actions.setSubmitting(false);
                return;
            }
            if (isArticleEdit && id) {
                const vars: EditArticleReqProps = {
                    article_id: Number.parseInt(id),
                };

                let changed = 0;

                // only add those fields that changed
                for (const prop in values) {
                    if (Array.isArray(values[prop])) {
                        if (
                            (values[prop] as unknown[]).some(
                                (val, index) =>
                                    val !==
                                    (editArticleInitialData[prop] as unknown[])[
                                        index
                                    ]
                            )
                        ) {
                            vars[prop] = values[prop];
                            changed++;
                        }
                    } else if (values[prop] !== editArticleInitialData[prop]) {
                        vars[prop] = values[prop];
                        changed++;
                    }
                }
                if (changed === 0) {
                    showToast({
                        title: t('edit-no-change-title'),
                        description: t('edit-no-change-desc'),
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }

                const promise = editMutation.mutateAsync(vars);
                loadUntilResolve(promise);

                const [err, data] = await to(promise);

                actions.setSubmitting(false);

                if (err !== null) {
                    // error case
                    showToast({
                        title: t('edit-fail-title'),
                        description: t('edit-fail-desc'),
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                } else if (data !== undefined) {
                    // good case
                    showToast({
                        title: t('edit-success-title'),
                        description: t('edit-success-desc'),
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                    setDidEdit(true);
                    actions.resetForm();

                    const newVals = cloneInitialValues();
                    actions.setValues(newVals);

                    if (location.state?.autoEditNavigate) {
                        history.goBack();
                    }
                }
            } else {
                const promise = createArticle(
                    {
                        ...values,
                        is_private: values.is_private,
                    },
                    auth.token
                );
                loadUntilResolve(promise);

                const [err, data] = await to(promise);

                actions.setSubmitting(false);

                if (err !== null) {
                    // error case
                    showToast({
                        title: t('create-fail-title'),
                        description: t('create-fail-desc'),
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                } else if (data !== undefined) {
                    // good case
                    showToast({
                        title: t('create-success-title'),
                        description: t('create-success-desc'),
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                    actions.resetForm();
                }
            }
        },
        [
            auth.token,
            editArticleInitialData,
            editMutation,
            id,
            isArticleEdit,
            loadUntilResolve,
            showToast,
            t,
            history,
            location,
        ]
    );

    return (
        <Formik
            initialValues={cloneInitialValues() as AddArticleFormValues}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
        >
            {(props) => (
                <Form
                    style={{
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'column',
                    }}
                >
                    <EditHandler
                        props={props}
                        id={id}
                        isArticleEdit={isArticleEdit}
                        didEdit={didEdit}
                        setEditArticleInitialData={setEditArticleInitialData}
                    />
                    <Flex direction={{ sm: 'column', md: 'row' }}>
                        <TitleField name="title" />
                        <AuthorField name="author" />
                    </Flex>
                    <Flex direction={{ sm: 'column', md: 'row' }}>
                        <LanguageField name="language" />
                        <PrivateField name="is_private" />
                    </Flex>
                    <TagField name="tags" />
                    <ContentField name="content" />

                    <Button
                        disabled={
                            props.isSubmitting ||
                            !!props.errors.title ||
                            !!props.errors.author ||
                            !!props.errors.content ||
                            !!props.errors.content ||
                            !!props.errors.language ||
                            !!props.errors.language ||
                            !!props.errors.is_private
                        }
                        w="100%"
                        type="button"
                        variant="type1"
                        onClick={() => {
                            props.submitForm().then(() => {
                                props.validateForm();
                            });
                        }}
                    >
                        {isArticleEdit
                            ? t('edit-article')
                            : t('create-article')}
                    </Button>
                </Form>
            )}
        </Formik>
    );
};

export default AddArticleForm;
