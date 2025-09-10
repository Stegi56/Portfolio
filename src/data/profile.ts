import { i } from "framer-motion/client";

export type Certification = {
  name: string;
  image: string; // URL or path to logo image
  certificate: string; // URL or path to certificate PDF
  issuer: string;
  issueDate: string; // "2023-08"
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
    "A keen generalist who enjoys staying up to date with the latest tech, experimenting with new libraries, frameworks and languages. I take pride in delivering solutions that balance performance, complexity/maintainability and cost.",
  skills: [
    "TypeScript","React","Node.js"
  ],
  certifications: <Certification[]>[
    {
      name: "AWS Certified Cloud Practitioner",
      image: "/logos/aws-certified-cloud-practitioner.png",
      certificate: "/certificates/1754427503415.pdf",
      issuer: "Amazon Web Services",
      issueDate: "2025-08",
    },
    {
      name: "HashiCorp Certified: Terraform Associate",
      image: "/logos/TQ968292686GB.png",
      certificate: "/certificates/TerraformAssociate00320250909-30-zjhxev.pdf",
      issuer: "HashiCorp",
      issueDate: "2025-09",
    },
    {
      name: "GitLab CI Fundamentals",
      image: "/logos/gitlab-logo-500-rgb.png",
      certificate: "certficates/1757078512263.pdf",
      issuer: "GitLab",
      issueDate: "2025-09",
    },
    {
      name: "1st Class Honours BSc Computer Science",
      image: "/logos/output-onlinepngtools.png",
      certificate: "certficates/1757078512263.pdf",
      issuer: "City, University of London",
      issueDate: "2025-07",
    },
  ],
  experience: <Experience[]>[
    {
      company: "CGI",
      logo: "/logos/CGI_2.png",
      role: "Consultant Software Engineer",
      start: "Jul 2025",
      end: "Present",
      bullets: [
        "Delivering infrastructure for a public sector client using AWS, Terraform, GitLab and CI/CD."
      ],
      tech: ["aws","Terraform","GitLab", "CI/CD"],
      link: "https://example.com"
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
    },
    {
      company: "HM Revenue & Customs",
      logo: "/logos/hmrc.png",
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
