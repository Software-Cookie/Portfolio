import type { ReactNode } from 'react'

// One shared observer for every Reveal: adds .is-in once the element scrolls into view.
// The fade itself is plain CSS (see .reveal in index.css).
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
    { rootMargin: '0px 0px -4% 0px' },
  )
  io.observe(el)
  return () => io!.unobserve(el)
}

type Props = { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' | 'article' }

/** Fades content up once as it enters the viewport. Opacity-only under reduced motion. */
export function Reveal({ children, delay = 0, className = '', as = 'div' }: Props) {
  const Tag = as
  return (
    <Tag ref={revealRef} className={`reveal ${className}`} style={delay ? { transitionDelay: `${Math.min(delay, 0.24)}s` } : undefined}>
      {children}
    </Tag>
  )
}

/** Renders "*word*" in the accent colour, so headings can be edited as plain text in the admin panel. */
export function Emph({ text }: { text: string }) {
  return text.split('*').map((part, i) =>
    i % 2 ? (
      <span key={i} className="bg-gradient-to-r from-brand-600 to-sky bg-clip-text text-transparent">
        {part}
      </span>
    ) : (
      part
    ),
  )
}

type HeadingProps = { eyebrow: string; title: string; intro?: string; className?: string; id?: string }

export function SectionHeading({ eyebrow, title, intro, className = '', id }: HeadingProps) {
  return (
    <Reveal className={className}>
      <p className="eyebrow flex items-center gap-3">
        <span aria-hidden className="h-px w-6 bg-brand" />
        {eyebrow}
      </p>
      <h2 id={id} className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
        <Emph text={title} />
      </h2>
      {intro && <p className="mt-4 max-w-3xl text-[1.02rem] leading-relaxed text-body">{intro}</p>}
    </Reveal>
  )
}
