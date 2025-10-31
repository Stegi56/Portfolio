export type Education = {
  title: string;
  grade: string;
  logo: string;
  institution: string;
  link: string;
  start: string; // "Mar 2022"
  end: string;   // "Present" or "Aug 2024"
  bullets: string[];
  certificate?: string; // URL or path to certificate PDF
  tech: string[];
}

export type Certification = {
  name: string;
  image: string; // URL or path to logo image
  certificate?: string; // URL or path to certificate PDF
  issuer: string;
  link?: string;
  issueDate: string; // "2023-08"
  tech: string[];
}

export type Experience = {
  company: string;
  logo: string; // URL or path to logo image
  role: string;
  start: string; // "Mar 2022"
  end: string;   // "Present" or "Aug 2024"
  bullets: string[];
  tech: string[];
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