import React, { useState, useCallback } from 'react';
import {
    FormControl,
    FormLabel,
    Input,
    FormHelperText,
    FormErrorMessage,
    Text,
    Flex,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useField, FieldHookConfig } from 'formik';
import { useTranslation } from 'react-i18next';
import { useOnKeyUp } from '../../../hooks/useOnKeyUp';

const TagField = (props: FieldHookConfig<string[]>) => {
    const [field, meta, helpers] = useField(props);
    const tags = field.value;

    const { t } = useTranslation('add-article');

    const [currentTagInput, setCurrentTagInput] = useState('');
    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentTagInput(e.target.value);
    }, []);

    const [tagMap, setTagMap] = useState<Dictionary<null>>({});
    const removeTag = useCallback(
        (index: number) => {
            const newTags = tags.slice();
            const deletedElementArr = newTags.splice(index, 1);
            helpers.setValue(newTags);

            const newTagMap = {
                ...tagMap,
            };

            delete newTagMap[deletedElementArr[0]];

            setTagMap(newTagMap);
        },
        [helpers, tagMap, tags]
    );

    const onTagAdd = useCallback(() => {
        if (tags.length >= 8) {
            helpers.setError([t('reached-tag-limit')]);
        } else {
            if (currentTagInput.length > 0) {
                if (tagMap[currentTagInput] !== undefined) {
                    helpers.setError([t('tag-exists')]);
                } else {
                    helpers.setError([]);

                    const newTags = tags.slice();

                    newTags.push(currentTagInput);
                    helpers.setValue(newTags);

                    tagMap[currentTagInput] = null;

                    setCurrentTagInput('');
                }
            } else {
                helpers.setError([t('empty-tag')]);
            }
        }
    }, [currentTagInput, helpers, t, tagMap, tags]);

    const onKeyUp = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                onTagAdd();
            }
        },
        [onTagAdd]
    );

    useOnKeyUp(onKeyUp);

    return (
        <FormControl mb={3} isInvalid={meta.error !== undefined}>
            <FormLabel htmlFor="article-tags">{t('tag')}</FormLabel>
            {tags.length === 0 ? (
                <Text align="left" mb={2} fontSize="sm">
                    {t('no-tags')}
                </Text>
            ) : (
                <Flex direction="row" wrap="wrap" mb={2}>
                    {tags.map((tag, index) => (
                        <Text
                            bgColor="#661919"
                            color="white"
                            p={1}
                            mr={1}
                            mb={1}
                            fontSize="sm"
                            borderRadius="lg"
                            key={index}
                            userSelect="none"
                            onDoubleClick={() => removeTag(index)}
                        >
                            {tag}
                        </Text>
                    ))}
                </Flex>
            )}
            <Flex direction="row" align="center">
                <Input
                    {...field}
                    value={currentTagInput}
                    onChange={onChange}
                    type="text"
                    id="article-tags"
                    mr={3}
                />
                <AddIcon w={5} h={5} onClick={onTagAdd} />
            </Flex>
            <FormHelperText textAlign="left">{t('tag-info')}</FormHelperText>
            <FormErrorMessage>{meta.error}</FormErrorMessage>
        </FormControl>
    );
};

export default TagField;
