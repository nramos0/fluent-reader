import React, { useCallback, useState } from 'react';
import { Flex, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useLoadInfo } from '../../general/LoadWrapper/LoadWrapper';
import { useAuth } from '../../general/AuthWrapper/AuthWrapper';
import { getFullSysArticle } from '../../../net/requests/getFullSysArticle';
import { getFullUserArticle } from '../../../net/requests/getFullUserArticle';
import to from 'await-to-js';
import { useHistory } from 'react-router-dom';
import { useStore } from '../../../hooks/useStore';
import { observer } from 'mobx-react';

interface Props {
    article: SimpleArticle;
}

const ArticleControls: React.FC<Props> = ({ article }) => {
    const { t } = useTranslation('library');
    const [isLoading, setIsLoading] = useState(false);

    const loadInfo = useLoadInfo();
    const history = useHistory();
    const store = useStore();

    const { token } = useAuth();
    const onClick = useCallback(async () => {
        setIsLoading(true);

        const promise = article.is_system
            ? getFullSysArticle({ id: article.id }, token)
            : getFullUserArticle({ id: article.id }, token);

        loadInfo.loadUntilResolve(promise);

        const [err, data] = await to(promise);

        setIsLoading(false);

        if (err !== null || data === undefined) {
            return;
        }

        store.readArticle = data.data.article;
        history.push('/app/read');
    }, [article.id, article.is_system, history, loadInfo, store, token]);

    return (
        <Flex direction="row" p="3px 0px" justify="flex-start">
            <Button
                className="article-open-btn"
                bgColor="#661919"
                color="white"
                border="2px solid white"
                _hover={{
                    bgColor: 'white',
                    color: '#661919',
                }}
                _active={{
                    borderColor: '#ccc',
                    bgColor: '#ccc',
                }}
                onClick={onClick}
                disabled={isLoading}
            >
                {t('open')}
            </Button>
        </Flex>
    );
};

export default observer(ArticleControls);
