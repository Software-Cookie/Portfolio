import { useState } from 'react'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { ArrowRight, Briefcase, Check, Copy, Download, GitHub, LeetCode, LinkedIn, Mail, Phone } from '../components/Icons'
import { profile, sections } from '../content'
import { openFreelance } from '../freelanceEvents'

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
    { label: 'GitHub', href: profile.links.github, Icon: GitHub },
    { label: 'LinkedIn', href: profile.links.linkedin, Icon: LinkedIn },
    { label: 'LeetCode', href: profile.links.leetcode, Icon: LeetCode },
  ].filter((l) => l.href)

  return (
    <>
      <Section id="contact" eyebrow="Contact" title={sections.contact.title} intro={sections.contact.intro} media={{ scene: 'contact', side: 'left' }}>
        <Reveal className="card p-6 sm:p-8">
          <p className="text-sm font-medium text-muted">Email</p>
          <a href={`mailto:${profile.email}`} className="mt-1 block text-xl font-semibold break-all text-ink transition hover:text-brand-700 sm:text-2xl">
            {profile.email}
          </a>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <a href={`mailto:${profile.email}`} className="btn btn-primary">
              <Mail size={15} /> Send an email
            </a>
            <button type="button" onClick={copyEmail} className="btn btn-outline">
              {copy === 'done' ? <Check size={15} /> : <Copy size={15} />}
              {copy === 'done' ? 'Copied' : 'Copy address'}
            </button>
            <a href={profile.resume} download className="btn btn-soft">
              <Download size={15} /> Resume (PDF)
            </a>
          </div>
          <p role="status" aria-live="polite" className="mt-2 min-h-5 text-xs text-muted">
            {copy === 'done' ? 'Email address copied to clipboard.' : copy === 'fail' ? 'Couldn’t copy — please select the address above.' : ''}
          </p>

          <dl className="mt-4 grid gap-5 border-t border-line pt-6 sm:grid-cols-2">
            {profile.phone && (
              <div>
                <dt className="text-sm font-medium text-muted">Phone</dt>
                <dd className="mt-1">
                  <a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 font-medium text-ink transition hover:text-brand-700">
                    <Phone size={15} className="text-brand" /> {profile.phone}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-muted">Profiles</dt>
              <dd className="mt-1.5 flex flex-wrap gap-2">
                {links.map(({ label, href, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                    <Icon size={14} /> {label}
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ))}
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={0.08} className="mt-5 flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-brand to-[#5aa6f2] p-6 text-white shadow-lift sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="flex items-center gap-2 font-semibold">
              <Briefcase size={17} /> Have a project in mind?
            </p>
            <p className="mt-1 text-sm text-white/85">Tell me what you need. I’ll reply with next steps and a quote.</p>
          </div>
          <button type="button" onClick={openFreelance} className="btn bg-white text-brand-700 shadow-card hover:-translate-y-px hover:bg-tint">
            Start a project <ArrowRight size={15} />
          </button>
        </Reveal>
      </Section>

      <footer className="border-t border-line bg-white">
        <div className="container-x flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <p>Portrait visuals created with Google Flow.</p>
          <a href="#top" className="font-medium text-body transition hover:text-brand-700">
            Back to top
          </a>
        </div>
      </footer>
    </>
  )
}
