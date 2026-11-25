import { useEffect, useRef, useState } from 'react'
import { nav, profile } from '../content'
import { openFreelance } from '../freelanceEvents'
import { Briefcase, Download } from './Icons'

export function Nav() {
  const [active, setActive] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), {
      rootMargin: '-45% 0px -50% 0px',
    })
    document.querySelectorAll('main section[id]').forEach((s) => io.observe(s))
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        menuBtn.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const hire = () => {
    setOpen(false)
    openFreelance()
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
        scrolled || open ? 'bg-white/85 shadow-[0_1px_0_var(--color-line)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <nav aria-label="Primary" className="container-x flex h-16 items-center justify-between gap-6">
        <a href="#top" className="group flex items-center gap-2.5" aria-label={`${profile.name}, back to top`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-sky text-sm font-bold text-white shadow-[0_6px_14px_-6px_rgb(47_127_230/0.7)] transition duration-300 group-hover:rotate-[-4deg]">
            SP
          </span>
          <span className="hidden text-[0.95rem] font-semibold text-ink sm:block">{profile.name}</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                aria-current={active === n.id ? 'true' : undefined}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-300 ${
                  active === n.id ? 'bg-tint text-brand-700' : 'text-body hover:bg-soft hover:text-ink'
                }`}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <button type="button" onClick={hire} className="btn btn-outline">
            <Briefcase size={15} />
            Freelance
          </button>
          <a href={profile.resume} download className="btn btn-primary">
            <Download size={15} />
            Resume
          </a>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button type="button" onClick={hire} className="btn btn-outline btn-sm">
            Freelance
          </button>
          <button
            ref={menuBtn}
            type="button"
            className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-full ring-1 ring-line transition hover:ring-brand"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden className={`absolute h-[1.5px] w-4.5 rounded bg-ink transition duration-300 ${open ? 'rotate-45' : '-translate-y-1'}`} />
            <span aria-hidden className={`absolute h-[1.5px] w-4.5 rounded bg-ink transition duration-300 ${open ? '-rotate-45' : 'translate-y-1'}`} />
          </button>
        </div>
      </nav>

      <div id="mobile-menu" hidden={!open} className="border-t border-line bg-white lg:hidden">
        <ul className="container-x grid gap-1 py-4">
          {nav.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-4 py-3 text-base font-medium transition ${
                  active === n.id ? 'bg-tint text-brand-700' : 'text-ink hover:bg-soft'
                }`}
              >
                {n.label}
              </a>
            </li>
          ))}
          <li className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={hire} className="btn btn-outline btn-lg">
              <Briefcase size={16} />
              Freelance
            </button>
            <a href={profile.resume} download onClick={() => setOpen(false)} className="btn btn-primary btn-lg">
              <Download size={16} />
              Resume
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}
