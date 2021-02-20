import React, { useContext } from 'react';

export interface AuthInfo {
    token: string;
    refreshToken: string;
}

const AuthContext = React.createContext<AuthInfo>(undefined!);

export const useAuth = () => {
    return useContext(AuthContext);
};

const AuthWrapper: React.FC<{}> = (props) => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    return (
        <AuthContext.Provider
            value={{
                token: token === null ? '' : token,
                refreshToken: refreshToken === null ? '' : refreshToken,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export default AuthWrapper;
