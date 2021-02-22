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

const PrivateField = (props: FieldHookConfig<boolean>) => {
    const [field, meta, helpers] = useField(props);
    const { t } = useTranslation('add-article');
    return (
        <FormControl
            mb={3}
            isInvalid={meta.error !== undefined && meta.touched}
        >
            <FormLabel htmlFor="article-is-private">
                {t('is-private')}
            </FormLabel>
            <Select
                {...field}
                onChange={(e) => {
                    helpers.setValue(e.target.value === 'private');
                }}
                value={field.value ? 'private' : 'public'}
                id="article-is-private"
            >
                <option value="public">{t('public')}</option>
                <option value="private">{t('private')}</option>
            </Select>
            <FormHelperText textAlign="left">
                {t('is-private-info')}
            </FormHelperText>
            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

export default PrivateField;
