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

const UsernameField = (
    props: { hasInfo: boolean } & FieldHookConfig<string>
) => {
    const [field, meta] = useField(props);
    const { t } = useTranslation('account');
    return (
        <FormControl
            id="username"
            mr={5}
            mb={3}
            isInvalid={meta.error !== undefined && meta.touched}
        >
            <FormLabel htmlFor="username">{t('username')}</FormLabel>
            <Input {...field} type="text" id="username" />
            {props.hasInfo ? (
                <FormHelperText textAlign="left">
                    {t('username-info')}
                </FormHelperText>
            ) : null}
            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

export default UsernameField;
