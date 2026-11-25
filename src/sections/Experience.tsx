import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { experience, sections } from '../content'

type Role = (typeof experience)[number]

// Consecutive roles at the same company are shown as one card (e.g. a promotion).
function byCompany(list: Role[]) {
  const out: { company: string; place: string; roles: Role[] }[] = []
  for (const r of list) {
    const last = out[out.length - 1]
    if (last && last.company === r.company) last.roles.push(r)
    else out.push({ company: r.company, place: r.place, roles: [r] })
  }
  return out
}

const initials = (s: string) =>
  s
    .replace(/\b(pvt|ltd|inc|llc|technologies|innovations)\b\.?/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export function Experience() {
  return (
    <Section id="experience" eyebrow="Experience" title={sections.experience.title} media={{ scene: 'experience', side: 'left' }}>
      <ol className="space-y-5">
        {byCompany(experience).map((c, i) => (
          <Reveal as="li" key={i} delay={0.05 * i} className="card p-5 sm:p-7">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-tint to-tint-2 text-sm font-bold text-brand-700 ring-1 ring-tint-2">
                {initials(c.company) || c.company[0]}
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">{c.company}</h3>
                <p className="text-sm text-muted">{c.place}</p>
              </div>
            </div>

            <ol className="relative mt-6 space-y-7 border-l border-line pl-6">
              {c.roles.map((r, j) => (
                <li key={j} className="relative">
                  <span
                    aria-hidden
                    className={`absolute top-1.5 -left-[1.95rem] h-3 w-3 rounded-full ring-4 ring-white ${j === 0 ? 'bg-brand' : 'bg-line-2'}`}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <h4 className="font-semibold">{r.role}</h4>
                    <span className="chip">{r.period}</span>
                  </div>
                  <ul className="mt-3 space-y-2 text-[0.95rem] leading-relaxed text-body">
                    {r.points.map((pt, k) => (
                      <li key={k} className="flex gap-3">
                        <span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-sky" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
