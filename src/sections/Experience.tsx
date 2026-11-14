import { Reveal, SectionHeading } from '../components/Reveal'
import { SceneSection } from '../components/SceneSection'
import { experience, sections } from '../content'

export function Experience() {
  return (
    <SceneSection id="experience" scene="experience" text="left">
        <div>
          <SectionHeading index="05" label="Experience" title={sections.experience.title} />

          <ol className="mt-14 space-y-14">
            {experience.map((e, i) => (
              <Reveal as="li" key={i} delay={0.08 * i} className="relative pl-8">
                <span aria-hidden className="absolute top-2 bottom-0 left-0 w-px bg-line" />
                <span aria-hidden className="absolute top-1.5 -left-[3px] h-[7px] w-[7px] rounded-full bg-wine" />
                <p className="eyebrow">{e.period}</p>
                <h3 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">{e.role}</h3>
                <p className="mt-1 text-paper/80">
                  {e.company} <span className="text-faint">· {e.place}</span>
                </p>
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted">
                  {e.points.map((pt, j) => (
                    <li key={j} className="flex gap-3">
                      <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-wine" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ol>
        </div>

    </SceneSection>
  )
}
