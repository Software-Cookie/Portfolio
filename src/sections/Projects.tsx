import { useEffect, useMemo, useState } from 'react'
import { Reveal, SectionHeading } from '../components/Reveal'
import { Modal, ModalHeader } from '../components/Modal'
import { ArrowLeft, ArrowRight, Check, ExternalLink, GitHub, Search } from '../components/Icons'
import { hostOf, projects, sections, slugOf, type Project } from '../content'

const HASH = '#project/'
type Filter = 'All' | 'Completed' | 'Ongoing'
const FILTER_LABEL: Record<Filter, string> = { All: 'All', Completed: 'Completed', Ongoing: 'In development' }

/* ---------- small pieces ---------- */

function StatusBadge({ p, className = '' }: { p: Project; className?: string }) {
  const live = p.status === 'Ongoing'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
        live ? 'bg-tint text-brand-700 ring-1 ring-tint-2' : 'bg-[#e9f7ef] text-ok ring-1 ring-[#cdebd9]'
      } ${className}`}
    >
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-brand' : 'bg-ok'}`} />
      {live ? 'In development' : 'Completed'}
    </span>
  )
}

/** A website "template" preview: a browser frame with the project's screenshot (or a clean placeholder). */
function Preview({ p, src, className = '', eager = false }: { p: Project; src?: string; className?: string; eager?: boolean }) {
  const img = src ?? p.image
  const host = hostOf(p.live) || hostOf(p.repo)
  return (
    <div className={`overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-line ${className}`}>
      <div className="flex h-7 items-center gap-1.5 border-b border-line bg-soft px-3">
        <span className="h-2 w-2 rounded-full bg-[#f4a7a7]" />
        <span className="h-2 w-2 rounded-full bg-[#f6d28b]" />
        <span className="h-2 w-2 rounded-full bg-[#9bd9ae]" />
        {host && <span className="ml-2 truncate rounded-md bg-white px-2 py-0.5 text-[0.65rem] text-muted ring-1 ring-line">{host}</span>}
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-tint">
        {img ? (
          <img
            src={img}
            alt={`Screenshot of ${p.name}`}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover object-top transition duration-700 ease-smooth group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-tint via-white to-tint-2 p-6 text-center">
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-sky text-lg font-bold text-white shadow-lift">
                {p.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()}
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">{p.name}</p>
              {p.category && <p className="mt-0.5 text-xs text-muted">{p.category}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LinkButtons({ p, size = '' }: { p: Project; size?: string }) {
  return (
    <>
      {p.live && (
        <a href={p.live} target="_blank" rel="noreferrer" className={`btn btn-primary ${size}`}>
          <ExternalLink size={14} />
          Live site
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
      {p.repo && (
        <a href={p.repo} target="_blank" rel="noreferrer" className={`btn btn-outline ${size}`}>
          <GitHub size={14} />
          Source code
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      )}
    </>
  )
}

/* ---------- card ---------- */

function Card({ p, onOpen, i }: { p: Project; onOpen: () => void; i: number }) {
  const extra = p.tech.length - 4
  return (
    <Reveal as="article" delay={0.05 * (i % 3)} className="group card flex flex-col p-3 transition duration-500 ease-smooth hover:-translate-y-1 hover:shadow-lift hover:ring-tint-2">
      <button type="button" onClick={onOpen} className="relative block cursor-pointer rounded-xl text-left" aria-label={`View details: ${p.name}`}>
        <div className="rounded-xl bg-gradient-to-br from-tint to-soft p-3 pb-0 sm:p-4 sm:pb-0">
          <Preview p={p} className="rounded-b-none" />
        </div>
        <StatusBadge p={p} className="absolute top-[3.4rem] right-6 shadow-card sm:top-[3.65rem] sm:right-7" />
      </button>

      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        <p className="text-xs font-medium text-muted">
          {[p.category, p.period].filter(Boolean).join(' · ')}
        </p>
        <h3 className="mt-1.5 text-lg leading-snug font-semibold">
          <button type="button" onClick={onOpen} className="cursor-pointer text-left transition-colors hover:text-brand-700">
            {p.name}
          </button>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-body">{p.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
          {p.tech.slice(0, 4).map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
          {extra > 0 && <li className="chip text-muted">+{extra}</li>}
        </ul>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          <LinkButtons p={p} size="btn-sm" />
          <button type="button" onClick={onOpen} className="ml-auto inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-brand-700 transition hover:gap-2">
            Details <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </Reveal>
  )
}

/* ---------- details popup ---------- */

function ProjectDetails({ p, onPrev, onNext }: { p: Project; onPrev?: () => void; onNext?: () => void }) {
  const shots = [p.image, ...(p.gallery ?? [])].filter((x): x is string => !!x)
  const [shot, setShot] = useState(0)

  const facts = [
    ['Status', p.status === 'Ongoing' ? 'In development' : 'Completed'],
    ['Timeline', p.period],
    ['My role', p.role],
    ['Type', p.category],
  ].filter(([, v]) => v) as [string, string][]

  return (
    <div className="overflow-y-auto overscroll-contain">
      <div className="grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-2xl bg-gradient-to-br from-tint to-soft p-3 sm:p-5">
            <Preview p={p} src={shots[shot]} eager />
          </div>
          {shots.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Screenshots">
              {shots.map((s, k) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShot(k)}
                  aria-label={`Show screenshot ${k + 1}`}
                  aria-pressed={k === shot}
                  className={`h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-2 transition ${
                    k === shot ? 'ring-brand' : 'ring-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={s} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          <h3 className="mt-8 text-base font-semibold">Overview</h3>
          <div className="mt-2 space-y-3 leading-relaxed text-body">
            {(p.overview || p.summary).split(/\n\s*\n/).map((para, k) => (
              <p key={k}>{para}</p>
            ))}
          </div>

          {p.points.length > 0 && (
            <>
              <h3 className="mt-8 text-base font-semibold">What I did</h3>
              <ul className="mt-3 space-y-3">
                {p.points.map((pt, k) => (
                  <li key={k} className="flex gap-3 leading-relaxed text-body">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-tint text-brand-700">
                      <Check size={12} strokeWidth={2.6} />
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="space-y-5 lg:col-span-2">
          <div className="card p-5">
            <dl className="space-y-3.5">
              {facts.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line pb-3.5 last:border-0 last:pb-0">
                  <dt className="text-sm text-muted">{k}</dt>
                  <dd className="text-right text-sm font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            {(p.live || p.repo) && (
              <div className="mt-5 grid gap-2">
                <LinkButtons p={p} />
              </div>
            )}
          </div>
          <div className="card p-5">
            <h3 className="text-sm font-semibold">Tech stack</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {p.tech.map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {(onPrev || onNext) && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-8">
          <button type="button" onClick={onPrev} disabled={!onPrev} className="btn btn-outline btn-sm disabled:invisible">
            <ArrowLeft size={14} /> Previous
          </button>
          <button type="button" onClick={onNext} disabled={!onNext} className="btn btn-outline btn-sm disabled:invisible">
            Next <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ---------- section ---------- */

export function Projects() {
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  // Deep links: #project/<slug> opens that project directly (shareable).
  useEffect(() => {
    const fromHash = () => {
      if (!location.hash.startsWith(HASH)) return
      const k = projects.findIndex((p) => slugOf(p) === decodeURIComponent(location.hash.slice(HASH.length)))
      if (k >= 0) setOpenIdx(k)
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [])

  const open = (k: number) => {
    setOpenIdx(k)
    history.replaceState(null, '', `${HASH}${slugOf(projects[k])}`)
  }
  const close = () => {
    setOpenIdx(null)
    if (location.hash.startsWith(HASH)) history.replaceState(null, '', '#projects')
  }

  const counts = useMemo(
    () => ({
      All: projects.length,
      Completed: projects.filter((p) => p.status === 'Completed').length,
      Ongoing: projects.filter((p) => p.status === 'Ongoing').length,
    }),
    [],
  )

  const q = query.trim().toLowerCase()
  const shown = projects
    .map((p, k) => ({ p, k }))
    .filter(({ p }) => filter === 'All' || p.status === filter)
    .filter(({ p }) => !q || [p.name, p.category, p.summary, ...p.tech].join(' ').toLowerCase().includes(q))

  const current = openIdx != null ? projects[openIdx] : null

  return (
    <section id="projects" aria-labelledby="projects-title" className="bg-soft py-20 sm:py-28">
      <div className="container-x">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading id="projects-title" eyebrow="Projects" title={sections.projects.title} intro={sections.projects.intro} />
          <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0">
            {projects.length > 4 && (
              <label className="relative block">
                <span className="sr-only">Search projects</span>
                <Search size={15} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or tech"
                  className="control w-full rounded-full py-2 pl-9 text-sm sm:w-56"
                />
              </label>
            )}
            {counts.Completed > 0 && counts.Ongoing > 0 && (
              <div role="group" aria-label="Filter projects" className="inline-flex rounded-full bg-white p-1 shadow-card ring-1 ring-line">
                {(Object.keys(FILTER_LABEL) as Filter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={filter === f}
                    onClick={() => setFilter(f)}
                    className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm font-medium transition duration-300 ${
                      filter === f ? 'bg-brand text-white shadow-[0_4px_12px_-6px_rgb(47_127_230/0.8)]' : 'text-body hover:text-ink'
                    }`}
                  >
                    {FILTER_LABEL[f]} <span className={filter === f ? 'text-white/80' : 'text-muted'}>{counts[f]}</span>
                  </button>
                ))}
              </div>
            )}
          </Reveal>
        </div>

        {shown.length ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map(({ p, k }, i) => (
              <Card key={slugOf(p)} p={p} i={i} onOpen={() => open(k)} />
            ))}
          </div>
        ) : (
          <p className="mt-12 rounded-2xl bg-white p-10 text-center text-body ring-1 ring-line">No projects match that search.</p>
        )}
      </div>

      <Modal open={!!current} onClose={close} labelledBy="project-dialog-title" width="max-w-6xl">
        {current && openIdx != null && (
          <>
            <ModalHeader
              id="project-dialog-title"
              eyebrow={<StatusBadge p={current} className="tracking-normal normal-case" />}
              title={current.name}
              onClose={close}
            />
            <ProjectDetails
              key={openIdx}
              p={current}
              onPrev={openIdx > 0 ? () => open(openIdx - 1) : undefined}
              onNext={openIdx < projects.length - 1 ? () => open(openIdx + 1) : undefined}
            />
          </>
        )}
      </Modal>
    </section>
  )
}
