import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import to from 'await-to-js';
import { Center, Spinner, Flex } from '@chakra-ui/react';

type LoadUntilResolve = <T extends unknown>(promise: Promise<T>) => void;

interface LoadInfo {
    loadUntilResolve: LoadUntilResolve;
    setIsLogoLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
}

const LoadContext = React.createContext<LoadInfo>(undefined!);

export const useLoadInfo = () => {
    return useContext(LoadContext);
};

interface Props {
    promiseList: Promise<any>[];
    startInitialLoad: boolean;
}

const LoadWrapper: React.FC<Props> = (props) => {
    const { ready } = useTranslation();
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isLogoLoading, setIsLogoLoading] = useState(true);

    const initialLoad = useCallback(async () => {
        const promiseList = [...props.promiseList];
        await Promise.all(promiseList);
        setIsInitialLoad(false);
    }, [props.promiseList]);

    useEffect(() => {
        if (isInitialLoad && props.startInitialLoad) {
            initialLoad();
        }
    }, [initialLoad, isInitialLoad, props.startInitialLoad]);

    const loadUntilResolve: LoadUntilResolve = useCallback(async (promise) => {
        setIsLoading(true);
        await to(promise);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const { hiddenId, visibleId } = isLogoLoading
            ? { hiddenId: 'outer-root', visibleId: 'loading-screen-root' }
            : { hiddenId: 'loading-screen-root', visibleId: 'outer-root' };
        document.getElementById(visibleId)?.setAttribute('style', '');
        document
            .getElementById(hiddenId)
            ?.setAttribute('style', 'display: none');
    }, [isLogoLoading]);

    if (isInitialLoad || !ready) {
        return null;
    }

    return (
        <LoadContext.Provider
            value={{
                loadUntilResolve: loadUntilResolve,
                setIsLogoLoading: setIsLogoLoading,
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
                    backgroundColor="rgba(10, 10, 10, 0.5)"
                >
                    <Center
                        h={{ base: '100px', md: '150px' }}
                        w={{ base: '100px', md: '150px' }}
                        backgroundColor="#fff"
                        borderRadius="15px"
                        p="10px"
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
