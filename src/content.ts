// All editable text lives in content.json — edit it with the local CMS (npm run cms).
// This file only adds types and the design settings that are tied to the layout.
import data from './content.json'

export type Project = {
  name: string
  status: 'Ongoing' | 'Completed'
  period: string
  summary: string
  points: string[]
  tech: string[]
  repo: string
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

export const nav = [
  { id: 'about', label: 'About', index: '02' },
  { id: 'skills', label: 'Skills', index: '03' },
  { id: 'projects', label: 'Projects', index: '04' },
  { id: 'experience', label: 'Experience', index: '05' },
  { id: 'education', label: 'Education', index: '06' },
  { id: 'contact', label: 'Contact', index: '08' },
]

// Full-screen background scenes, cut from the supplied Google Flow video (public/media).
// focusX: where the person stands in the frame (0 = left edge, 1 = right edge).
// side: which side of the screen the person is placed on; text goes on the other side.
export type SceneId =
  | 'hero' | 'about' | 'skills' | 'projects' | 'experience' | 'education' | 'certifications' | 'contact'

export type Scene = { id: SceneId; label: string; index: string; focusX: number; side: 'left' | 'right' }

export const scenes: Scene[] = [
  { id: 'hero', label: 'Intro', index: '01', focusX: 0.52, side: 'right' },
  { id: 'about', label: 'About', index: '02', focusX: 0.36, side: 'left' },
  { id: 'skills', label: 'Skills', index: '03', focusX: 0.53, side: 'right' },
  { id: 'projects', label: 'Projects', index: '04', focusX: 0.47, side: 'left' },
  { id: 'experience', label: 'Experience', index: '05', focusX: 0.55, side: 'right' },
  { id: 'education', label: 'Education', index: '06', focusX: 0.42, side: 'left' },
  { id: 'certifications', label: 'Certifications', index: '07', focusX: 0.49, side: 'right' },
  { id: 'contact', label: 'Contact', index: '08', focusX: 0.52, side: 'left' },
]

export const sceneVideo = (id: SceneId) => `/media/${id}.mp4`
export const scenePoster = (id: SceneId) => `/media/${id}-poster.webp`
