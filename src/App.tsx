import React from "react";
import Masonry from "react-masonry-css";

import "./styles.css";
import LowPolyBackground from "./components/LowPolyBackground";
import Nav from "./components/Nav";
import Section from "./components/Section";
import Hero from "./components/Hero";
import ExperienceCard from "./components/ExperienceCard";
import CertificationCard from "./components/CertificationCard";
import ProjectCard from "./components/ProjectCard";
import ScrollProgressBar from "./components/ScrollProgressBar";
import { profile } from "./data/profile";
import { useTitleCarousel } from './hooks/useTitleCarousel';
import EducationCard from "./components/Education";


export default function App() {
  const carouselTitle = profile.name + " - " + profile.headline;

  useTitleCarousel(carouselTitle, 200);

  return (
    <>
      <LowPolyBackground
        speed={2.5}        // slower animation
        wobble={15}        // stronger vertex wobble
        parallax={25}      // stronger mouse shift
        glow={0.2}         // brighter near cursor
        glowRadius={150}   // larger glow area
        cols={24}
        rows={16}
        dprCap={2}         // tame high-DPI cost
        from={{ r: 45, g: 58, b: 99 }}
        to={{ r: 70, g: 58, b: 140 }}
      />
      <ScrollProgressBar />
      <Nav
        links={[
          { id: "experience", label: "Experience" },
          { id: "skills", label: "Skills" },
          { id: "contact", label: "Contact" },
        ]}
        github={profile.github}
        linkedin={profile.linkedin}
        resumeUrl={profile.resumeUrl}
      />
      <Hero/>

      <Section id="about" title="About">
        <div className="card" style={{padding:"18px"}}>
          <p className="p m-0">
            {profile.summary}
          </p>
        </div>
      </Section>

      <Section id="experience" title="Experience">
        <Masonry
          breakpointCols={{
            default: 2,
            1000: 1,
          }}
          className="masonry-grid"
          columnClassName="masonry-grid_column">
            {profile.experience.map((e, i) => <ExperienceCard exp={e} key={i} />)}
        </Masonry>
      </Section>

      <Section id="projects" title="Projects">
        <div className="grid">
          {profile.projects.map((p, i) => <ProjectCard p={p} key={i} />)}
        </div>
      </Section>

      <Section id="skills" title="Skills">
        <h5> 
          Select those of interest
        </h5>
        <div className="card" style={{padding:"18px"}}>
          <div style={{display:"flex", flexWrap:"wrap", gap:"10px"}}>
            {profile.skills.map(s => <span className="chip" key={s}>{s}</span>)}
          </div>
        </div>
      </Section>

      <Section id="certifications" title="Certifications">
        <Masonry
          breakpointCols={{
            default: 3,
            1000: 2,
            400: 1,
          }}
          className="masonry-grid"
          columnClassName="masonry-grid_column">
            {profile.certifications.map((c, i) => <CertificationCard cert={c} key={i} />)}
        </Masonry>
      </Section>

      <Section id="education" title="Education">
        <div className="col">
          {profile.education.map((ed, i) => <EducationCard ed={ed} key={i} />)}
        </div>
      </Section>

      <div data-iframe-width="150" data-iframe-height="270" data-share-badge-id="5f551af6-ca28-4186-97a4-e646d0e27d46" data-share-badge-host="https://www.credly.com"></div><script type="text/javascript" async src="//cdn.credly.com/assets/utilities/embed.js"></script>


      <Section id="contact" title="Contact">
        <div className="card" style={{padding:"18px", display:"flex", flexWrap:"wrap", gap:"12px", alignItems:"center"}}>
          <span className="kbd fs-6" style={{color:"var(--text)"}}>Let’s talk:</span>
          <a className="btn primary" href={`mailto:${profile.email}`}>{profile.email}</a>
          <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="btn" href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <p className="p" style={{marginTop:"10px"}}>© {new Date().getFullYear()} {profile.name}</p>
      </Section>
    </>
  );
}
