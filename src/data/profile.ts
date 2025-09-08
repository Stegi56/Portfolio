export type Experience = {
  company: string;
  role: string;
  start: string; // "Mar 2022"
  end: string;   // "Present" or "Aug 2024"
  bullets: string[];
  tech?: string[];
  link?: string;
};

export type Project = {
  name: string;
  description: string;
  highlights?: string[];
  tech: string[];
  link?: string;
  repo?: string;
};

export const profile = {
  name: "Stegi",                  // update
  headline: "Software Engineer",
  location: "City, Country",      // update
  email: "you@example.com",       // update
  linkedin: "https://www.linkedin.com/in/stegi56/",
  github: "https://github.com/your-username", // update
  resumeUrl: "/cv.pdf",           // place a file in /public if you want
  summary:
    "Engineer focused on modern TypeScript, performance, and clean UX. I like shipping sharp, minimal products with thoughtful animations.",
  // --- Fill these from your LinkedIn ---
  skills: [
    "TypeScript","React","Node.js","Vite","CI/CD",
    "Cloud","GraphQL","PostgreSQL","Testing","Design Systems"
  ],
  experience: <Experience[]>[
    {
      company: "Company A",
      role: "Senior Software Engineer",
      start: "May 2023",
      end: "Present",
      bullets: [
        "Led the migration to React + Vite + TS, improving build time by 40%.",
        "Built a design system with accessible components and zero-runtime theming."
      ],
      tech: ["React","TypeScript","Vite","Storybook"],
      link: "https://example.com"
    },
    {
      company: "Company B",
      role: "Software Engineer",
      start: "Jan 2021",
      end: "Apr 2023",
      bullets: [
        "Delivered feature X used by 100k+ MAU.",
        "Drove reliability work, cutting errors by 30%."
      ],
      tech: ["Node.js","GraphQL","Postgres"]
    }
  ],
  projects: <Project[]>[
    {
      name: "Project One",
      description: "Low-latency real-time dashboard with typed APIs.",
      highlights: ["<50ms P95 updates","end-to-end typed contracts"],
      tech: ["React","TypeScript","WebSockets"],
      link: "https://example.com",
      repo: "https://github.com/your-username/project-one"
    },
    {
      name: "Project Two",
      description: "Dev tool that generates forms from Zod schemas.",
      tech: ["TypeScript","React","Zod"],
      repo: "https://github.com/your-username/project-two"
    }
  ]
};
