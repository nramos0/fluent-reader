import React, { useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useLoadInfo } from '../LoadWrapper/LoadWrapper';

const Logout: React.FC = () => {
    const { t } = useTranslation();
    const showToast = useToast();
    const history = useHistory();
    const { loadUntilResolve } = useLoadInfo();

    useEffect(() => {
        const logout = async () => {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            history.push('/account');
            showToast({
                title: t('logout-success'),
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        };
        loadUntilResolve(logout());
    }, [history, loadUntilResolve, showToast, t]);

    return null;
};

export default Logout;
