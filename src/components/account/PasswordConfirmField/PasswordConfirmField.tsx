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

const PasswordConfirmField = (props: FieldHookConfig<string>) => {
    const [field, meta] = useField(props);
    const { t } = useTranslation('account');
    return (
        <FormControl
            isInvalid={meta.error !== undefined && meta.touched}
            mb={5}
        >
            <FormLabel htmlFor="passwordConfirm">
                {t('password-confirm')}
            </FormLabel>
            <Input {...field} type="password" id="passwordConfirm" />
            <FormHelperText textAlign="left">
                {t('password-confirm-info')}
            </FormHelperText>
            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

export default PasswordConfirmField;
