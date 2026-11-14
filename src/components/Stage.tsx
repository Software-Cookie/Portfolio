import { useEffect, useRef, useState } from 'react'
import { scenePoster, scenes, sceneVideo, type Scene } from '../content'

// Fixed full-screen background. Each section marks itself with data-scene.
// Scenes crossfade in step with the scrollbar: only opacity changes (GPU-composited),
// so the transition can never lag behind or get stuck mid-way.

const STACKED_Q = '(max-width: 767px), (max-aspect-ratio: 1099/1000)'
const REDUCE_Q = '(prefers-reduced-motion: reduce)'
// A scene fades in while its section's top edge travels from 95% to 40% of the screen height.
const FADE_START = 0.95
const FADE_END = 0.4
const DIM = 0.88 // how dark the outgoing scene gets before the next one rises in

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

// Ignores small height changes from mobile URL bars so the video doesn't jump while scrolling.
function useViewport() {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() =>
        setVp((v) =>
          v.w !== window.innerWidth || Math.abs(v.h - window.innerHeight) > 160
            ? { w: window.innerWidth, h: window.innerHeight }
            : v,
        ),
      )
    }
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [])
  return vp
}

/** Size and place the 16:9 video so the person lands on their side. No mirroring, no zoom-in. */
function frame(scene: Scene, w: number, h: number, stacked: boolean) {
  if (stacked) {
    // Phones / portrait tablets: video fills the top of the screen, person centred.
    const width = Math.max((h * 0.6 * 16) / 9, w)
    const height = (width * 9) / 16
    let left = w / 2 - scene.focusX * width
    left = Math.min(0, Math.max(w - width, left))
    return { left, top: 0, width, height }
  }
  const width = Math.max((h * 16) / 9, w * 0.75)
  const height = (width * 9) / 16
  const target = scene.side === 'right' ? 0.72 : 0.28
  let left = target * w - scene.focusX * width
  left = scene.side === 'right' ? Math.max(w - width, left) : Math.min(0, left)
  return { left, top: -(height - h) * 0.25, width, height }
}

const smooth = (p: number) => p * p * (3 - 2 * p)
const clamp = (p: number) => Math.min(1, Math.max(0, p))

