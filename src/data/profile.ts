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
  name: "Joel Staugaitis",                  
  headline: "Software Engineer",
  location: "United Kingdom & EU",      
  email: "56rolsj@gmail.com",             
  linkedin: "https://www.linkedin.com/in/stegi56/",
  github: "https://github.com/stegi56",
  resumeUrl: "/Joel Staugaitis.pdf", 
  summary:
    "A keen generalist who enjoys staying up to date with the latest tech, experimenting with new libraries, frameworks and languages. I take pride in delivering minimalistic solutions that balance performance and maintainability.",
  skills: [
    "TypeScript","React","Node.js","Vite","CI/CD",
    "Cloud","GraphQL","PostgreSQL","Testing","Design Systems"
  ],
  experience: <Experience[]>[
    {
      company: "CGI",
      role: "Consultant Software Engineer",
      start: "Jul 2025",
      end: "Present",
      bullets: [
        "Delivering public sector infrastructure using AWS, Terraform, GitLab and CI/CD."
      ],
      tech: ["aws","Terraform","GitLab","React","TypeScript"],
      link: "https://example.com"
    },
    {
      company: "HM Revenue & Customs",
      role: "Software Developer",
      start: "Oct 2023",
      end: "Aug 2024",
      bullets: [
        "Developed on team Platform Operations on the Multi-Channel Digital Tax Platform (MDTP), responsible for DevOps, paved road, aws, observability, scalability and CI/CD at HMRC.",
        "Constructed pipelines",
        "Managed infrastructure state via Terraform",
        "Using Scala, worked on micro-services and frontend of a Catalogue tool. "
      ],
      tech: ["Scala", "aws", "terraform", "Confluence", "Jira", "Grafana", "Jenkins", "Docker"]
    }
  ],
  projects: <Project[]>[
    {
      name: "Project One",
      description: "testy test test",
      highlights: ["1", "2"],
      tech: ["React","TypeScript","WebSockets"],
      link: "https://example.com",
      repo: "https://example.com"
    },
    {
      name: "Project Two",
      description: "testy test test",
      tech: ["TypeScript","React"],
      repo: "https://example.com"
    }
  ]
};
