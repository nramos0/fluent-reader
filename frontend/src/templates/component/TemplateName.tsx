import React from 'react';
import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface Props {}

const TemplateName: React.FC<Props> = (_props) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { t } = useTranslation();
    // prettier-ignore
    return (
        <Box>

        </Box>
    );
};

export default TemplateName;
