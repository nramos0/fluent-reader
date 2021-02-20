import React, { useCallback } from 'react';
import {
    FormControl,
    FormLabel,
    Select,
    FormErrorMessage,
} from '@chakra-ui/react';
import { useField, useFormikContext, FieldHookConfig } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLoadInfo } from '../../general/LoadWrapper/LoadWrapper';

const DisplayLangField = (props: FieldHookConfig<string>) => {
    const { validateForm, values } = useFormikContext();
    const [field, meta] = useField(props);
    const { t, i18n } = useTranslation('account');
    const { loadUntilResolve } = useLoadInfo();

    const onChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            const langChangePromise = i18n
                .changeLanguage(event.currentTarget.value)
                .then(() => {
                    // any existing form errors won't have their language updated
                    // unless we revalidate the form after changing the language
                    validateForm(values);
                });

            loadUntilResolve(langChangePromise);
            field.onChange(event);
        },
        [field, i18n, loadUntilResolve, validateForm, values]
    );

    return (
        <FormControl
            id="displayLang"
            mb={3}
            isInvalid={meta.error !== undefined && meta.touched}
        >
            <FormLabel>{t('display-lang')}</FormLabel>
            <Select defaultValue="default" {...field} onChange={onChange}>
                <option value="default" disabled={true}>
                    {t('display-lang-info')}
                </option>
                <option value="zh-CN">{t('common:zh-CN')}</option>
                <option value="en">{t('common:en')}</option>
            </Select>
            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

export default DisplayLangField;
