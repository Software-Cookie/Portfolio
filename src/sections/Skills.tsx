import { Reveal, SectionHeading } from '../components/Reveal'
import { SceneSection } from '../components/SceneSection'
import { sections, skills } from '../content'

export function Skills() {
  return (
    <SceneSection id="skills" scene="skills" text="left">
      <SectionHeading index="03" label="Skills" title={sections.skills.title} />
      <ul className="mt-12">
        {skills.map((s, i) => (
          <Reveal as="li" key={i} delay={0.05 * i} className="border-t border-line py-6 last:border-b">
            <h3 className="flex items-baseline gap-3 text-sm font-medium text-paper">
              <span className="font-display text-lg text-wine-soft">{String(i + 1).padStart(2, '0')}</span>
              {s.group}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2" aria-label={s.group}>
              {s.items.map((t) => (
                <li
                  key={t}
                  className="bg-ink/60 px-3 py-1.5 text-sm text-muted ring-1 ring-white/10 transition-colors duration-300 hover:text-paper hover:ring-wine"
                >
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ul>
    </SceneSection>
  )
}
