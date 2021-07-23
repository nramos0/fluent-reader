import React from 'react';
import { Flex, Select, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useLibraryInfo } from '../Library/Library';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';

const LibraryOptions: React.FC<{}> = () => {
    const { t } = useTranslation('library');
    const library = useLibraryInfo();

    return (
        <Flex
            width="100%"
            borderRadius="15px"
            bgColor="white"
            color="#661919"
            direction="row"
            justify="center"
            p="10px 20px"
            mb={3}
        >
            <Flex direction="column" align="center">
                <Text fontWeight="bold" mb={1}>
                    {t('library-select')}
                </Text>
                <Select
                    value={library.libraryType}
                    onChange={(e) => {
                        runInAction(() => {
                            library.libraryType = e.target.value as LibraryType;
                        });
                    }}
                    focusBorderColor="#661919"
                >
                    <option disabled={true}>{t('select-a-library')}</option>
                    <option value="system">{t('system-lib')}</option>
                    <option value="user-saved">{t('user-saved')}</option>
                    <option value="user-created">{t('user-created')}</option>
                    <option value="all-user">{t('all-user')}</option>
                </Select>
            </Flex>
        </Flex>
    );
};

export default observer(LibraryOptions);
