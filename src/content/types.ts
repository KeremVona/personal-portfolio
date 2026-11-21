export type SectionId = 'about' | 'projects' | 'experience' | 'contact'

export interface SectionLink {
  id: SectionId
  label: string
}

export interface Profile {
  name: string
  role: string
  location: string
  school: string
  /** YYYY-MM */
  graduation: string
  availability: string
  email: string
  languages: string[]
}

export interface ExternalLink {
  label: string
  href: string
}

export type WorkMode = 'Onsite' | 'Hybrid' | 'Remote'

export interface ExperienceItem {
  company: string
  companyUrl?: string
  role: string
  /** YYYY-MM */
  start: string
  /** YYYY-MM, or null while the role is ongoing */
  end: string | null
  location: string
  workMode: WorkMode
  stack: string[]
  highlights: string[]
}

export interface ProjectItem {
  slug: string
  name: string
  summary: string
  highlights: string[]
  stack: string[]
  repoUrl?: string
  closedSource: boolean
}
