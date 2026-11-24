import type { ExperienceItem } from './types'

/** Newest first. Transcribed verbatim from the résumé. */
export const EXPERIENCE: ExperienceItem[] = [
  {
    company: 'Ihlas Holding',
    companyUrl: 'https://ihlas.com.tr/',
    role: 'Software Engineering Intern',
    start: '2026-10',
    end: null,
    location: 'Istanbul, Türkiye',
    workMode: 'Onsite',
    stack: ['T3 Stack', 'Decision-based AI Benchmarking'],
    highlights: [
      'Building a benchmarking platform to evaluate decision-making AI models across scenarios such as HR decisions.',
      'Added a playground feature to quickly test out models.',
    ],
  },
  {
    company: 'Dijital Varlıklar',
    companyUrl: 'https://dijitalvarliklar.com.tr/',
    role: 'Software Engineering Intern',
    start: '2026-07',
    end: '2026-08',
    location: 'Istanbul, Türkiye',
    workMode: 'Hybrid',
    stats: [
      { value: '~2.5M', label: 'monthly visits' },
      { value: '13+', label: 'news portals tracked' },
    ],
    stack: ['.NET MVC', 'MSSQL', 'HtmlAgilityPack', 'Web Scraping'],
    highlights: [
      'Developed high-performance, interactive browser-based games deployed to the Türkiye Gazetesi web platform, reaching an audience across a high-traffic site serving ~2.5M monthly visits.',
      'Developed an automated news intelligence platform in .NET 10 ASP.NET Core MVC to track and analyze real-time homepage carousel rankings across 13+ national news portals, helping editorial teams to spot breaking trends.',
      'Engineered a concurrent scraping and NLP pipeline using HtmlAgilityPack, SemaphoreSlim, and ad-filtering rules to reliably ingest article data, pairing it with a composite weighted similarity model (Jaccard, body text, and entity overlap) to cluster shared cross-outlet news agendas.',
      'Designed rank-shift tracking and observability systems, tracking position movements over time and building a real-time health dashboard with execution latency metrics, structured logs, and on-demand scraper triggers.',
    ],
  },
  {
    company: 'OBSS',
    companyUrl: 'https://obss.tech/',
    role: 'Software Engineering Intern',
    start: '2025-07',
    end: '2025-08',
    location: 'Istanbul, Türkiye',
    workMode: 'Remote',
    stack: ['.NET', 'React', 'Gemini API', 'SignalR', 'SSMS'],
    highlights: [
      'Completed an intensive full-stack program covering .NET back-end technologies and React, culminating in a real-estate web application.',
      'Structured the .NET back-end using Onion Architecture, Repository pattern, and service layers, integrating SignalR for real-time user-to-user communication.',
      'Implemented secure JWT-based authentication and encrypted user credentials alongside comprehensive property listing, filtering, and management features.',
    ],
  },
  {
    company: 'InfinitumIT',
    companyUrl: 'https://www.infinitumit.com.tr',
    role: 'Software Engineering Intern',
    start: '2025-06',
    end: '2025-07',
    location: 'Istanbul, Türkiye',
    workMode: 'Remote',
    stack: ['Java', 'Spring Boot', 'React'],
    highlights: [
      'Developed the initial back-end infrastructure for a collaborative team project using Java and Spring Boot.',
      'Built a responsive front-end dashboard featuring dynamic UI validation and contextual user feedback messaging.',
      'Collaborated with cross-functional intern teams using Git and GitHub for version control.',
    ],
  },
  {
    company: 'Freelance',
    role: 'Web Developer',
    start: '2025-04',
    end: '2025-05',
    location: 'Remote',
    workMode: 'Remote',
    stack: ['React', 'Tailwind CSS', 'Web3Forms', 'Netlify Hosting'],
    highlights: [
      'Developed and delivered a professional, multi-page website for a nursing service company using React and Tailwind CSS, earning a 5-star client rating.',
      'Engineered a modern, fully responsive mobile-friendly UI focused on clean layout structure and smooth user experience.',
      'Integrated serverless contact form functionality via Web3Forms, eliminating the need for a dedicated backend infrastructure.',
    ],
  },
]
