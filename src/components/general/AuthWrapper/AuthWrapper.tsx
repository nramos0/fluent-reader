import React, { useContext, useState, useCallback, useEffect } from 'react';
import { useStore } from '../../../hooks/useStore';
import { observer } from 'mobx-react';

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
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthWrapper;
