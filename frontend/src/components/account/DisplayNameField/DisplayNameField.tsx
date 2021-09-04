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

const DisplayNameField = (
    props: { hasInfo: boolean } & FieldHookConfig<string>
) => {
    const [field, meta] = useField(props);
    const { t } = useTranslation('account');
    return (
        <FormControl
            id="displayName"
            mb={3}
            isInvalid={meta.error !== undefined && meta.touched}
        >
            <FormLabel htmlFor="displayName">{t('display-name')}</FormLabel>
            <Input {...field} type="text" id="displayName" />
            {props.hasInfo ? (
                <FormHelperText textAlign="left">
                    {t('display-name-info')}
                </FormHelperText>
            ) : null}
            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

export default DisplayNameField;
