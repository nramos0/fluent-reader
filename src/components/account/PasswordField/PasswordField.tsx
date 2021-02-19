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

const PasswordField = (
    props: { hasInfo: boolean } & FieldHookConfig<string>
) => {
    const [field, meta] = useField(props);
    const { t } = useTranslation('account');
    return (
        <FormControl
            mr={5}
            mb={5}
            isInvalid={meta.error !== undefined && meta.touched}
        >
            <FormLabel htmlFor="password">{t('password')}</FormLabel>
            <Input {...field} type="password" id="password" />
            {props.hasInfo ? (
                <FormHelperText textAlign="left">
                    {t('password-info')}
                </FormHelperText>
            ) : null}

            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

export default PasswordField;
