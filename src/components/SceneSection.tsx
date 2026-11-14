import type { ReactNode } from 'react'
import type { SceneId } from '../content'

type Props = {
  id: string
  scene: SceneId
  /** Side the text sits on (the person is on the other side). */
  text: 'left' | 'right'
  label?: string
  children: ReactNode
}

/**
 * A full-height section over the background stage.
 * Wide screens: text column on one side, the person visible on the other.
 * Phones: a clear window onto the video first, then the content on a dark panel.
 */
export function SceneSection({ id, scene, text, label, children }: Props) {
  return (
    <section id={id} data-scene={scene} aria-label={label} className="relative">
      <div aria-hidden className="h-[50svh] wide:hidden" />
      <div className="relative stacked:bg-ink/92 wide:flex wide:min-h-svh wide:items-center">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-32 h-32 bg-gradient-to-b from-transparent to-ink/92 wide:hidden" />
        <div className="gutter w-full pt-6 pb-24 wide:py-32">
          <div className={text === 'left' ? 'wide:w-[46%]' : 'wide:ml-auto wide:w-[46%]'}>{children}</div>
        </div>
      </div>
    </section>
  )
}
