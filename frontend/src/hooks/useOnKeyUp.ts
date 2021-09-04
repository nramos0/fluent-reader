import { useEffect } from 'react';

export function useOnKeyUp(handler: (e: KeyboardEvent) => void) {
    useEffect(() => {
        window.addEventListener('keyup', handler);
        return () => {
            window.removeEventListener('keyup', handler);
        };
    }, [handler]); // Empty array ensures that effect is only run on mount and unmount
}
