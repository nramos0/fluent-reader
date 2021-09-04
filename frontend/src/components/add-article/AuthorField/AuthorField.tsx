import React from 'react';
import {
    FormControl,
    FormLabel,
    Input,
    FormHelperText,
    FormErrorMessage,
} from '@chakra-ui/react';
import { useField, FieldHookConfig } from 'formik';
import { useTranslation } from 'react-i18next';

const AuthorField = (props: FieldHookConfig<string>) => {
    const [field, meta] = useField(props);
    const { t } = useTranslation('add-article');
    return (
        <FormControl
            mb={3}
            mr={{ sm: 0, md: 3 }}
            isInvalid={meta.error !== undefined && meta.touched}
        >
            <FormLabel htmlFor="article-author">{t('author')}</FormLabel>
            <Input {...field} type="text" id="article-author" />
            <FormHelperText textAlign="left">{t('author-info')}</FormHelperText>
            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

export default AuthorField;
