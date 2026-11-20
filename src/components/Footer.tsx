import { useState } from 'react'

export function Footer() {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText('jamesbond.oo7')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <footer className="mt-16 border-t pt-6 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-medium">Made by JamesBondOO7</p>
        <div className="flex items-center gap-3">
          <a
            href={['https://x.com', 'OO7BondJames007'].join('/')}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ background: 'var(--surface)', color: 'var(--ink-2)', border: '1px solid var(--border)' }}
          >
            X: @OO7BondJames007
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ background: 'var(--surface)', color: 'var(--ink-2)', border: '1px solid var(--border)' }}
          >
            {copied ? 'Discord: Copied!' : 'Discord: jamesbond.oo7'}
          </button>
        </div>
      </div>
    </footer>
  )
}
