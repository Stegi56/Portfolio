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
  logo?: string;
  description: string;
  bullets?: string[];
  tech: string[];
  photo?: string;
  video?: string;
  embed?: string;
  repo?: string;
  about?: string;
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
    "A keen generalist who enjoys staying up to date with the latest tech, experimenting with new libraries, frameworks and languages. Has experience engineering for a platform that serves 45+ million users.",
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
      tech: ["aws", "DevOps"],
      link: "https://aws.amazon.com/certification/certified-cloud-practitioner/"
    },
    {
      name: "HashiCorp Certified: Terraform Associate",
      image: "logos/TQ968292686GB.png",
      certificate: "certificates/TerraformAssociate00320250909-30-zjhxev.pdf",
      issuer: "HashiCorp",
      issueDate: "2025-09",
      tech: ["Terraform", "IaC", "Vault", "DevOps"],
      link: "https://developer.hashicorp.com/certifications/infrastructure-automation"
    },
    {
      name: "GitLab CI Fundamentals",
      image: "logos/gitlab-logo-500-rgb.png",
      certificate: "certificates/1757078512263.pdf",
      issuer: "GitLab",
      issueDate: "2025-09",
      tech: ["GitLab", "CI/CD", "DevOps"],
      link: "https://university.gitlab.com/learning-paths/gitlab-ci-fundamentals"
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
        "Constructed pipelines and new fallbacks",
        "Managed infrastructure via Terraform",
        "Made automations to enforce platform opinions",
        "Using Scala, worked on micro-services and frontend of a Catalogue tool. "
      ],
      tech: ["Scala", "aws", "terraform", "Confluence", "Jira", "Grafana", "Jenkins", "Docker", "BASH", "Microservices", "Rest APIs", "MongoDB", "Linux"],
      link: "https://www.gov.uk/government/organisations/hm-revenue-customs",
      poster: "Placement Year as a Software Developer at HMRC.pdf",
    }
  ],
  projects: <Project[]>[
    {
      name: "ZeroCam",
      logo: "logos/zerocam.png",
      description: "Developed an embedded dashcam system in Rust with Tauri and REACT for Raspberry Pi, with cloud features such as streaming and cloud backup. Contributed to the Tauri open-source community in the process. ",
      repo: "https://github.com/Stegi56/ZeroCam",
      embed: '<iframe src="https://www.youtube.com/embed/hgGenb6m6fY?si=VgECMOTRG2hlCbff" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
      tech: ["Rust", "Tauri", "React", "TypeScript", "FFmpeg", "MediaMTX", "Raspberry Pi", "Cloudflare", "Linux"],
    },
    {
      name: "Face Covering Detection",
      description: "Built a Python computer vision pipeline to select faces and highlight incorrectly worn facemasks.",
      photo: "demos/mask detection.png",
      repo: "https://github.com/Stegi56/Face-Covering-Detection",
      tech: ["OpenCV", "Python", "Machine Learning", "Computer Vision", "Scikit-image", "NumPy", "matplotlib"],
    },
    {
      name: "ChatEz",
      logo: "logos/chatez.png",
      description: " Built a real-time, scalable web chat application using (Node.js + REACT), deployed on Google Cloud. Employed APIs for translation + AI summary features and utilised Firebase PaaS.",
      repo: "https://github.com/ChatEz-Project",
      embed: '<iframe src="https://www.youtube.com/embed/3TdlD8Ei-GY?si=RDEWMA05RiDoTTnR" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
      tech: ["Node.js", "React", "TypeScript", "JavaScript", "Firebase", "MongoDB", "Google Cloud Platform", "WebSockets", "REST APIs"], 
    },
    {
      name: "Bob",
      description: "Created a platform game “Bob” using a variation of the box2D engine in Java.",
      embed: '<iframe src="https://www.youtube.com/embed/xg0nEpYkc2w?si=Ikpy2SrWjRXQRDdS" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
      tech: ["Java", "Swing UI", "OOAD"],
    },
    {
      name: "League of Legends Analytics",
      logo: "logos/league.png",
      description: "Made a tool that gets match data to provide post-match performance analysis",
      embed: '<iframe width="560" height="315" src="https://www.youtube.com/embed/wg3HJdyKrVg?si=me1_7p9EpbMllM0H" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
      about: "Joelis Staugaitis NEA - Lol Analytics.pdf",
      tech: ["Python", "TKinter", "Matplotlib", "Numpy", "REST APIs"],
    },
    {
      name: "Regression Body Fat Estimator",
      logo: "logos/body fat estimator.jpg",
      description: "Made a ML model for body fat estimation using TensorFlow.",
      repo: "https://github.com/Stegi56/Body-Fat-Estimator",
      about: "https://www.linkedin.com/feed/update/urn:li:activity:7083426688864276480/",
      video: "demos/Body Fat Estimator.mp4",
      tech: ["Python", "TensorFlow", "Android Studio", "Java", "NumPy", "Pandas", "matplotlib"],
    },
  ]
};
