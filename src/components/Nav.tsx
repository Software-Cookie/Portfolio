import { useEffect, useRef, useState } from 'react'
import { nav, profile } from '../content'
import { DownloadIcon } from './DownloadIcon'

export function Nav() {
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && setActive(e.target.id === 'certifications' ? 'education' : e.target.id),
        ),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    document.querySelectorAll('main section[id]').forEach((s) => io.observe(s))
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        menuBtn.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? 'bg-ink/90' : 'bg-transparent'
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:bg-paper focus:px-3 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <nav aria-label="Primary" className="gutter flex h-16 items-center justify-between">
        <a href="#top" className="group flex items-baseline gap-2" aria-label={`${profile.name}, back to top`}>
          <span className="font-display text-2xl leading-none">SP</span>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-wine transition group-hover:scale-150" />
        </a>

        <ul className="hidden items-center gap-5 md:flex lg:gap-7">
          {nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                aria-current={active === n.id ? 'true' : undefined}
                className={`relative py-2 text-[0.8rem] tracking-wide transition-colors hover:text-paper ${
                  active === n.id ? 'text-paper' : 'text-muted'
                }`}
              >
                {n.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-wine transition-transform duration-500 ${
                    active === n.id ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            </li>
          ))}
          <li>
            <a
              href={profile.resume}
              download
              className="group inline-flex items-center gap-2 bg-wine px-4 py-2 text-[0.8rem] font-medium text-paper transition hover:bg-[#8f1d3f]"
            >
              <DownloadIcon className="transition-transform duration-300 group-hover:translate-y-0.5" />
              Resume
            </a>
          </li>
        </ul>

        <button
          ref={menuBtn}
          type="button"
          className="relative -mr-2 grid h-11 w-11 place-items-center md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden className={`absolute h-px w-6 bg-paper transition ${open ? 'rotate-45' : '-translate-y-1'}`} />
          <span aria-hidden className={`absolute h-px w-6 bg-paper transition ${open ? '-rotate-45' : 'translate-y-1'}`} />
        </button>
      </nav>

      <div
        id="mobile-menu"
        hidden={!open}
        className="h-[calc(100svh-4rem)] overflow-y-auto border-t border-line bg-ink gutter pb-10 pt-6 md:hidden"
      >
        <ul className="space-y-1">
          {nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 border-b border-line py-4 font-display text-4xl"
              >
                <span className="font-sans text-xs text-wine-soft">{n.index}</span>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={profile.resume}
          download
          onClick={() => setOpen(false)}
          className="mt-8 flex items-center justify-center gap-3 bg-wine px-6 py-4 text-sm font-medium text-paper"
        >
          <DownloadIcon />
          Download Resume (PDF)
        </a>
      </div>
    </header>
  )
}
