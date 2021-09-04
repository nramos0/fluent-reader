import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './i18n';
import 'focus-visible/dist/focus-visible';
import App from './main/App';
import reportWebVitals from './reportWebVitals';
import Providers from './Providers';

ReactDOM.render(
    <StrictMode>
        <Providers>
            <App />
        </Providers>
    </StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