export function Stage() {
  const stacked = useMedia(STACKED_Q)
  const reduce = useMedia(REDUCE_Q)
  const { w, h } = useViewport()
  const [current, setCurrent] = useState(0)
  // Until the first video can play, it gets the whole connection: neighbours wait, posters stay local.
  const [ready, setReady] = useState(false)
  const [userPaused, setUserPaused] = useState<boolean | null>(null)
  const paused = userPaused ?? reduce

  const layers = useRef<(HTMLDivElement | null)[]>([])
  const veils = useRef<(HTMLDivElement | null)[]>([])
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const pausedRef = useRef(paused)
  const reduceRef = useRef(reduce)
  const applyRef = useRef<() => void>(() => {})

  // Scroll-linked crossfade + playback of whatever is visible.
  useEffect(() => {
    const sections = scenes.map((s) => document.querySelector<HTMLElement>(`[data-scene="${s.id}"]`))
    let tops: number[] = []
    let raf = 0
    let lastCurrent = -1
    const lastOpacity: number[] = []
    const lastDim: number[] = []
    const lastVisible: boolean[] = []
    const playing: boolean[] = []

    const measure = () => {
      tops = sections.map((el) => (el ? el.getBoundingClientRect().top + window.scrollY : Infinity))
    }

    const apply = () => {
      raf = 0
      const y = window.scrollY
      const vh = window.innerHeight
      // Raw progress of each scene's fade (0 → 1) as its section scrolls up the screen.
      const prog = scenes.map((_, k) => {
        if (k === 0) return 1
        const start = tops[k] - vh * FADE_START
        const end = tops[k] - vh * FADE_END
        const p = clamp((y - start) / (end - start))
        return reduceRef.current ? (p >= 0.5 ? 1 : 0) : p
      })
      // Fade through dark: the outgoing scene dims in the first half, the new one rises in the second.
      const op = prog.map((p, k) => (k === 0 ? 1 : smooth(clamp((p - 0.45) / 0.55))))
      const dimOf = (k: number) => smooth(clamp((prog[k + 1] ?? 0) / 0.5)) * DIM
      let base = 0
      for (let k = op.length - 1; k >= 0; k--) {
        if (op[k] >= 1) {
          base = k
          break
        }
      }
      let dominant = base
      for (let k = base + 1; k < op.length; k++) if (op[k] >= 0.5) dominant = k

      op.forEach((o, k) => {
        const layer = layers.current[k]
        const veil = veils.current[k]
        if (!layer || !veil) return
        const visible = k >= base && o > 0
        if (visible !== lastVisible[k]) {
          layer.style.visibility = visible ? 'visible' : 'hidden'
          lastVisible[k] = visible
        }
        if (o !== lastOpacity[k]) {
          layer.style.opacity = String(o)
          layer.style.willChange = o > 0 && o < 1 ? 'opacity' : 'auto'
          lastOpacity[k] = o
        }
        const dim = visible ? dimOf(k) : 0
        if (dim !== lastDim[k]) {
          veil.style.opacity = String(dim)
          lastDim[k] = dim
        }
        // Play only what's on screen (one video, two for the length of a crossfade).
        const v = videos.current[k]
        const shouldPlay = visible && !pausedRef.current && !document.hidden
        if (v && v.getAttribute('src') && shouldPlay !== playing[k]) {
          playing[k] = shouldPlay
          if (shouldPlay) v.play().catch(() => (playing[k] = false))
          else v.pause()
        }
      })

      if (dominant !== lastCurrent) {
        lastCurrent = dominant
        setCurrent(dominant)
      }
    }

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const remeasure = () => {
      measure()
      schedule()
    }
    applyRef.current = () => {
      playing.length = 0
      schedule()
    }

    measure()
    apply()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', remeasure)
    document.addEventListener('visibilitychange', applyRef.current)
    const ro = new ResizeObserver(remeasure)
    ro.observe(document.body)
    document.fonts?.ready.then(remeasure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', remeasure)
      document.removeEventListener('visibilitychange', applyRef.current)
      ro.disconnect()
    }
  }, [])

  // Fallback for browsers that never buffer muted video (e.g. iOS Low Power Mode): don't wait forever.
  useEffect(() => {
    if (ready) return
    const t = window.setTimeout(() => setReady(true), 6000)
    return () => window.clearTimeout(t)
  }, [ready])

  // Videos: the current scene, plus its neighbours once the first video is playable.
  // Everything else is unloaded to free memory/decoders.
  const hasVideo = (k: number) => k === current || (ready && Math.abs(k - current) === 1)
  // Posters are small (~25 KB), so once the first video is ready they all load: no scene is ever black.
  const hasPoster = (k: number) => ready || Math.abs(k - current) <= 1
  const videoKey = scenes.map((_, k) => (hasVideo(k) ? 1 : 0)).join('')

  // Re-apply playback when pause state, motion preference or loaded sources change.
  useEffect(() => {
    pausedRef.current = paused
    reduceRef.current = reduce
    for (const v of videos.current) if (v && !v.getAttribute('src') && v.currentSrc) v.load()
    applyRef.current()
  }, [paused, reduce, videoKey])

  const scene = scenes[current]

  return (
    <>
      <div aria-hidden className="fixed inset-0 z-0 overflow-hidden bg-ink">
        {scenes.map((s, k) => {
          const f = frame(s, w, h, stacked)
          return (
            <div
              key={s.id}
              ref={(el) => {
                layers.current[k] = el
              }}
              className="absolute inset-0 overflow-hidden bg-ink"
              style={{ zIndex: k + 1, visibility: k === 0 ? 'visible' : 'hidden', opacity: k === 0 ? 1 : 0 }}
            >
              <video
                ref={(el) => {
                  videos.current[k] = el
                }}
                src={hasVideo(k) ? sceneVideo(s.id) : undefined}
                poster={hasPoster(k) ? scenePoster(s.id) : undefined}
                muted
                loop
                playsInline
                preload={hasVideo(k) ? 'auto' : 'none'}
                disablePictureInPicture
                tabIndex={-1}
                onCanPlay={() => applyRef.current()}
                onCanPlayThrough={() => setReady(true)}
                className="absolute max-w-none object-cover"
                style={{ left: f.left, top: f.top, width: f.width, height: f.height }}
              />
              <div className="scrim" data-text={s.side === 'right' ? 'left' : 'right'} />
              <div
                ref={(el) => {
                  veils.current[k] = el
                }}
                className="absolute inset-0 bg-ink"
                style={{ opacity: 0 }}
              />
            </div>
          )
        })}
      </div>

      {/* Scene counter — on the person's side so it never covers text */}
      <div
        className={`pointer-events-none fixed bottom-8 z-40 hidden wide:block ${
          scene.side === 'right' ? 'right-[calc(var(--gutter)+3.5rem)]' : 'left-[var(--gutter)]'
        }`}
      >
        <p key={scene.id} className="eyebrow scene-in flex items-center gap-3">
          <span className="text-paper">{scene.index}</span>
          <span className="text-faint">/ {String(scenes.length).padStart(2, '0')}</span>
          <span aria-hidden className="h-px w-8 bg-wine" />
          {scene.label}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setUserPaused(!paused)}
        aria-label={paused ? 'Play background video' : 'Pause background video'}
        className="fixed right-[var(--gutter)] bottom-4 z-40 grid h-10 w-10 place-items-center rounded-full bg-ink/80 text-paper ring-1 ring-white/15 transition hover:bg-wine focus-visible:bg-wine sm:bottom-6"
      >
        {paused ? (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            <path d="M3 1.5v9l7.5-4.5z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            <rect x="2" y="1.5" width="2.6" height="9" fill="currentColor" />
            <rect x="7.4" y="1.5" width="2.6" height="9" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  )
}
