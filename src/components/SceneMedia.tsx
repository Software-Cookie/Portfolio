import { useEffect, useRef, useState } from 'react'
import { focusX, scenePoster, sceneVideo, type SceneId } from '../content'
import { Pause, Play } from './Icons'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A calm, framed clip beside a section. Shows the still poster first; the video only
 * downloads when the card is near the screen, plays only while it's mostly visible,
 * and never autoplays for people who prefer reduced motion.
 */
export function SceneMedia({
  scene,
  aspect = 4 / 3,
  caption,
  className = '',
  priority = false,
}: {
  scene: SceneId
  aspect?: number
  caption?: string
  className?: string
  priority?: boolean
}) {
  const box = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [armed, setArmed] = useState(false) // has the video source been attached
  const [visible, setVisible] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState<boolean>(() => reducedMotion())

  useEffect(() => {
    const el = box.current
    if (!el) return
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setArmed(true), { rootMargin: '300px 0px' })
    const seen = new IntersectionObserver(([e]) => setVisible(e.intersectionRatio >= 0.35), { threshold: [0, 0.35, 0.6] })
    near.observe(el)
    seen.observe(el)
    const onHide = () => document.hidden && video.current?.pause()
    document.addEventListener('visibilitychange', onHide)
    return () => {
      near.disconnect()
      seen.disconnect()
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [])

  useEffect(() => {
    const v = video.current
    if (!v || !armed) return
    if (visible && !userPaused && !document.hidden) v.play().catch(() => setPlaying(false))
    else v.pause()
  }, [armed, visible, userPaused])

  // Keep the person centred when the 16:9 clip is cropped to this card's shape.
  const shown = Math.min(1, aspect / (16 / 9))
  const pos = shown >= 1 ? 50 : Math.min(1, Math.max(0, (focusX[scene] - shown / 2) / (1 - shown))) * 100
  const style = { objectPosition: `${pos}% 35%` }

  return (
    <figure
      ref={box}
      className={`group relative overflow-hidden rounded-[1.75rem] bg-[#ececec] shadow-card ring-1 ring-line ${className}`}
      style={{ aspectRatio: String(aspect) }}
    >
      <img
        src={scenePoster(scene)}
        alt=""
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={style}
      />
      <video
        ref={video}
        src={armed ? sceneVideo(scene) : undefined}
        muted
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        tabIndex={-1}
        aria-hidden
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? 'opacity-100' : 'opacity-0'}`}
        style={style}
      />
      {/* soft light wash at the bottom so captions read on the light background */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white/70 to-transparent" />
      {caption && (
        <figcaption className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow-card ring-1 ring-line backdrop-blur">
          {caption}
        </figcaption>
      )}
      <button
        type="button"
        onClick={() => setUserPaused((p) => !p)}
        aria-label={userPaused ? 'Play video' : 'Pause video'}
        className="absolute right-4 bottom-4 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/90 text-ink shadow-card ring-1 ring-line backdrop-blur transition hover:text-brand-700 hover:ring-brand"
      >
        {userPaused ? <Play size={12} /> : <Pause size={12} />}
      </button>
    </figure>
  )
}
