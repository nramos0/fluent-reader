import {
    Flex,
    Text,
    NumberInput,
    NumberInputField,
    NumberIncrementStepper,
    NumberDecrementStepper,
    NumberInputStepper,
} from '@chakra-ui/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    currPageIndex: number;
    setCurrPageIndex: React.Dispatch<React.SetStateAction<number>>;
    pages: string[][];
}

const PageStepper: React.FC<Props> = ({
    currPageIndex,
    setCurrPageIndex,
    pages,
}) => {
    const { t } = useTranslation();

    return (
        <Flex align="center" direction="row" height="5%" p="5px">
            <Text as="span" mr={1}>
                {t('page')}
            </Text>
            <NumberInput
                value={currPageIndex + 1}
                onChange={(newPageIndex) => {
                    const intIndex = parseInt(newPageIndex, 10);
                    if (intIndex > 0 && intIndex <= pages.length) {
                        setCurrPageIndex(intIndex - 1);
                    }
                }}
                min={1}
                max={pages.length}
                size="xs"
                w="50px"
            >
                <NumberInputField />
                <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                </NumberInputStepper>
            </NumberInput>

            <Text ml={1}> / {pages.length}</Text>
        </Flex>
    );
};

export default PageStepper;
