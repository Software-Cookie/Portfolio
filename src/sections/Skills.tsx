import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { Cloud, Code, Database, Layers, Server, Tool } from '../components/Icons'
import { sections, skills } from '../content'

// Pick an icon from the group's name, so new groups added in the admin panel still get one.
function iconFor(group: string) {
  const g = group.toLowerCase()
  if (/language|program/.test(g)) return Code
  if (/backend|framework|system/.test(g) && !/cloud/.test(g)) return Server
  if (/data/.test(g)) return Database
  if (/devops|tool/.test(g)) return Tool
  if (/cloud/.test(g)) return Cloud
  return Layers
}

export function Skills() {
  return (
    <Section id="skills" eyebrow="Skills" title={sections.skills.title} tone="soft" media={{ scene: 'skills', side: 'right' }}>
      <ul className="grid gap-4 sm:grid-cols-2">
        {skills.map((s, i) => {
          const Icon = iconFor(s.group)
          return (
            <Reveal
              as="li"
              key={i}
              delay={0.05 * i}
              className={`card p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift ${
                i === skills.length - 1 && i % 2 === 0 ? 'sm:col-span-2' : ''
              }`}
            >
              <h3 className="flex items-center gap-3 text-[0.95rem] font-semibold">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-tint text-brand-700">
                  <Icon size={17} />
                </span>
                {s.group}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label={s.group}>
                {s.items.map((t) => (
                  <li key={t} className="chip transition-colors duration-300 hover:bg-tint hover:text-brand-700 hover:ring-tint-2">
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          )
        })}
      </ul>
    </Section>
  )
}
