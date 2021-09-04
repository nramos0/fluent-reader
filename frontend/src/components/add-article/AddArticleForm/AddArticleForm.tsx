import React, { useCallback, useMemo } from 'react';
import { Flex, Button, useToast } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
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

interface AddArticleFormValues {
    title: string;
    author: string;
    content: string;
    language: string;
    tags: string[];
    isPrivate: boolean;
}

const AddArticleFormInitialValues: AddArticleFormValues = {
    title: '',
    author: '',
    content: '',
    language: 'default',
    tags: [],
    isPrivate: false,
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
            isPrivate: Yup.bool(),
        });
    }, [t]);

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

            const promise = createArticle(
                {
                    ...values,
                    is_private: values.isPrivate,
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
        },
        [auth.token, loadUntilResolve, showToast, t]
    );

    return (
        <Formik
            initialValues={AddArticleFormInitialValues}
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
                    <Flex direction={{ sm: 'column', md: 'row' }}>
                        <TitleField name="title" />
                        <AuthorField name="author" />
                    </Flex>
                    <Flex direction={{ sm: 'column', md: 'row' }}>
                        <LanguageField name="language" />
                        <PrivateField name="isPrivate" />
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
                            !!props.errors.isPrivate
                        }
                        bgColor="#661919"
                        color="white"
                        w="100%"
                        type="button"
                        border="2px solid #661919"
                        onClick={() => {
                            props.submitForm().then(() => {
                                props.validateForm();
                            });
                        }}
                        _hover={{
                            bgColor: 'white',
                            color: '#661919',
                        }}
                        _active={{
                            borderColor: '#ccc',
                            bgColor: '#ccc',
                        }}
                    >
                        {t('create-article')}
                    </Button>
                </Form>
            )}
        </Formik>
    );
};

export default AddArticleForm;
