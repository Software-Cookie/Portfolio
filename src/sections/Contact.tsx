import { useState } from 'react'
import { Reveal, SectionHeading } from '../components/Reveal'
import { SceneSection } from '../components/SceneSection'
import { profile, sections } from '../content'
import { DownloadIcon } from '../components/DownloadIcon'

export function Contact() {
  const [copy, setCopy] = useState<'idle' | 'done' | 'fail'>('idle')

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopy('done')
    } catch {
      setCopy('fail')
    }
    window.setTimeout(() => setCopy('idle'), 2500)
  }

  const links = [
    { label: 'GitHub', href: profile.links.github },
    { label: 'LinkedIn', href: profile.links.linkedin },
    { label: 'LeetCode', href: profile.links.leetcode },
  ].filter((l) => l.href)

  return (
    <>
      <SceneSection id="contact" scene="contact" text="right">
          <SectionHeading index="08" label="Contact" title={sections.contact.title} />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-muted">{sections.contact.intro}</p>
          </Reveal>

          <Reveal delay={0.15}>
            <a
              href={`mailto:${profile.email}`}
              className="mt-10 block break-all font-display text-[clamp(1.5rem,3.2vw,2.6rem)] leading-tight underline decoration-wine decoration-1 underline-offset-[0.2em] transition hover:decoration-paper"
            >
              {profile.email}
            </a>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-3 bg-wine px-6 py-3.5 text-sm font-medium text-paper transition hover:bg-[#8f1d3f]"
              >
                Send an email <span aria-hidden>→</span>
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex items-center px-6 py-3.5 text-sm font-medium text-paper ring-1 ring-white/20 transition hover:ring-paper"
              >
                {copy === 'done' ? 'Copied ✓' : 'Copy address'}
              </button>
              <a
                href={profile.resume}
                download
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-medium text-paper ring-1 ring-white/20 transition hover:ring-paper"
              >
                <DownloadIcon className="transition-transform duration-300 group-hover:translate-y-0.5" />
                Resume (PDF)
              </a>
              <span role="status" aria-live="polite" className="text-xs text-muted">
                {copy === 'done' ? 'Email address copied to clipboard.' : copy === 'fail' ? 'Couldn’t copy — please select the address above.' : ''}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <dl className="mt-14 grid gap-6 border-t border-line pt-8 sm:grid-cols-2">
              <div>
                <dt className="eyebrow">Phone</dt>
                <dd className="mt-2">
                  <a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="text-paper transition hover:text-wine-soft">
                    {profile.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Elsewhere</dt>
                <dd className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                  {links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-paper transition hover:text-wine-soft"
                    >
                      {l.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ))}
                </dd>
              </div>
            </dl>
          </Reveal>
      </SceneSection>
      <footer className="relative z-10 border-t border-line bg-ink">
        <div className="gutter flex flex-col gap-3 py-8 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>Portrait visuals created with Google Flow.</p>
        <a href="#top" className="transition hover:text-paper">
          Back to top ↑
        </a>
        </div>
      </footer>
    </>
  )
}
