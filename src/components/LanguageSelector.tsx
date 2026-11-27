import { useEffect, useRef, useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { LANGUAGES } from '@/lib/i18n'
import { useLocale } from '@/lib/LocaleContext'

export function LanguageSelector() {
  const { locale, setLocale } = useLocale()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Select language"
        aria-expanded={open}
        className="glass-inner flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors hover:bg-white/15"
        style={{ color: 'var(--ink)' }}
      >
        <Globe className="size-3.5" style={{ color: 'var(--accent)' }} />
        <span>{current.label}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="glass-inner absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl p-1 shadow-xl backdrop-blur-xl"
          style={{ background: 'var(--surface-strong)' }}
        >
          {LANGUAGES.map((lang) => {
            const active = lang.code === locale
            return (
              <button
                key={lang.code}
                type="button"
                role="menuitem"
                onClick={() => {
                  setLocale(lang.code)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-white/10"
                style={{
                  color: active ? 'var(--accent)' : 'var(--ink)',
                  fontWeight: active ? 600 : 500,
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="w-5 text-[11px] font-bold opacity-70">{lang.label}</span>
                  <span>{lang.nativeName}</span>
                </span>
                {active && <Check className="size-3.5" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
