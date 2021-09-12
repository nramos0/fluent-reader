import { useEffect } from 'react';

export const useChangeMonitor = <T>(
    value: T,
    name: string,
    disabled?: boolean
) => {
    useEffect(() => {
        !disabled && console.log(`value ${name} changed: `, value);
    }, [disabled, name, value]);
};
