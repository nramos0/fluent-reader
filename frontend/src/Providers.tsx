import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import './index.css';
import './i18n';
import 'focus-visible/dist/focus-visible';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './components/general/AuthWrapper/AuthWrapper';
import { QueryClientProvider } from 'react-query';
import { queryClient } from './net/queryClient';
import StoreWrapper from './StoreWrapper';

// https://medium.com/@keeganfamouss/accessibility-on-demand-with-chakra-ui-and-focus-visible-19413b1bc6f9
const theme = extendTheme({
    styles: {
        global: {
            '.js-focus-visible :focus:not([data-focus-visible-added])': {
                outline: 'none',
                boxShadow: 'none',
            },
        },
    },
    config: {
        initialColorMode: 'light',
    },
});

const Providers: React.FC = (props) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={theme}>
                <StoreWrapper>
                    <AuthProvider>
                        <BrowserRouter>{props.children}</BrowserRouter>
                    </AuthProvider>
                </StoreWrapper>
            </ChakraProvider>
        </QueryClientProvider>
    );
};

export default Providers;
