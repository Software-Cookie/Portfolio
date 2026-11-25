import type { ReactNode } from 'react'
import type { SceneId } from '../content'
import { SectionHeading } from './Reveal'
import { SceneMedia } from './SceneMedia'

type Props = {
  id: string
  eyebrow: string
  title: string
  intro?: string
  /** Optional framed clip beside the content. */
  media?: { scene: SceneId; side: 'left' | 'right'; caption?: string }
  tone?: 'white' | 'soft'
  children: ReactNode
}

/** A page section: heading + content, with an optional calm video card that stays in view beside it. */
export function Section({ id, eyebrow, title, intro, media, tone = 'white', children }: Props) {
  const headingId = `${id}-title`
  const heading = <SectionHeading id={headingId} eyebrow={eyebrow} title={title} intro={intro} />

  return (
    <section id={id} aria-labelledby={headingId} className={`relative py-20 sm:py-28 ${tone === 'soft' ? 'bg-soft' : 'bg-page'}`}>
      <div className="container-x">
        {media ? (
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
            <div className={`lg:col-span-7 ${media.side === 'left' ? 'lg:order-2' : ''}`}>
              {heading}
              <div className="mt-10">{children}</div>
            </div>
            <div className={`lg:sticky lg:top-24 lg:col-span-5 ${media.side === 'left' ? 'lg:order-1' : ''}`}>
              <SceneMedia scene={media.scene} caption={media.caption} />
            </div>
          </div>
        ) : (
          <>
            {heading}
            <div className="mt-10">{children}</div>
          </>
        )}
      </div>
    </section>
  )
}
