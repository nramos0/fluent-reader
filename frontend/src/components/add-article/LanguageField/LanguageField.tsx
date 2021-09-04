import React from 'react';
import {
    FormControl,
    FormLabel,
    Select,
    FormHelperText,
    FormErrorMessage,
} from '@chakra-ui/react';
import { useField, FieldHookConfig } from 'formik';
import { useTranslation } from 'react-i18next';

const LanguageField = (props: FieldHookConfig<string>) => {
    const [field, meta] = useField(props);
    const { t } = useTranslation('add-article');
    return (
        <FormControl
            mb={3}
            mr={{ sm: 0, md: 3 }}
            isInvalid={meta.error !== undefined && meta.touched}
        >
            <FormLabel htmlFor="article-language">{t('language')}</FormLabel>
            <Select {...field} id="article-language">
                <option value="default" disabled={true}>
                    {t('language-default')}
                </option>
                <option value="en">{t('common:en')}</option>
                <option value="zh">{t('common:zh')}</option>
            </Select>
            <FormHelperText textAlign="left">
                {t('language-info')}
            </FormHelperText>
            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

export default LanguageField;
