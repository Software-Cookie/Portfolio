import { Reveal, SectionHeading } from '../components/Reveal'
import { SceneSection } from '../components/SceneSection'
import { projects, sections, type Project } from '../content'

function CardLink({ href, label, stretch }: { href: string; label: string; stretch: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-3 text-sm font-medium text-paper ${
        stretch ? 'after:absolute after:inset-0' : 'relative z-10'
      }`}
    >
      <span className="border-b border-wine pb-0.5">{label}</span>
      <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

function Card({ p, i }: { p: Project; i: number }) {
  return (
    <Reveal delay={0.08 * i}>
      <article className="group relative bg-ink/90 p-6 ring-1 ring-line transition duration-500 hover:-translate-y-1 hover:ring-wine/80 focus-within:ring-wine sm:p-9">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 px-2.5 py-1 text-[0.7rem] font-medium tracking-[0.14em] uppercase ${
              p.status === 'Ongoing' ? 'bg-wine text-paper' : 'text-paper ring-1 ring-white/20'
            }`}
          >
            {p.status === 'Ongoing' && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-paper" />}
            {p.status === 'Ongoing' ? 'In development' : 'Completed project'}
          </span>
          <span className="text-xs text-faint">{p.period}</span>
        </div>

        <h3 className="mt-6 font-display text-3xl leading-tight text-balance sm:text-4xl">{p.name}</h3>
        <p className="mt-4 text-paper/90">{p.summary}</p>

        <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted">
          {p.points.map((pt, j) => (
            <li key={j} className="flex gap-3">
              <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-wine" />
              {pt}
            </li>
          ))}
        </ul>

        <ul className="mt-7 flex flex-wrap gap-2" aria-label="Technologies">
          {p.tech.map((t) => (
            <li key={t} className="px-2.5 py-1 text-xs text-muted ring-1 ring-white/10">
              {t}
            </li>
          ))}
        </ul>

        {(p.live || p.repo) && (
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            {/* The first link also covers the whole card (after:inset-0), so the card is clickable. */}
            {p.live && <CardLink href={p.live} label="Live demo" stretch />}
            {p.repo && <CardLink href={p.repo} label="View source on GitHub" stretch={!p.live} />}
          </div>
        )}
      </article>
    </Reveal>
  )
}

export function Projects() {
  return (
    <SceneSection id="projects" scene="projects" text="right">
      <SectionHeading index="04" label="Projects" title={sections.projects.title} />
      <p className="mt-6 max-w-sm text-muted">
        {sections.projects.intro}
      </p>
      <div className="mt-12 space-y-8">
        {projects.map((p, i) => (
          <Card key={i} p={p} i={i} />
        ))}
      </div>
    </SceneSection>
  )
}
