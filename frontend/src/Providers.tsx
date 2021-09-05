import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import './index.css';
import './i18n';
import 'focus-visible/dist/focus-visible';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './components/general/AuthWrapper/AuthWrapper';
import { QueryClientProvider } from 'react-query';
import { queryClient } from './net/queryClient';
import StoreWrapper from './StoreWrapper';
import theme from './theme/theme';

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
