import React from 'react';
import {
    FormControl,
    FormLabel,
    Textarea,
    FormHelperText,
    FormErrorMessage,
} from '@chakra-ui/react';
import { useField, FieldHookConfig } from 'formik';
import { useTranslation } from 'react-i18next';

const ContentField = (props: FieldHookConfig<string>) => {
    const [field, meta] = useField(props);
    const { t } = useTranslation('add-article');
    return (
        <FormControl
            mb={3}
            flex={1}
            isInvalid={meta.error !== undefined && meta.touched}
        >
            <FormLabel htmlFor="article-content">{t('content')}</FormLabel>

            <Textarea
                {...field}
                resize="vertical"
                type="text"
                id="article-content"
            />
            <FormHelperText textAlign="left">
                {t('content-info')}
            </FormHelperText>
            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

export default ContentField;
