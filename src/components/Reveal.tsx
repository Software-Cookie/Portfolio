import type { ReactNode } from 'react'

// One shared observer for every Reveal: adds .is-in once the element scrolls into view.
// The fade itself is plain CSS (see .reveal in index.css), so no animation library is needed.
let io: IntersectionObserver | undefined

function revealRef(el: HTMLElement | null) {
  if (!el) return
  io ??= new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        e.target.classList.add('is-in')
        io!.unobserve(e.target)
      }),
    { rootMargin: '0px 0px -12% 0px' },
  )
  io.observe(el)
  return () => io!.unobserve(el)
}

type Props = { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' }

/** Fades content up once as it enters the viewport. Opacity-only under reduced motion. */
export function Reveal({ children, delay = 0, className = '', as = 'div' }: Props) {
  const Tag = as
  return (
    <Tag ref={revealRef} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}s` } : undefined}>
      {children}
    </Tag>
  )
}

/** Renders "*word*" as an italic accent, so headings can be edited as plain text in the CMS. */
export function Emph({ text }: { text: string }) {
  return text.split('*').map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part))
}

type HeadingProps = { index: string; label: string; title: string; className?: string }

export function SectionHeading({ index, label, title, className = '' }: HeadingProps) {
  return (
    <Reveal className={className}>
      <p className="eyebrow flex items-center gap-3">
        <span className="text-wine-soft">{index}</span>
        <span aria-hidden className="h-px w-8 bg-wine" />
        {label}
      </p>
      <h2 className="mt-5 font-display text-5xl leading-[0.95] tracking-[-0.01em] text-balance sm:text-6xl lg:text-7xl">
        <Emph text={title} />
      </h2>
    </Reveal>
  )
}
