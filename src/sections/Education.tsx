import { Reveal, SectionHeading } from '../components/Reveal'
import { SceneSection } from '../components/SceneSection'
import { certificates, education, sections } from '../content'

export function Education() {
  return (
    <SceneSection id="education" scene="education" text="right">
      <SectionHeading index="06" label="Education" title={sections.education.title} />
      <ol className="mt-12 divide-y divide-line border-y border-line">
        {education.map((e, i) => (
          <Reveal as="li" key={i} delay={0.08 * i} className="py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="text-lg font-medium text-paper">{e.school}</h3>
              <span className="text-xs text-faint">{e.period}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {e.degree} · {e.place}
            </p>
          </Reveal>
        ))}
      </ol>
    </SceneSection>
  )
}

export function Certifications() {
  return (
    <SceneSection id="certifications" scene="certifications" text="left">
      <SectionHeading index="07" label="Certifications" title={sections.certifications.title} />
      <ul className="mt-12 space-y-4">
        {certificates.map((c, i) => (
          <Reveal as="li" key={i} delay={0.08 * i}>
            <div className="bg-ink/90 p-6 ring-1 ring-line transition duration-500 hover:ring-wine/80">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <p className="eyebrow">{c.issuer}</p>
                <span className="text-xs text-faint">{c.date}</span>
              </div>
              <h3 className="mt-3 font-display text-2xl leading-snug">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.note}</p>
              {c.url && (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block border-b border-wine pb-0.5 text-sm text-paper"
                >
                  View certificate <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </div>
          </Reveal>
        ))}
      </ul>
    </SceneSection>
  )
}
