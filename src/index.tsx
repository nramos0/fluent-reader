import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { ChakraProvider, Box, extendTheme } from '@chakra-ui/react';
import './index.css';
import './i18n';
import 'focus-visible/dist/focus-visible';
import App from './main/App';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './components/general/AuthWrapper/AuthWrapper';
import { QueryClientProvider } from 'react-query';
import { queryClient } from './net/queryClient';
import reportWebVitals from './reportWebVitals';

// https://medium.com/@keeganfamouss/accessibility-on-demand-with-chakra-ui-and-focus-visible-19413b1bc6f9
const theme = extendTheme({
    styles: {
        global: {
            '.js-focus-visible :focus:not([data-focus-visible-added])': {
                outline: 'none',
                'box-shadow': 'none',
            },
        },
    },
});

ReactDOM.render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ChakraProvider theme={theme}>
                <AuthProvider>
                    <Box
                        w="100vw"
                        h="100vh"
                        bgGradient="linear(to-b, #c16161, #c70505, #b82e2e, #902323, #661919)"
                    >
                        <BrowserRouter>
                            <App />
                        </BrowserRouter>
                    </Box>
                </AuthProvider>
            </ChakraProvider>
        </QueryClientProvider>
    </StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
