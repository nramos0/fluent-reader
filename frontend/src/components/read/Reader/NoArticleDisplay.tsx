import { Button, Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

const NoArticleDisplay: React.FC = () => {
    const { t } = useTranslation('reader');
    const history = useHistory();

    return (
        <Flex
            direction="column"
            justifyContent="center"
            alignItems="center"
            backgroundColor="#fff"
            borderRadius="lg"
            margin="0 auto"
            color="#222"
            w="80%"
            p="100px 0px"
            fontSize="20px"
            fontWeight="bold"
        >
            <Text mb={3} color="c1">
                {t('no-article-open')}
            </Text>
            <Button
                size="lg"
                variant="type1"
                onClick={() => {
                    history.push('/app/library');
                }}
            >
                {t('common:library')}
            </Button>
        </Flex>
    );
};

export default NoArticleDisplay;
