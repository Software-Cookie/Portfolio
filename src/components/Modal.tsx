import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  labelledBy: string
  /** Tailwind max-width class for the panel, e.g. "max-w-5xl". */
  width?: string
  children: ReactNode
}

/**
 * Accessible modal built on the native <dialog>: focus is trapped, Esc closes it,
 * the page behind can't scroll, and clicking the dimmed backdrop closes it.
 */
export function Modal({ open, onClose, labelledBy, width = 'max-w-3xl', children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const prev = root.style.overflow
    const gap = window.innerWidth - root.clientWidth // keep layout from jumping when the scrollbar hides
    root.style.overflow = 'hidden'
    root.style.paddingRight = gap ? `${gap}px` : ''
    return () => {
      root.style.overflow = prev
      root.style.paddingRight = ''
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={labelledBy}
      onClose={onClose}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {open && (
        <div
          className="flex h-full w-full items-end justify-center p-0 sm:items-center sm:p-6"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <div
            className={`modal-panel relative flex max-h-[94svh] w-full ${width} flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-line sm:max-h-[90svh] sm:rounded-3xl`}
          >
            {children}
          </div>
        </div>
      )}
    </dialog>
  )
}

export function ModalHeader({ id, eyebrow, title, onClose }: { id: string; eyebrow?: ReactNode; title: ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line bg-white/95 px-5 py-4 backdrop-blur sm:px-8 sm:py-5">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={id} className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-soft text-ink ring-1 ring-line transition hover:bg-tint hover:text-brand-700"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  )
}
