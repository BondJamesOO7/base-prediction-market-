import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  DEFAULT_LOCALE,
  getSavedLocale,
  saveLocale,
  translations,
  type Locale,
  type TranslationKey,
} from './i18n'

interface LocaleContextValue {
  locale: Locale
  setLocale: (next: Locale) => void
  t: (key: TranslationKey) => string
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => translations[DEFAULT_LOCALE][key],
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getSavedLocale())

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    saveLocale(next)
  }

  const t = (key: TranslationKey): string => {
    return translations[locale][key] ?? translations[DEFAULT_LOCALE][key]
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
