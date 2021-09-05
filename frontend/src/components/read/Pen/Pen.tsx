import React from 'react';
import { Box, Text, Flex, Switch, IconButton } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { useReaderStore } from '../Reader/Reader';
import { DeleteIcon } from '@chakra-ui/icons';

const line = (
    <Box width="100%" height="1px" bgColor="#d16161" borderRadius="5px" />
);

const PEN_BOX_SIZE = '20px';

const PenBox: React.FC<{ color: MarkColor; mr?: number }> = observer(
    ({ color, mr = 1 }) => {
        const readerStore = useReaderStore();

        return (
            <Box
                boxSize={PEN_BOX_SIZE}
                bgColor={color}
                borderRadius="5px"
                mr={mr}
                id={`pen-color-${color}`}
                _hover={{
                    cursor: 'pointer',
                }}
                onClick={() => {
                    readerStore.setPenColor(color, true);
                }}
            />
        );
    }
);

const colors1: MarkColor[] = ['red', 'orange', 'yellow', 'green'];
const colors2: MarkColor[] = ['blue', 'purple', 'gray', 'black'];

const Pen: React.FC = () => {
    const { t } = useTranslation('reader');
    const readerStore = useReaderStore();

    return (
        <>
            <Flex direction="row" align="center" pt={2} pb={2}>
                <Flex direction="column" mr={2} align="center">
                    <Text as="span" fontWeight="bold" fontSize="20px">
                        {t('pen')}
                    </Text>
                    <Switch
                        isChecked={readerStore.penState !== 'disabled'}
                        onChange={() => {
                            readerStore.togglePenEnabled();
                        }}
                    />
                </Flex>
                <Flex direction="row" align="center">
                    <Flex direction="column" mr={2}>
                        <Flex direction="row" align="center" mb={1}>
                            {colors1.map((color) => (
                                <PenBox key={color} color={color} />
                            ))}
                        </Flex>
                        <Flex direction="row" align="center">
                            {colors2.map((color) => (
                                <PenBox key={color} color={color} />
                            ))}
                        </Flex>
                    </Flex>
                    <Flex direction="column">
                        <IconButton
                            aria-label="Delete marks"
                            onClick={() => {
                                readerStore.setPenDelete();
                            }}
                            variant="outline"
                            border="1px solid transparent"
                            borderColor={
                                readerStore.penState === 'delete'
                                    ? 'c1'
                                    : 'transparent'
                            }
                            icon={<DeleteIcon boxSize={6} />}
                        />
                    </Flex>
                </Flex>
            </Flex>
            <Box
                height="4px"
                width="100%"
                bgColor={
                    readerStore.penState !== 'delete'
                        ? readerStore.penColor
                        : 'transparent'
                }
                borderRadius="15px"
                mb={2}
            />
            {line}
        </>
    );
};

export default observer(Pen);
