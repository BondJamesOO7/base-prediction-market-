import { en, type TranslationDictionary, type TranslationKey } from './locales/en'
import { pt } from './locales/pt'
import { es } from './locales/es'
import { zh } from './locales/zh'
import { ru } from './locales/ru'

export type Locale = 'en' | 'pt' | 'es' | 'zh' | 'ru'

export const DEFAULT_LOCALE: Locale = 'en'

export const LANGUAGES: { code: Locale; label: string; nativeName: string }[] = [
  { code: 'en', label: 'EN', nativeName: 'English' },
  { code: 'pt', label: 'PT', nativeName: 'Português' },
  { code: 'es', label: 'ES', nativeName: 'Español' },
  { code: 'zh', label: 'ZH', nativeName: '中文' },
  { code: 'ru', label: 'RU', nativeName: 'Русский' },
]

export const translations: Record<Locale, TranslationDictionary> = {
  en,
  pt,
  es,
  zh,
  ru,
}

export type { TranslationDictionary, TranslationKey }

const STORAGE_KEY = 'app_locale'

export function getSavedLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved && saved in translations) return saved as Locale
  return DEFAULT_LOCALE
}

export function saveLocale(locale: Locale): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, locale)
}
