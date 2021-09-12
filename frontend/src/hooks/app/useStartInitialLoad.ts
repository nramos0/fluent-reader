import { useEffect } from 'react';
import { InitialLoadData } from '../../main/App';

export const useStartInitialLoad = (
    initialLoad: () => Promise<void>,
    setInitialLoadData: React.Dispatch<React.SetStateAction<InitialLoadData>>
) => {
    useEffect(() => {
        setInitialLoadData((prevData) => {
            return {
                ...prevData,
                promiseList: [...prevData.promiseList, initialLoad()],
                startInitialLoad: true,
            };
        });
    }, [initialLoad, setInitialLoadData]);
};
