import React from 'react';
import { FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useField, FieldHookConfig } from 'formik';
import { useTranslation } from 'react-i18next';

const StudyLangField = (props: FieldHookConfig<string>) => {
    const [field] = useField(props);
    const { t } = useTranslation('account');
    return (
        <FormControl id="studyLang" mb={5}>
            <FormLabel>{t('study-lang')}</FormLabel>
            <Select defaultValue="default" {...field}>
                <option value="default" disabled={true}>
                    {t('study-lang-info')}
                </option>
                <option value="en">{t('common:en')}</option>
                <option value="zh-CN">{t('common:zh-CN')}</option>
            </Select>
        </FormControl>
    );
};

export default StudyLangField;
