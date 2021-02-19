import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, { initPromise } from '../../../i18n';
import { Center, Spinner, Flex, Heading } from '@chakra-ui/react';

const getInitialLoadingState = () => {
    return !i18n.isInitialized;
};

export type LoadUntilResolve = <T extends unknown>(promise: Promise<T>) => void;

interface LoadInfo {
    loadUntilResolve: LoadUntilResolve;
    isLoading: boolean;
}

export const LoadContext = React.createContext<LoadInfo>(undefined!);

const LoadWrapper: React.FC = (props) => {
    const { ready } = useTranslation();
    const [isInitialLoad, setIsInitialLoad] = useState(getInitialLoadingState);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            const promiseList = [initPromise];
            await Promise.all(promiseList);
            setIsInitialLoad(false);
        };
        if (isInitialLoad) {
            load();
        }
    }, [isInitialLoad]);

    const loadUntilResolve: LoadUntilResolve = useCallback((promise) => {
        setIsLoading(true);
        promise.then(() => {
            setIsLoading(false);
        });
    }, []);

    if (isInitialLoad || !ready) {
        return (
            <Center h="inherit" display="flex" flexDir="column">
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
