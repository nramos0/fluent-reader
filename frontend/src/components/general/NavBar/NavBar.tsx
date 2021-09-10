import React from 'react';
import { useTranslation } from 'react-i18next';
import NavItem from '../NavItem/NavItem';
import LogoutNavItem from '../LogoutNavItem/LogoutNavItem';
import { useLocation } from 'react-router-dom';

const NavBar: React.FC = () => {
    const location = useLocation();
    const { t } = useTranslation();
    return (
        <>
            <NavItem location="/app/library">{t('library')}</NavItem>
            <NavItem location="/app/read">{t('read')}</NavItem>

            {location.pathname.includes('/app/edit-article') ? (
                <NavItem location="/app/edit-article">
                    {t('edit-article')}
                </NavItem>
            ) : (
                <NavItem location="/app/add-article">
                    {t('add-article')}
                </NavItem>
            )}

            <NavItem location="/app/settings" floatBottom={true}>
                {t('settings')}
            </NavItem>
            <NavItem location="/app/about">{t('about')}</NavItem>
            <LogoutNavItem />
        </>
    );
};

export default NavBar;
