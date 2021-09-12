import { useEffect } from 'react';

export const useChangeMonitor = <T>(value: T, name: string) => {
    useEffect(() => {
        console.log(`value ${name} changed: `, value);
    }, [name, value]);
};
