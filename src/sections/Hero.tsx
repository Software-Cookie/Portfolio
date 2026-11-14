import type { CSSProperties } from 'react'
import { profile } from '../content'
import { DownloadIcon } from '../components/DownloadIcon'

// Intro animations are CSS keyframes (.mask-in / .fade-up in index.css); only the delay varies.
const at = (delay: number): CSSProperties => ({ animationDelay: `${delay}s` })

function MaskLine({ text, delay, className = '' }: { text: string; delay: number; className?: string }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <span className={`mask-in block ${className}`} style={at(delay)}>
        {text}
      </span>
    </span>
  )
}

export function Hero() {
  return (
    <section
      id="top"
      data-scene="hero"
      aria-label="Introduction"
      className="relative flex min-h-svh flex-col stacked:justify-end wide:justify-center"
    >
      <div className="gutter w-full pt-[44svh] pb-16 wide:py-28">
        <div className="wide:w-[46%] [text-shadow:0_2px_24px_rgb(5_5_5/0.6)]">
          <p className="fade-up eyebrow flex items-center gap-3 text-paper/80" style={at(0.1)}>
            <span aria-hidden className="h-px w-8 bg-wine" />
            {profile.role}
          </p>
          <h1 className="mt-6 font-display text-[clamp(3.4rem,6.6vw,10rem)] leading-[0.88] tracking-[-0.02em]">
            <MaskLine text={profile.firstName} delay={0.2} />
            <MaskLine text={profile.lastName} delay={0.35} className="italic text-paper/90" />
          </h1>
          <p className="fade-up mt-8 max-w-[32rem] text-base leading-relaxed text-paper/75 sm:text-lg" style={at(0.6)}>
            {profile.intro}
          </p>
          <div className="fade-up mt-10 flex flex-wrap gap-3 [text-shadow:none]" style={at(0.75)}>
            <a
              href="#projects"
              className="group inline-flex items-center gap-3 bg-wine px-6 py-3.5 text-sm font-medium text-paper transition hover:bg-[#8f1d3f]"
            >
              Explore My Work
              <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#about"
              className="inline-flex items-center bg-ink/60 px-6 py-3.5 text-sm font-medium text-paper ring-1 ring-white/25 transition hover:ring-paper"
            >
              About Me
            </a>
            <a
              href={profile.resume}
              download
              className="group inline-flex items-center gap-2.5 bg-ink/60 px-6 py-3.5 text-sm font-medium text-paper ring-1 ring-white/25 transition hover:ring-paper"
            >
              <DownloadIcon className="transition-transform duration-300 group-hover:translate-y-0.5" />
              Download Resume
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
