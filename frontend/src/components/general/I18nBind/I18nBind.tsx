import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { useStore } from '../../../hooks/useStore';

const I18nBind: React.FC = () => {
    const store = useStore();
    const { i18n } = useTranslation();

    useEffect(() => {
        if (!i18n) {
            return;
        }
        store.setI18n(i18n);
    }, [i18n, store]);

    return null;
};

export default observer(I18nBind);
