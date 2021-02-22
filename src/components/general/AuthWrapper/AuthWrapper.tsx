import React, { useContext, useState, useCallback } from 'react';

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

const AuthWrapper: React.FC<{}> = (props) => {
    const [token, setToken] = useState(() => {
        return localStorage.getItem('token');
    });

    const setTokenWithLS = useCallback((token: string) => {
        console.log('setting token: ', token);
        setToken(token);
        localStorage.setItem('token', token);
    }, []);

    const [refreshToken, setRefreshToken] = useState(() => {
        return localStorage.getItem('refreshToken');
    });

    const setRefreshTokenWithLS = useCallback((refreshToken: string) => {
        setRefreshToken(refreshToken);
        localStorage.setItem('refreshToken', refreshToken);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                token: token === null ? '' : token,
                setToken: setTokenWithLS,
                refreshToken: refreshToken === null ? '' : refreshToken,
                setRefreshToken: setRefreshTokenWithLS,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthWrapper;
