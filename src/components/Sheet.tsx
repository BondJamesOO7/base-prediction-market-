import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface SheetProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Sheet({ open, title, onClose, children }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl"
            style={{
              background: 'rgba(18, 36, 60, 0.92)',
              border: '1px solid var(--border)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            }}
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pb-1 pt-5">
              <h2 className="display text-xl font-semibold" style={{ color: 'var(--ink)' }}>
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                style={{ color: 'var(--subtle)' }}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="px-5 pb-6 pt-2">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
