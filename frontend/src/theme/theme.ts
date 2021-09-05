import { extendTheme, ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import Button from './Button';

const config: ThemeConfig = {
    initialColorMode: 'light',
    useSystemColorMode: false,
};

const theme = extendTheme({
    config,
    components: {
        Button: Button,
    },
    colors: {},
    styles: {
        global: (props) => ({
            'html, body': {
                color: mode('#0F0740', '#ffffff')(props),
                bg: mode('#ffffff', '#282828')(props),
            },
            '.copyright-text': {
                fontSize: '9px',
                fill: mode('#666', '#fff')(props),
                fontFamily: 'Lato',
                fontWeight: '500',
            },
            // https://medium.com/@keeganfamouss/accessibility-on-demand-with-chakra-ui-and-focus-visible-19413b1bc6f9
            '.js-focus-visible :focus:not([data-focus-visible-added])': {
                outline: 'none',
                boxShadow: 'none',
            },
        }),
    },
});

export default theme;
