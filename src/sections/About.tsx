import { Reveal, SectionHeading } from '../components/Reveal'
import { SceneSection } from '../components/SceneSection'
import { about, sections } from '../content'

export function About() {
  return (
    <SceneSection id="about" scene="about" text="right">
      <SectionHeading index="02" label="About" title={sections.about.title} />
      <div className="mt-10 space-y-5 text-[1.05rem] leading-relaxed text-muted">
        {about.paragraphs.map((p, i) => (
          <Reveal key={i} delay={0.08 * i}>
            <p className={i === 0 ? 'text-paper' : undefined}>{p}</p>
          </Reveal>
        ))}
      </div>
      <dl className="mt-12 grid gap-px overflow-hidden bg-line sm:grid-cols-3">
        {about.facts.map((f, i) => (
          <Reveal key={i} delay={0.1 * i} className="bg-ink p-5">
            <dt className="eyebrow">{f.label}</dt>
            <dd className="mt-2 text-sm leading-snug text-paper">{f.value}</dd>
          </Reveal>
        ))}
      </dl>
    </SceneSection>
  )
}
