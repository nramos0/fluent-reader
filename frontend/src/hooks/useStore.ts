import { useContext } from 'react';
import StoreContext from '../store';

export const useStore = () => {
    return useContext(StoreContext);
};
