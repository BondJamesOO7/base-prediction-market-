import { en, type TranslationDictionary, type TranslationKey } from './locales/en'
import { pt } from './locales/pt'
import { es } from './locales/es'
import { zh } from './locales/zh'
import { ru } from './locales/ru'
import { ko } from './locales/ko'
import { fr } from './locales/fr'
import { ja } from './locales/ja'
import { id } from './locales/id'
import { de } from './locales/de'

export type Locale = 'en' | 'pt' | 'es' | 'zh' | 'ru' | 'ko' | 'fr' | 'ja' | 'id' | 'de'

export const DEFAULT_LOCALE: Locale = 'en'

export const LANGUAGES: { code: Locale; label: string; nativeName: string }[] = [
  { code: 'en', label: 'EN', nativeName: 'English' },
  { code: 'pt', label: 'PT', nativeName: 'Português' },
  { code: 'es', label: 'ES', nativeName: 'Español' },
  { code: 'zh', label: 'ZH', nativeName: '中文' },
  { code: 'ru', label: 'RU', nativeName: 'Русский' },
  { code: 'ko', label: 'KO', nativeName: '한국어' },
  { code: 'fr', label: 'FR', nativeName: 'Français' },
  { code: 'ja', label: 'JA', nativeName: '日本語' },
  { code: 'id', label: 'ID', nativeName: 'Bahasa Indonesia' },
  { code: 'de', label: 'DE', nativeName: 'Deutsch' },
]

export const translations: Record<Locale, TranslationDictionary> = {
  en,
  pt,
  es,
  zh,
  ru,
  ko,
  fr,
  ja,
  id,
  de,
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
