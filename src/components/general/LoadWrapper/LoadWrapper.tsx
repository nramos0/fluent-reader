import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import to from 'await-to-js';
import { Center, Spinner, Flex, Heading } from '@chakra-ui/react';

type LoadUntilResolve = <T extends unknown>(promise: Promise<T>) => void;

interface LoadInfo {
    loadUntilResolve: LoadUntilResolve;
    isLoading: boolean;
}

const LoadContext = React.createContext<LoadInfo>(undefined!);

export const useLoadInfo = () => {
    return useContext(LoadContext);
};

interface Props {
    promiseList: Promise<any>[];
}

const LoadWrapper: React.FC<Props> = (props) => {
    const { ready } = useTranslation();
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            const promiseList = [...props.promiseList];
            await Promise.all(promiseList);

            const minimumLoadTime = 300;
            setTimeout(() => {
                setIsInitialLoad(false);
            }, minimumLoadTime);
        };
        if (isInitialLoad) {
            load();
        }
    }, [isInitialLoad, props.promiseList]);

    const loadUntilResolve: LoadUntilResolve = useCallback(async (promise) => {
        setIsLoading(true);
        await to(promise);
        setIsLoading(false);
    }, []);

    if (isInitialLoad || !ready) {
        return (
            <Center h="100vh" display="flex" flexDir="column">
                <Heading mb={10} color="white">
                    Fluent Reader
                </Heading>
                <Spinner color="white" size="xl" thickness="5px" />
            </Center>
        );
    }

    return (
        <LoadContext.Provider
            value={{
                loadUntilResolve: loadUntilResolve,
                isLoading: isLoading,
            }}
        >
            {isLoading ? (
                <Flex
                    pos="absolute"
                    h="100vh"
                    w="100%"
                    zIndex={100}
                    pointerEvents="none"
                    align="center"
                    justify="center"
                >
                    <Center
                        h={{ base: '40%', md: '25%', lg: '15%' }}
                        w={{ base: '40%', md: '25%', lg: '15%' }}
                    >
                        <Spinner
                            color="rgba(50, 50, 50, 0.9)"
                            size="xl"
                            thickness="5px"
                        />
                    </Center>
                </Flex>
            ) : null}
            {props.children}
        </LoadContext.Provider>
    );
};

export default LoadWrapper;
