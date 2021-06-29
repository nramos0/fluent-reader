import React from 'react';
import { Flex, Button } from '@chakra-ui/react';

interface Props {
    currPage: number;
    setCurrPage: React.Dispatch<React.SetStateAction<number>>;
    pageCountM1: number;
}

const PageFooter: React.FC<Props> = ({
    currPage,
    setCurrPage,
    pageCountM1,
}) => {
    return (
        <Flex height="10%" direction="row" p="10px">
            <Button
                flex={1}
                mr="5px"
                onClick={() => {
                    if (currPage > 0) {
                        setCurrPage((prev) => prev - 1);
                    }
                }}
                disabled={currPage <= 0}
            >
                Prev
            </Button>

            <Button
                flex={1}
                mr="5px"
                onClick={() => {
                    if (currPage < pageCountM1) {
                        setCurrPage((prev) => prev + 1);
                    }
                }}
                disabled={currPage >= pageCountM1}
            >
                Next
            </Button>
        </Flex>
    );
};

export default PageFooter;
