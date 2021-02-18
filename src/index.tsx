import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { ChakraProvider } from '@chakra-ui/react';
import './index.css';
import './i18n';
import App from './main/App';
import LoadWrapper from './components/general/LoadWrapper/LoadWrapper';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
    <StrictMode>
        <ChakraProvider>
            <LoadWrapper>
                <App />
            </LoadWrapper>
        </ChakraProvider>
    </StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
