import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Nav } from './components/Nav'
import { Stage } from './components/Stage'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Skills } from './sections/Skills'
import { Projects } from './sections/Projects'
import { Experience } from './sections/Experience'
import { Certifications, Education } from './sections/Education'
import { Freelance } from './sections/Freelance'
import { Contact } from './sections/Contact'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Stage />
    <Nav />
    <main id="main" className="relative z-10">
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Experience />
      <Education />
      <Certifications />
      <Freelance />
      <Contact />
    </main>
  </StrictMode>,
)
