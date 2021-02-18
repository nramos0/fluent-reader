import React, { useCallback } from 'react';
import {
    Flex,
    Button,
    Heading,
    FormControl,
    FormLabel,
    Select,
    Input,
    FormHelperText,
    FormErrorMessage,
} from '@chakra-ui/react';
import {
    Form,
    withFormik,
    useField,
    FormikProps,
    FieldHookConfig,
} from 'formik';
import { useTranslation } from 'react-i18next';

interface Props {}

const UsernameField = (props: FieldHookConfig<string>) => {
    const [field, meta] = useField(props);
    const { t } = useTranslation('account');
    return (
        <FormControl
            id="username"
            mb={5}
            isInvalid={meta.error !== undefined && meta.touched}
        >
            <FormLabel htmlFor="username">{t('username')}</FormLabel>
            <Input {...field} type="text" id="username" />
            <FormHelperText textAlign="left">
                {t('username-info')}
            </FormHelperText>
            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

const PasswordField = (props: FieldHookConfig<string>) => {
    const [field, meta] = useField(props);
    const { t } = useTranslation('account');
    return (
        <FormControl
            mr={5}
            isInvalid={meta.error !== undefined && meta.touched}
        >
            <FormLabel htmlFor="password">{t('password')}</FormLabel>
            <Input {...field} type="password" id="password" />
            <FormHelperText textAlign="left">
                {t('password-info')}
            </FormHelperText>
            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

const PasswordConfirmField = (props: FieldHookConfig<string>) => {
    const [field, meta] = useField(props);
    const { t } = useTranslation('account');
    return (
        <FormControl isInvalid={meta.error !== undefined && meta.touched}>
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

const DisplayLangField = (props: FieldHookConfig<string>) => {
    const [field] = useField(props);
    const { t, i18n } = useTranslation('account');

    const onChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            i18n.changeLanguage(event.currentTarget.value);
            field.onChange(event);
        },
        [field, i18n]
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

interface CreateAccountFormValues {
    username?: string;
    password?: string;
    passwordConfirm?: string;
    studyLang?: string;
    displayLang?: string;
}

type CreateAccountFormProps = CreateAccountFormValues;

const InnerForm = (props: FormikProps<CreateAccountFormValues>) => {
    const { t } = useTranslation('account');
    const { isSubmitting } = props;
    return (
        <Form>
            <Heading fontSize="2xl" mb="5">
                {t('create-an-account')}
            </Heading>

            <UsernameField name="username" />

            <Flex direction="row" width="100%" mb={5}>
                <PasswordField name="password" />
                <PasswordConfirmField name="passwordConfirm" />
            </Flex>

            <StudyLangField name="studyLang" />
            <DisplayLangField name="displayLang" />

            <Button disabled={isSubmitting} w="100%" type="submit">
                {t('create-account')}
            </Button>
        </Form>
    );
};

const CreateAccountForm = withFormik<
    CreateAccountFormProps,
    CreateAccountFormValues
>({
    handleSubmit: (values, actions) => {
        console.log(values);
        actions.setSubmitting(false);
    },
    mapPropsToValues: (props) => {
        return props;
    },
})(InnerForm);

const CreateAccountPage: React.FC<Props> = () => {
    const { t } = useTranslation('account');
    const initialValues: CreateAccountFormValues = {
        username: '',
        password: '',
        passwordConfirm: '',
        studyLang: undefined,
        displayLang: undefined,
    };

    return (
        <Flex
            direction="column"
            justify="center"
            align="center"
            p={{ base: 2, md: 5, lg: 10 }}
            h="100vh"
        >
            <Heading color="white" mb="5" fontSize="4xl">
                {t('app-heading')}
            </Heading>
            <Flex
                direction="column"
                bgColor="white"
                p={5}
                borderRadius="lg"
                w={{ base: '100%', md: '85%', lg: '50%' }}
            >
                <CreateAccountForm {...initialValues} />
            </Flex>
        </Flex>
    );
};

export default CreateAccountPage;
