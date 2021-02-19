import React, { useCallback, useContext } from 'react';
import { FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useField, FieldHookConfig } from 'formik';
import { useTranslation } from 'react-i18next';
import { LoadContext } from '../../general/LoadWrapper/LoadWrapper';

const DisplayLangField = (props: FieldHookConfig<string>) => {
    const [field] = useField(props);
    const { t, i18n } = useTranslation('account');
    const loadUntilResolve = useContext(LoadContext);

    const onChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            const langChangePromise = i18n.changeLanguage(
                event.currentTarget.value
            );
            loadUntilResolve(langChangePromise);
            field.onChange(event);
        },
        [field, i18n, loadUntilResolve]
    );

    return (
        <FormControl id="displayLang" mb={5}>
            <FormLabel>{t('display-lang')}</FormLabel>
            <Select defaultValue="default" {...field} onChange={onChange}>
                <option value="default" disabled={true}>
                    {t('display-lang-info')}
                </option>
                <option value="zh-CN">{t('common:zh-CN')}</option>
                <option value="en">{t('common:en')}</option>
            </Select>
        </FormControl>
    );
};

export default DisplayLangField;
