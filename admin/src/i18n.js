import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: "Welcome to our website",
          signIn: "Sign In",
          signUp: "Sign Up"
        }
      },
      vi: {
        translation: {
          welcome: "Chào mừng đến với trang web của chúng tôi",
          signIn: "Đăng nhập",
          signUp: "Đăng ký"
        }
      }
    },
    fallbackLng: 'vi', // hoặc 'en'
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
