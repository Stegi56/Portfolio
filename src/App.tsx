import React from "react";
import "./styles.css";
import LowPolyBackground from "./components/LowPolyBackground";
import Nav from "./components/Nav";
import Section from "./components/Section";
import Hero from "./components/Hero";
import ExperienceCard from "./components/ExperienceCard";
import ProjectCard from "./components/ProjectCard";
import ScrollProgressBar from "./components/ScrollProgressBar";
import { profile } from "./data/profile";

export default function App() {
  return (
    <>
      <LowPolyBackground
        speed={2.5}        // slower animation
        wobble={15}         // stronger vertex wobble
        parallax={12}      // stronger mouse shift
        glow={0.2}        // brighter near cursor
        glowRadius={200}   // larger glow area
        cols={24}
        rows={16}
        dprCap={3}         // tame high-DPI cost
        from={{ r: 45, g: 58, b: 99 }}
        to={{ r: 70, g: 58, b: 140 }}
      />
      <ScrollProgressBar />
      <Nav
        links={[
          { id: "about", label: "About" },
          { id: "experience", label: "Experience" },
          { id: "projects", label: "Projects" },
          { id: "skills", label: "Skills" },
          { id: "contact", label: "Contact" },
        ]}
        github={profile.github}
        linkedin={profile.linkedin}
        resumeUrl={profile.resumeUrl}
      />
      <Hero />

      <Section id="about" title="About">
        <div className="card" style={{padding:"18px"}}>
          <p className="p" style={{margin:0}}>
            {profile.summary}
          </p>
        </div>
      </Section>

      <Section id="experience" title="Experience" subtitle="Highlights from my recent roles">
        <div className="grid">
          {profile.experience.map((e, i) => <ExperienceCard exp={e} key={i} />)}
        </div>
      </Section>

      <Section id="projects" title="Projects" subtitle="Selected work & OSS">
        <div className="grid">
          {profile.projects.map((p, i) => <ProjectCard p={p} key={i} />)}
        </div>
      </Section>

      <Section id="skills" title="Skills" subtitle="What I use day‑to‑day">
        <div className="card" style={{padding:"18px"}}>
          <div style={{display:"flex", flexWrap:"wrap", gap:"10px"}}>
            {profile.skills.map(s => <span className="chip" key={s}>{s}</span>)}
          </div>
        </div>
      </Section>

      <Section id="contact" title="Contact">
        <div className="card" style={{padding:"18px", display:"flex", flexWrap:"wrap", gap:"12px", alignItems:"center"}}>
          <span className="kbd">Let’s talk:</span>
          <a className="btn primary" href={`mailto:${profile.email}`}>{profile.email}</a>
          <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="btn" href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <p className="p" style={{marginTop:"10px"}}>© {new Date().getFullYear()} {profile.name}</p>
      </Section>
    </>
  );
}
