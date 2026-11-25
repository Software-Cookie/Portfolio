import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { about, sections } from '../content'

export function About() {
  return (
    <Section id="about" eyebrow="About me" title={sections.about.title} media={{ scene: 'about', side: 'left' }}>
      <div className="space-y-5 text-[1.03rem] leading-relaxed">
        {about.paragraphs.map((p, i) => (
          <Reveal key={i} delay={0.06 * i}>
            <p className={i === 0 ? 'text-lg text-ink' : 'text-body'}>{p}</p>
          </Reveal>
        ))}
      </div>
      <dl className="mt-10 grid gap-3 sm:grid-cols-3">
        {about.facts.map((f, i) => (
          <Reveal key={i} delay={0.06 * i} className="card p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
            <dt className="text-xs font-semibold tracking-[0.1em] text-muted uppercase">{f.label}</dt>
            <dd className="mt-2 text-[0.95rem] leading-snug font-semibold text-ink">{f.value}</dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  )
}
