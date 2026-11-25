// All editable text lives in content.json — edit it with the admin panel (npm run cms).
// This file only adds types and the layout settings that are tied to the design.
import data from './content.json'

export type Project = {
  name: string
  category?: string
  status: 'Ongoing' | 'Completed'
  period: string
  role?: string
  summary: string
  overview?: string
  points: string[]
  tech: string[]
  image?: string
  gallery?: string[]
  repo?: string
  live?: string
}

export const profile = data.profile
export const sections = data.sections
export const about = data.about
export const skills: { group: string; items: string[] }[] = data.skills
export const projects = data.projects as Project[]
export const experience = data.experience
export const education = data.education
export const certificates = data.certificates
export const freelance = data.freelance

/** URL-safe id for a project, used for #project/<slug> deep links. */
export const slugOf = (p: Project) =>
  p.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Host name shown in the preview's browser bar, e.g. "topcoders.online". */
export const hostOf = (url?: string) => {
  try {
    return url ? new URL(url).host.replace(/^www\./, '') : ''
  } catch {
    return ''
  }
}

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
]

// Short portrait clips (public/media). focusX = where the person stands in the 16:9 frame (0–1),
// used to keep them centred when the clip is cropped to a portrait card.
export type SceneId = 'hero' | 'about' | 'skills' | 'projects' | 'experience' | 'education' | 'certifications' | 'contact'

export const focusX: Record<SceneId, number> = {
  hero: 0.52,
  about: 0.5,
  skills: 0.5,
  projects: 0.5,
  experience: 0.56,
  education: 0.5,
  certifications: 0.5,
  contact: 0.52,
}

export const sceneVideo = (id: SceneId) => `/media/${id}.mp4`
export const scenePoster = (id: SceneId) => `/media/${id}-poster.webp`
