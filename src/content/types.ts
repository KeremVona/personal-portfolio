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

/** Placeholder colour for a project without screenshots. */
export type ProjectTone = 'parchment' | 'meadow' | 'sky'

export type ProjectMedia =
  | { kind: 'image'; variants: ImagetoolsMetadata[]; alt: string }
  | { kind: 'video'; src: string; poster: string; alt: string }

export interface ProjectItem {
  slug: string
  name: string
  /** One line on the card. */
  summary: string
  /** The panel's longer paragraph. */
  description: string
  highlights: string[]
  stack: string[]
  /** Set for open-source projects; its absence means closed source. */
  repoUrl?: string
  liveUrl?: string
  /** Empty until screenshots exist; the first image is the card cover. */
  media: ProjectMedia[]
  tone: ProjectTone
}
