import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { Award, ExternalLink, Grad } from '../components/Icons'
import { certificates, education, sections } from '../content'

/** Education and certifications, side by side in one section. */
export function Education() {
  return (
    <Section id="education" eyebrow="Education & certifications" title={sections.education.title} tone="soft" media={{ scene: 'education', side: 'right' }}>
      <h3 className="flex items-center gap-2 text-sm font-semibold tracking-[0.1em] text-muted uppercase">
        <Grad size={16} className="text-brand" /> Education
      </h3>
      <ol className="mt-4 grid gap-4">
        {education.map((e, i) => (
          <Reveal as="li" key={i} delay={0.05 * i} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div>
                <p className="font-semibold text-ink">{e.degree}</p>
                <p className="mt-0.5 text-body">{e.school}</p>
                <p className="text-sm text-muted">{e.place}</p>
              </div>
              <span className="chip">{e.period}</span>
            </div>
          </Reveal>
        ))}
      </ol>

      {certificates.length > 0 && (
        <>
          <h3 className="mt-10 flex items-center gap-2 text-sm font-semibold tracking-[0.1em] text-muted uppercase">
            <Award size={16} className="text-brand" /> Certifications
          </h3>
          <ul className="mt-4 grid gap-4">
            {certificates.map((c, i) => (
              <Reveal as="li" key={i} delay={0.05 * i} className="card p-5 transition duration-300 hover:shadow-lift">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-xs font-semibold tracking-[0.08em] text-brand-600 uppercase">{c.issuer}</p>
                  <span className="text-xs text-muted">{c.date}</span>
                </div>
                <p className="mt-2 font-semibold text-ink">{c.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-body">{c.note}</p>
                {c.url && (
                  <a href={c.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline">
                    View certificate <ExternalLink size={13} />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </Reveal>
            ))}
          </ul>
        </>
      )}
    </Section>
  )
}
