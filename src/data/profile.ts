import type { Education, Certification, Experience, Project, TechCategory } from "../typeDefs/profile";

export const profile = {
  name: "Joel Staugaitis",                  
  headline: "Software Engineer",
  location: "United Kingdom & EU",      
  email: "56rolsj@gmail.com",             
  linkedin: "https://www.linkedin.com/in/stegi56/",
  instagram: "https://www.instagram.com/stegi__56",
  github: "https://github.com/stegi56",
  resumeUrl: "Joel Staugaitis.pdf", 
  summary:
    "A generalist who frequently deep dives into new libraries, frameworks, methodologies and languages. Has experience engineering for a platform that serves 45+ million users and providing tech leadership to a new charity.",
  education: <Education[]>[
    {
      title: 'BSc Computer Science',
      grade: '1st Class Honours & Recipient of the "Best BSc Student Prize"',
      institution: "City, University of London",
      link: "https://city.ac.uk/",
      start: "Sep 2021",
      end: "Jul 2025",
      certificate: "certificates/1752672801343.pdf",
      logo: "logos/output-onlinepngtools.png",
      bullets: [
        '"Best BSc Student Prize" for ranking #1 at graduation',
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
      tech: ["Terraform", "IaC", "Vault", "DevOps", "BASH"],
      link: "https://developer.hashicorp.com/certifications/infrastructure-automation"
    },
    {
      name: "GitLab CI Fundamentals",
      image: "logos/gitlab-logo-500-rgb.png",
      certificate: "certificates/1757078512263.pdf",
      issuer: "GitLab",
      issueDate: "2025-09",
      tech: ["GitLab", "CI/CD", "DevOps", "BASH"],
      link: "https://university.gitlab.com/learning-paths/gitlab-ci-fundamentals"
    },
    {
      name: "HashiCorp Certified: Vault Associate",
      image: "logos/vault badge.png",
      certificate: "certificates/vault.pdf",
      issuer: "HashiCorp",
      issueDate: "2025-10",
      tech: ["Vault", "DevOps", "Data Security", "Security Automation"],
      link: "https://developer.hashicorp.com/certifications/security-automation"
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
        "Delivering to a public sector client."
      ],
      tech: ["aws","Terraform","GitLab", "CI/CD", "BASH", "Java", "Vault"],
      link: "https://www.cgi.com/uk/en-gb",
    },
    {
      company: "He Is Real Charity",
      logo: "logos/heisreal.png",
      role: "Volunteer Software Engineer",
      start: "May 2025",
      end: "July 2025",
      bullets: [
       "Tech Lead: Provided consultation to the project owner to set informed priorities based on budget and time frame, yielding zero project overrun.",
       "DevOps & Backend: Made a pipeline and configured infrastructure for public file upload, review and display.",
       "Frontend: Implemented web components so infrastructure can be glued via embed links onto a Squarespace site."
      ],
      tech: ["aws","GitHub Actions","React","TypeScript", "JavaScript",  "CI/CD", "REST APIs","Next.js", "Bunny.net", "GCP", "DynamoDB"],
      link: "https://heisreal.today",
    },
    {
      company: "HM Revenue & Customs",
      logo: "logos/hmrc.png",
      role: "Software Developer",
      start: "Oct 2023",
      end: "Aug 2024",
      bullets: [
        "Role: Developed on team Platform Operations on the Multi-Channel Digital Tax Platform (MDTP), responsible for DevOps, paved road, aws, observability, scalability and CI/CD at HMRC.",
        "SPIKEs: Conducted investigations, one identified 100+ abandoned microservices for removal across HMRC.",
        "Automations: Improved visibility and enforcement of platform opinions to prevent future need for an investigations.",
        "Microservices: Constructed new fallbacks and expanded backend microservices.",
        "DevOps: Managed aws infrastructure.",
        "Frontend: Contributed to the frontend for a self-service Catalogue tool."
      ],
      tech: ["Scala", "GitHub", "aws", "Play", "Terraform", "Confluence", "Code Review", "Jira", "CI/CD","JavaScript", "Grafana", "Jenkins", "Docker", "BASH", "Microservices", "REST APIs", "MongoDB", "Linux", "DevOps"],
      link: "https://www.gov.uk/government/organisations/hm-revenue-customs",
      poster: "Placement Year as a Software Developer at HMRC.pdf",
    }
  ],
  projects: <Project[]>[
    {
      name: "ZeroCam",
      logo: "logos/zerocam.png",
      description: "Developed an embedded dashcam system for Raspberry Pi, with cloud features such as streaming and cloud backup. Contributed to the Tauri open-source community in the process. ",
      repo: "https://github.com/Stegi56/ZeroCam",
      embed: '<iframe src="https://www.youtube.com/embed/hgGenb6m6fY?si=VgECMOTRG2hlCbff" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
      tech: ["Rust", "Tauri", "React", "TypeScript", "FFmpeg", "MediaMTX", "Raspberry Pi", "Cloudflare", "Linux"],
    },
    {
      name: "Face Covering Detection",
      description: "Built a computer vision pipeline to select faces and highlight incorrectly worn facemasks.",
      photo: "demos/mask detection.png",
      repo: "https://github.com/Stegi56/Face-Covering-Detection",
      tech: ["OpenCV", "Python", "Machine Learning", "Computer Vision", "Scikit-image", "NumPy", "matplotlib"],
    },
    {
      name: "ChatEz",
      logo: "logos/chatez.png",
      description: " Built a real-time, scalable web chat application.",
      repo: "https://github.com/ChatEz-Project",
      embed: '<iframe src="https://www.youtube.com/embed/3TdlD8Ei-GY?si=RDEWMA05RiDoTTnR" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
      tech: ["Node.js", "React", "TypeScript", "JavaScript", "Code Review", "CI/CD","Firebase", "MongoDB", "GCP", "WebSockets", "REST APIs"], 
    },
    {
      name: "Bob",
      description: "Created a platform game “Bob”.",
      embed: '<iframe src="https://www.youtube.com/embed/xg0nEpYkc2w?si=Ikpy2SrWjRXQRDdS" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
      tech: ["Java", "Swing UI", "OOAD"],
    },
    {
      name: "League of Legends Analytics",
      logo: "logos/league.png",
      description: "Made a tool that gets match data to provide post-match performance analysis",
      embed: '<iframe width="560" height="315" src="https://www.youtube.com/embed/wg3HJdyKrVg?si=me1_7p9EpbMllM0H" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
      about: "Joelis Staugaitis NEA - Lol Analytics.pdf",
      tech: ["Python", "TKinter", "matplotlib", "NumPy", "REST APIs"],
    },
    {
      name: "Regression Body Fat Estimator",
      logo: "logos/body fat estimator.jpg",
      description: "Made a ML model and app for body fat estimation.",
      repo: "https://github.com/Stegi56/Body-Fat-Estimator",
      about: "https://www.linkedin.com/feed/update/urn:li:activity:7083426688864276480/",
      video: "demos/Body Fat Estimator.mp4",
      tech: ["Python", "TensorFlow", "Android Studio", "Java", "NumPy", "Pandas", "matplotlib"],
    },
  ],
  techCategories: <TechCategory[]>[
    {
      title: "Languages",
      techList: [
        "Rust", "Java", "Scala", "BASH", "C++", "Haskell", "JavaScript", "TypeScript",
        "Python"
      ]
    },
    {
      title: "Frameworks",
      techList: [
        "Tauri", "React", "Next.js", "Play"
      ]
    },
    {
      title: "Data",
      techList: [
        "SQL", "MongoDB", "DynamoDB"
      ]
    },    
    {
      title: "DevOps",
      techList: [
        "aws", "Cloudflare", "Bunny.net", "CI/CD", "Docker", "GitHub Actions", "GitLab",
        "GCP", "Firebase", "Jenkins", "IaC", "Terraform", "Vault",
      ]
    },
    {
      title: "AI & Modeling",
      techList: [
        "matplotlib", "OpenCV", "NumPy", "TensorFlow", "Pandas", "Scikit-image"
      ]
    },
    {
      title: "Codecs",
      techList: [
        "FFmpeg", "MediaMTX"
      ]
    }
  ]
};
