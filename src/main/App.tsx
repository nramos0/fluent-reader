import { useTranslation } from 'react-i18next';
import { Button } from '@chakra-ui/react';
import logo from './logo.svg';
import './App.css';

function App() {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === 'en';
    return (
        <div className="App">
            <header className="App-header">
                <h1>{t('welcome')}</h1>
                <img src={logo} className="App-logo" alt="logo" />
                <p>{t('how-are-you')}</p>
                <br />
                <Button
                    fontSize={{ lg: 25 }}
                    bgColor="whiteAlpha.200"
                    _hover={{
                        backgroundColor: 'whiteAlpha.400',
                    }}
                    _active={{
                        backgroundColor: 'whiteAlpha.600',
                    }}
                    onClick={() => {
                        if (isEnglish) {
                            i18n.changeLanguage('zh-CN');
                        } else {
                            i18n.changeLanguage('en');
                        }
                    }}
                >
                    {isEnglish ? '中文' : 'English'}
                </Button>
                <br />
                <img
                    className="cat"
                    src={process.env.PUBLIC_URL + '/assets/cat.jpg'}
                    alt="cat"
                />
            </header>
        </div>
    );
}

export default App;
