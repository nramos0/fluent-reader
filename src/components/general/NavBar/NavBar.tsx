import React from 'react';
import { useTranslation } from 'react-i18next';
import NavItem from '../NavItem/NavItem';

const NavBar: React.FC = () => {
    const { t } = useTranslation();
    return (
        <>
            <NavItem location="/app/library">{t('library')}</NavItem>
            <NavItem location="/app/read">{t('read')}</NavItem>
            <NavItem location="/app/add-article">{t('add-article')}</NavItem>
            <NavItem location="/app/settings">{t('settings')}</NavItem>
            <NavItem location="/logout" floatBottom={true}>
                {t('logout')}
            </NavItem>
        </>
    );
};

export default NavBar;
