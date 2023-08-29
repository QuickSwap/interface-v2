export const SUPPORTED_LOCALES = ['en-US', 'ru-RU', 'es-ES'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en-US';

export const LOCALE_LABEL: { [locale in SupportedLocale]: string } = {
  'en-US': 'English',
  'es-ES': 'Español',
  'ru-RU': 'Русский',
};
