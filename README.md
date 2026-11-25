# Sivaprasad Pearlapaati — Portfolio

A clean, light personal portfolio in white and light blue. Projects appear as a grid of website-style preview cards; each opens a details popup with screenshots, an overview, what I built, the tech stack, and links to the live site and source code. Built with **React 19, TypeScript, Vite and Tailwind CSS v4**. Content is managed through a **local-only admin panel**, and every update deploys automatically.

**Live:** [sivaprasad.live](https://sivaprasad.live) · **Resume:** [`public/Sivaprasad_Pearlapaati_Resume.pdf`](public/Sivaprasad_Pearlapaati_Resume.pdf)

---

## Highlights

- **Project gallery.** Cards show a browser-framed screenshot, status, summary, tech and direct "Live site" / "Source code" buttons. Search and status filters help when there are many projects. Each project has a shareable deep link (`#project/<name>`).
- **Calm video.** Each section has a short clip in a rounded frame. It loads only near the screen, plays only while visible, has its own pause button, and never autoplays under `prefers-reduced-motion`.
- **Freelance enquiries in a popup.** The navbar's Freelance button (or `#freelance`) opens a validated form delivered by FormSubmit, with a spam honeypot and an email fallback.
- **Accessible.** Native `<dialog>` modals (focus trap, Esc to close), skip link, keyboard-friendly menu, `aria-current` navigation, live regions.
- **Content-driven.** All text lives in [`src/content.json`](src/content.json), separate from the UI code.
- **Search-ready.** Title, description, canonical URL, Open Graph cards and schema.org `ProfilePage` / `Person` data are generated at build time, plus a sitemap, robots.txt and a plain-HTML copy of the content for crawlers.
- **Local admin panel + automatic deploys.** A small Node editor (no dependencies) runs only on `127.0.0.1`. It edits content, uploads project screenshots and the resume, previews changes, then builds, commits and pushes.

## Tech stack

| Area | Tools |
| --- | --- |
| UI | React 19, TypeScript (strict), JSX |
| Styling | Tailwind CSS v4 (`@theme` tokens, custom variants), CSS animations |
| Build | Vite 8 (Rolldown), TypeScript project build |
| Media | HTML5 video with lazy loading, WebP posters, project screenshots |
| Browser APIs | IntersectionObserver, `<dialog>`, matchMedia, Page Visibility, Clipboard |
| CMS | Node.js `http` server (no dependencies), schema-driven vanilla JS forms |
| SEO | Build-time meta + JSON-LD generation (custom Vite plugin), sitemap, robots.txt, Open Graph |
| Delivery | Git, GitHub, Vercel continuous deployment, custom domain |

## Project structure

```
src/
  content.json        ← all editable text (edited by the admin panel)
  content.ts          ← types + layout settings
  main.tsx            ← app entry: Nav + sections + freelance popup
  index.css           ← theme tokens, buttons, cards, animations
  components/         ← Nav, Section, SceneMedia (video card), Modal, FreelanceModal, Icons
  sections/           ← Hero, About, Skills, Projects, Experience, Education, Contact
public/
  media/              ← section videos (.mp4) + posters (.webp)
  projects/           ← project screenshots
  *.pdf               ← downloadable resume
```

## Run locally

```bash
npm install
npm run dev       # site at http://localhost:5173
npm run build     # type-check + production build into dist/
```

## Updating content

Run `npm run cms` and edit everything in the browser at `http://127.0.0.1:4321`, then press **Publish**. The step-by-step guide is in `cms/ADMIN-GUIDE.md` (local only).

## License

Code © Sivaprasad Pearlapaati. Portrait visuals created with Google Flow; please don't reuse them.
