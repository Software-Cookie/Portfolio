# Sivaprasad Pearlapaati — Portfolio

A cinematic, scroll-driven personal portfolio. Full-screen video scenes crossfade as you scroll, while content slides in beside them. Built with **React 19, TypeScript, Vite and Tailwind CSS v4**. Content is managed through a **local-only CMS**, and every update deploys automatically.

**Live:** [sivaprasad.live](https://sivaprasad.live) · **Resume:** [`public/Sivaprasad_Pearlapaati_Resume.pdf`](public/Sivaprasad_Pearlapaati_Resume.pdf)

---

## Highlights

- **Scroll-linked video stage.** Eight full-screen scenes crossfade through black as you scroll. Only `opacity` changes, so the GPU does the work, and updates are batched with `requestAnimationFrame`.
- **Memory-aware media loading.** Only the current scene and its two neighbours have a video source and poster attached. Off-screen videos are unloaded and paused. Background-tab playback stops via the Page Visibility API.
- **Responsive art direction.** The video frame is recalculated so the person is always on the opposite side from the text: side by side on wide screens, a top "window" on phones.
- **Zero-dependency animations.** Entrance effects use one shared `IntersectionObserver` plus CSS transitions, with no animation library. The JS bundle is about **80 KB gzipped**.
- **Accessible by default.** Skip link, keyboard-friendly mobile menu (Esc to close, focus return), `aria-current` navigation, live regions, a pause button for the video, and full `prefers-reduced-motion` support.
- **Content-driven.** All text lives in [`src/content.json`](src/content.json), separate from the UI code, so updating the site never means editing components.
- **Search-ready.** Title, description, canonical URL, Open Graph cards and schema.org `ProfilePage` / `Person` data are generated from the content at build time. A sitemap and robots.txt are generated too, plus a plain-HTML copy of the content that crawlers can read without running JavaScript.
- **Local CMS + automatic deploys.** A small Node editor (no dependencies) runs only on `127.0.0.1`. It validates edits, previews them live, then builds, commits and pushes, and the host redeploys on every push.

## Tech stack

| Area | Tools |
| --- | --- |
| UI | React 19, TypeScript (strict), JSX |
| Styling | Tailwind CSS v4 (`@theme` tokens, custom variants), CSS animations |
| Build | Vite 8 (Rolldown), TypeScript project build |
| Media | HTML5 video, WebP posters, lazy source loading |
| Browser APIs | IntersectionObserver, ResizeObserver, matchMedia, Page Visibility, Clipboard |
| CMS | Node.js `http` server (no dependencies), schema-driven vanilla JS forms |
| SEO | Build-time meta + JSON-LD generation (custom Vite plugin), sitemap, robots.txt, Open Graph |
| Delivery | Git, GitHub, Vercel continuous deployment, custom domain |

## Project structure

```
src/
  content.json        ← all editable text (edited by the CMS)
  content.ts          ← types + layout settings (scenes, nav)
  main.tsx            ← app entry: Stage + Nav + sections
  index.css           ← theme tokens, scrims, animations
  components/
    Stage.tsx         ← fixed video background, scroll-linked crossfade
    SceneSection.tsx  ← section layout over the stage
    Reveal.tsx        ← scroll reveal + section heading
    Nav.tsx           ← header, active-section tracking, mobile menu
  sections/           ← Hero, About, Skills, Projects, Experience, Education, Contact
public/
  media/              ← scene videos (.mp4) + posters (.webp)
  *.pdf               ← downloadable resume
```

## Run locally

```bash
npm install
npm run dev       # site at http://localhost:5173
npm run build     # type-check + production build into dist/
```

## License

Code © Sivaprasad Pearlapaati. Portrait visuals created with Google Flow; please don't reuse them.
