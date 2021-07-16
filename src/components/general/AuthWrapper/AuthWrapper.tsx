import React, { useContext, useState, useCallback, useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { useGetWordData } from '../../../net/requests/getWordData';
import { observer } from 'mobx-react';
import { runInAction } from 'mobx';

export interface AuthInfo {
    token: string;
    setToken: (token: string) => void;
    refreshToken: string;
    setRefreshToken: (refreshToken: string) => void;
}

const AuthContext = React.createContext<AuthInfo>(undefined!);

export const useAuth = () => {
    return useContext(AuthContext);
};

// binds the auth store token to the store
const TokenBind: React.FC<{}> = observer(() => {
    const store = useStore();
    const auth = useAuth();

    useEffect(() => {
        store.token = auth.token;
    }, [auth.token, store]);

    return null;
});

const WordDataBind: React.FC<{}> = observer(() => {
    const store = useStore();
    const wordData = useGetWordData();

    useEffect(() => {
        if (wordData !== null) {
            runInAction(() => {
                store.wordData = wordData;
            });
        }
    }, [store, wordData]);

    return null;
});

const AuthWrapper: React.FC<{}> = (props) => {
    const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || '';
    });

    const setTokenWithLS = useCallback((token: string) => {
        setToken(token);
        localStorage.setItem('token', token);
    }, []);

    const [refreshToken, setRefreshToken] = useState(() => {
        return localStorage.getItem('refreshToken') || '';
    });

    const setRefreshTokenWithLS = useCallback((refreshToken: string) => {
        setRefreshToken(refreshToken);
        localStorage.setItem('refreshToken', refreshToken);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                token,
                setToken: setTokenWithLS,
                refreshToken,
                setRefreshToken: setRefreshTokenWithLS,
            }}
        >
            <TokenBind />
            <WordDataBind />
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthWrapper;
