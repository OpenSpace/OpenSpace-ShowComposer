import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';

import { resources } from './resources';

// Key should match the IETF language code: https://en.wikipedia.org/wiki/IETF_language_tag
export const SupportedLanguages = ['en'] as const;

i18n.use(initReactI18next).init({
  // Specifies default language
  lng: 'en',
  // Fallback when a locale translation is missing
  fallbackLng: 'en',
  supportedLngs: SupportedLanguages,
  // Resources are bundled (not fetched) so translations are available on the
  // first render, avoiding any load race.
  resources,
  // Namespaces
  ns: Object.keys(resources.en),
  defaultNS: false,
  interpolation: {
    // React already escapes interpolated values, safeguarding against XSS.
    escapeValue: false
  }
});

export default i18n;
