import { i, ins } from "framer-motion/client";

export type Education = {
  title: string;
  logo: string;
  institution: string;
  start: string; // "Mar 2022"
  end: string;   // "Present" or "Aug 2024"
  bullets: string[];
  certificate?: string; // URL or path to certificate PDF
  tech?: string[];
}

export type Certification = {
  name: string;
  image: string; // URL or path to logo image
  certificate?: string; // URL or path to certificate PDF
  issuer: string;
  link?: string;
  issueDate: string; // "2023-08"
  tech?: string[];
}

export type Experience = {
  company: string;
  logo: string; // URL or path to logo image
  role: string;
  start: string; // "Mar 2022"
  end: string;   // "Present" or "Aug 2024"
  bullets: string[];
  tech?: string[];
  link?: string;
  poster?: string;
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
  resumeUrl: "Joel Staugaitis.pdf", 
  summary:
    "A keen generalist who enjoys staying up to date with the latest tech, experimenting with new libraries, frameworks and languages. I take pride in delivering solutions that balance performance, complexity/maintainability and cost.",
  skills: [
    "TypeScript","React","Node.js"
  ],
  education: <Education[]>[
    {
      title: "BSc Computer Science (1st Class Honours)",
      institution: "City, University of London",
      start: "Sep 2021",
      end: "Jul 2025",
      certificate: "certificates/1752672801343.pdf",
      logo: "logos/output-onlinepngtools.png",
      bullets: [
        "Mathematics for Computing, Theory of Computation",
        "Databases, Data Structures and Algorithms",
        "Systems Architecture, Operating Systems",
        "Functional Programming, Concurrency, Object-Oriented Analysis and Design",
        "Computer Networks, Cloud Computing",
        "Language Processors",
        "Computer Vision",
        "Ethics"
      ],
      tech: ["Java", "Python", "C++", "Haskell", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "MongoDB"],
    }
  ],
  certifications: <Certification[]>[
    {
      name: "AWS Certified Cloud Practitioner",
      image: "logos/aws-certified-cloud-practitioner.png",
      certificate: "certificates/1754427503415.pdf",
      issuer: "Amazon Web Services",
      issueDate: "2025-08",
      tech: ["aws", "DevOps"]
    },
    {
      name: "HashiCorp Certified: Terraform Associate",
      image: "logos/TQ968292686GB.png",
      certificate: "certificates/TerraformAssociate00320250909-30-zjhxev.pdf",
      issuer: "HashiCorp",
      issueDate: "2025-09",
      tech: ["Terraform", "IaC", "Vault", "DevOps"]
    },
    {
      name: "GitLab CI Fundamentals",
      image: "logos/gitlab-logo-500-rgb.png",
      certificate: "certificates/1757078512263.pdf",
      issuer: "GitLab",
      issueDate: "2025-09",
      tech: ["GitLab", "CI/CD", "DevOps"]
    }
  ],
  experience: <Experience[]>[
    {
      company: "CGI",
      logo: "logos/CGI_2.png",
      role: "Consultant Software Engineer",
      start: "Jul 2025",
      end: "Present",
      bullets: [
        "Delivering infrastructure for a public sector client using AWS, Terraform, GitLab and CI/CD."
      ],
      tech: ["aws","Terraform","GitLab", "CI/CD"],
      link: "https://www.cgi.com/uk/en-gb",
    },
    {
      company: "He Is Real Charity",
      logo: "logos/heisreal.png",
      role: "Volunteer Software Engineer",
      start: "May 2025",
      end: "July 2025",
      bullets: [
       "Infrastructure: Made a pipeline and configured infrastructure for public file upload, review and display.",
       "Design: Implemented web components so that this infrastructure can be attached via embed links onto a Squarespace site."
      ],
      tech: ["aws","GitHub Actions","React","TypeScript", "vite", "Next.js", "Bunny.net", "Google Cloud Platform", "DynamoDB"],
      link: "https://heisreal.today",
    },
    {
      company: "HM Revenue & Customs",
      logo: "logos/hmrc.png",
      role: "Software Developer",
      start: "Oct 2023",
      end: "Aug 2024",
      bullets: [
        "Developed on team Platform Operations on the Multi-Channel Digital Tax Platform (MDTP), responsible for DevOps, paved road, aws, observability, scalability and CI/CD at HMRC.",
        "Constructed pipelines",
        "Managed infrastructure state via Terraform",
        "Using Scala, worked on micro-services and frontend of a Catalogue tool. "
      ],
      tech: ["Scala", "aws", "terraform", "Confluence", "Jira", "Grafana", "Jenkins", "Docker", "BASH", "Microservices", "Rest APIs", "MongoDB"],
      link: "https://www.gov.uk/government/organisations/hm-revenue-customs",
      poster: "Placement Year as a Software Developer at HMRC.pdf",
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
