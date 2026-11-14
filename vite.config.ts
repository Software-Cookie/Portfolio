import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ---------------------------------------------------------------------------
// SEO: everything search engines and link previews read is generated from
// src/content.json, so editing content in the CMS keeps it in sync.
//   - <title>, description, canonical URL, Open Graph / Twitter tags
//   - JSON-LD (schema.org ProfilePage + Person) so Google knows who the site is about
//   - a plain-HTML copy of the content inside #root, readable without JavaScript
//     (React replaces it on load; it only shows if JS is slow or off)
//   - sitemap.xml + robots.txt
// ---------------------------------------------------------------------------

type Content = typeof import('./src/content.json')

const readContent = (): Content => JSON.parse(readFileSync(new URL('./src/content.json', import.meta.url), 'utf8'))

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const plain = (s: string) => s.replace(/\*/g, '') // headings use *word* for italics
const clip = (s: string, n: number) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)) + '…')

function siteUrl(c: Content) {
  return (c.profile.site || 'https://sivaprasad.live').replace(/\/+$/, '')
}

function head(c: Content) {
  const site = siteUrl(c)
  const p = c.profile
  const title = `${p.name} — ${p.role}`
  const description = clip(p.searchDescription || p.intro, 160)
  const image = `${site}/og.jpg`
  const links = Object.values(p.links).filter(Boolean)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${site}/`,
    name: title,
    dateModified: new Date().toISOString().slice(0, 10),
    mainEntity: {
      '@type': 'Person',
      '@id': `${site}/#person`,
      name: p.name,
      givenName: p.firstName,
      familyName: p.lastName,
      jobTitle: p.role,
      description: p.intro,
      url: `${site}/`,
      image,
      email: `mailto:${p.email}`,
      sameAs: links,
      alumniOf: c.education.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.school })),
      knowsAbout: [...new Set(c.skills.flatMap((s) => s.items))],
    },
  }

  return `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="author" content="${esc(p.name)}" />
    <link rel="canonical" href="${site}/" />
    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="${esc(p.name)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${site}/" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(`${p.name}, ${p.role}`)}" />
    <meta property="profile:first_name" content="${esc(p.firstName)}" />
    <meta property="profile:last_name" content="${esc(p.lastName)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${image}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
}

function body(c: Content) {
  const p = c.profile
  const a = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`
  const list = (items: string[]) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`
  const links = Object.entries(p.links).filter(([, v]) => v)
  return `
    <div class="prerender">
      <header>
        <h1>${esc(p.name)}</h1>
        <p><strong>${esc(p.role)}</strong></p>
        <p>${esc(p.intro)}</p>
        <p>${[a(p.resume, 'Resume (PDF)'), ...links.map(([k, v]) => a(v, k[0].toUpperCase() + k.slice(1)))].join(' · ')}</p>
      </header>
      <section><h2>About</h2>${c.about.paragraphs.map((t) => `<p>${esc(t)}</p>`).join('')}</section>
      <section><h2>Experience</h2>${c.experience
        .map((e) => `<article><h3>${esc(e.role)} — ${esc(e.company)}, ${esc(e.place)}</h3><p>${esc(e.period)}</p>${list(e.points)}</article>`)
        .join('')}</section>
      <section><h2>Projects</h2>${c.projects
        .map(
          (x) =>
            `<article><h3>${esc(x.name)}</h3><p>${esc(x.period)} · ${esc(x.summary)}</p>${list(x.points)}<p>${esc(x.tech.join(', '))}</p><p>${[
              x.live && a(x.live, 'Live site'),
              x.repo && a(x.repo, 'Source code'),
            ]
              .filter(Boolean)
              .join(' · ')}</p></article>`,
        )
        .join('')}</section>
      <section><h2>Skills</h2>${c.skills.map((s) => `<p><strong>${esc(s.group)}:</strong> ${esc(s.items.join(', '))}</p>`).join('')}</section>
      <section><h2>Education</h2>${c.education
        .map((e) => `<p><strong>${esc(e.school)}</strong>, ${esc(e.place)} — ${esc(e.degree)} (${esc(e.period)})</p>`)
        .join('')}</section>
      <section><h2>Certifications</h2>${c.certificates
        .map((x) => `<p><strong>${esc(x.title)}</strong> — ${esc(x.issuer)}, ${esc(x.date)}</p>`)
        .join('')}</section>
      <section><h2>${esc(plain(c.sections.contact.title))}</h2><p>${a(`mailto:${p.email}`, p.email)}</p></section>
    </div>`
}

function seo(): Plugin {
  return {
    name: 'portfolio-seo',
    transformIndexHtml(html) {
      const c = readContent()
      return html.replace('<!--seo-head-->', head(c)).replace('<!--seo-body-->', body(c))
    },
    generateBundle() {
      const site = siteUrl(readContent())
      const today = new Date().toISOString().slice(0, 10)
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site}/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`,
      })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n` })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seo()],
})
