import React from 'react';
import { useTranslation } from 'react-i18next';
import NavItem from '../NavItem/NavItem';
import LogoutNavItem from '../LogoutNavItem/LogoutNavItem';

const NavBar: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            <NavItem location="/app/library">{t('library')}</NavItem>
            <NavItem location="/app/read">{t('read')}</NavItem>
            <NavItem location="/app/add-article">{t('add-article')}</NavItem>
            {/* <NavItem location="/app/settings" floatBottom={true}>
                {t('settings')}
            </NavItem> */}
            <LogoutNavItem />
        </>
    );
};

export default NavBar;
