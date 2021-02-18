import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, { initPromise } from '../../../i18n';
import { Center, Spinner } from '@chakra-ui/react';

const getInitialLoadingState = () => {
    return !i18n.isInitialized;
};

const LoadWrapper: React.FC = (props) => {
    const { ready } = useTranslation();
    const [isLoading, setIsLoading] = useState(getInitialLoadingState);

    useEffect(() => {
        const load = async () => {
            const promiseList = [initPromise];
            await Promise.all(promiseList);
            setIsLoading(false);
        };
        if (isLoading) {
            load();
        }
    }, [isLoading]);

    if (isLoading || !ready) {
        return (
            <Center h="inherit">
                <Spinner color="white" size="xl" thickness="5px" />
            </Center>
        );
    }

    return <>{props.children}</>;
};

export default LoadWrapper;
