import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import de from "./locales/de.json";
import en from "./locales/en.json";

// i18next Grundsetup für PepeShows
// - Erkennung: Query, LocalStorage. Bewusst nicht die Browsersprache: Googlebot
//   meldet sich als en-US und saehe sonst unter deutschen URLs englischen Inhalt.
// - Fallback: Deutsch
// - React: kein Suspense nötig

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en },
    },
    fallbackLng: "de",
    supportedLngs: ["de", "en"],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    detection: {
      order: ["querystring", "localStorage"],
      lookupQuerystring: "lang",
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, // React escaped ohnehin
    },
    react: {
      useSuspense: false,
    },
    returnNull: false,
    returnEmptyString: false,
  });

export default i18n;