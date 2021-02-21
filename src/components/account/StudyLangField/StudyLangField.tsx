import React from 'react';
import {
    FormControl,
    FormLabel,
    Select,
    FormErrorMessage,
} from '@chakra-ui/react';
import { useField, FieldHookConfig } from 'formik';
import { useTranslation } from 'react-i18next';

const StudyLangField = (props: FieldHookConfig<string>) => {
    const [field, meta] = useField(props);
    const { t } = useTranslation('account');
    return (
        <FormControl
            id="studyLang"
            mb={3}
            isInvalid={meta.error !== undefined && meta.touched}
        >
            <FormLabel>{t('study-lang')}</FormLabel>
            <Select {...field}>
                <option value="default" disabled={true}>
                    {t('study-lang-info')}
                </option>
                <option value="en">{t('common:en')}</option>
                <option value="zh-CN">{t('common:zh-CN')}</option>
            </Select>
            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

export default StudyLangField;
