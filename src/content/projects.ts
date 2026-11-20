import type { ProjectItem } from './types'

/** Lead project first. Highlights transcribed verbatim from the résumé. */
export const PROJECTS: ProjectItem[] = [
  {
    slug: 'hoi4-multiplayer',
    name: 'HOI4 Multiplayer Platform',
    summary:
      'Ranked matches, save-file parsing and anti-cheat for Hearts of Iron IV.',
    highlights: [
      'Developed a full-stack multiplayer platform for the game Hearts of Iron IV. The platform enables users to earn rankings, gain insights about a match using the system’s game save file reader and browse user hosted lobbies.',
      'The website connects to the desktop app to periodically upload save files to parse the game info to determine if the game is over when conditions are met. The anti-cheat system checks to see if there are inconsistencies to determine cheats.',
      'After each verified match, the users get rankings and a post-game summary section to view statistics such as in-game casualties, equipment loss and much more.',
    ],
    // Not listed on the résumé; Kerem supplies it in the Projects session.
    stack: [],
    closedSource: true,
  },
  {
    slug: 'agritech',
    // Résumé reads "Agricultural Management and Platform"; confirm in the Projects session.
    name: 'Agricultural Management Platform',
    summary:
      'A vision-transformer pipeline for crop disease detection, with a real-time WebGL viewer for disease progression.',
    highlights: [
      'Architected a multi-task Vision Transformer pipeline (PyTorch Lightning, DINOv2) across 33 classes, implementing hierarchical masked cross-entropy and outlier-exposure loss with temperature scaling to calibrate confidence and reject out-of-distribution inputs.',
      'Engineered a data deduplication and streaming pipeline for 220K+ images using perceptual hashing (pHash) and DINOv2 cosine similarity to eliminate cross-split data leakage, packaging datasets into WebDataset tar shards to achieve 107 img/s training throughput.',
      'Developed a generative disease progression engine and 60 FPS WebGL viewer (React, TypeScript), combining Stable Diffusion Prompt-to-Prompt cross-attention control with custom two-phase GLSL fragment shaders to interpolate symptom severity in real time.',
    ],
    stack: [
      'PyTorch Lightning',
      'DINOv2',
      'Stable Diffusion',
      'React',
      'TypeScript',
      'WebGL',
      'GLSL',
    ],
    repoUrl: 'https://github.com/KeremVona/agritech',
    closedSource: false,
  },
]
