import type { CSSProperties } from 'react'
import { experience, profile, projects } from '../content'
import { openFreelance } from '../freelanceEvents'
import { SceneMedia } from '../components/SceneMedia'
import { ArrowRight, Download, GitHub, LeetCode, LinkedIn, Mail } from '../components/Icons'

const at = (delay: number): CSSProperties => ({ animationDelay: `${delay}s` })

export function Hero() {
  const current = experience[0]
  const socials = [
    { label: 'GitHub', href: profile.links.github, Icon: GitHub },
    { label: 'LinkedIn', href: profile.links.linkedin, Icon: LinkedIn },
    { label: 'LeetCode', href: profile.links.leetcode, Icon: LeetCode },
    { label: 'Email', href: `mailto:${profile.email}`, Icon: Mail },
  ].filter((s) => s.href)

  return (
    <section id="top" aria-label="Introduction" className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* soft light-blue glow + faint grid, purely decorative */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-tint blur-3xl" />
        <div className="absolute top-1/3 left-[-15%] h-[28rem] w-[28rem] rounded-full bg-[#f0f7ff] blur-3xl" />
        <div className="absolute inset-0 [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      </div>

      <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <button
            type="button"
            onClick={openFreelance}
            className="fade-up group inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-white py-1.5 pr-3 pl-2 text-sm font-medium text-ink shadow-card ring-1 ring-line transition hover:ring-brand"
            style={at(0)}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok/40 motion-reduce:hidden" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ok" />
            </span>
            Open to freelance projects
            <ArrowRight size={14} className="text-brand transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>

          <h1 className="fade-up mt-7 text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.02] font-semibold tracking-[-0.03em]" style={at(0.06)}>
            {profile.firstName} <span className="text-brand-600">{profile.lastName}</span>
          </h1>
          <p className="fade-up mt-4 text-lg font-medium text-ink/80 sm:text-xl" style={at(0.12)}>
            {profile.role}
            {current && (
              <span className="text-muted">
                {' '}
                · {current.role} at {current.company}
              </span>
            )}
          </p>
          <p className="fade-up mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-body" style={at(0.18)}>
            {profile.intro}
          </p>

          <div className="fade-up mt-9 flex flex-wrap gap-3" style={at(0.24)}>
            <a href="#projects" className="btn btn-primary btn-lg group">
              View projects
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
            <button type="button" onClick={openFreelance} className="btn btn-outline btn-lg">
              Hire me
            </button>
            <a href={profile.resume} download className="btn btn-soft btn-lg">
              <Download size={16} />
              Resume
            </a>
          </div>

          <ul className="fade-up mt-10 flex flex-wrap items-center gap-2" style={at(0.3)} aria-label="Profiles">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-body shadow-card ring-1 ring-line transition duration-300 hover:-translate-y-0.5 hover:text-brand-700 hover:ring-brand"
                >
                  <Icon size={17} />
                </a>
              </li>
            ))}
            <li className="ml-2 text-sm text-muted">
              <span className="font-semibold text-ink">{projects.length}</span> projects ·{' '}
              <span className="font-semibold text-ink">{new Set(experience.map((e) => e.company)).size}</span> companies
            </li>
          </ul>
        </div>

        <div className="fade-up relative lg:col-span-5" style={at(0.15)}>
          <SceneMedia scene="hero" aspect={4 / 4.4} priority />
          {current && (
            <div className="absolute -bottom-5 left-4 max-w-[80%] rounded-2xl bg-white/95 px-4 py-3 shadow-lift ring-1 ring-line backdrop-blur sm:-left-6">
              <p className="text-[0.7rem] font-semibold tracking-[0.12em] text-muted uppercase">Currently</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">
                {current.role} <span className="font-normal text-body">· {current.company}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
