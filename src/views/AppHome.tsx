"use client";

import {useEffect, useState} from "react";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion";

import "../styles.css";
import ResponsiveBackground from "../components/ResponsiveBackground";
import Nav from "../components/Nav";
import Section from "../components/Section";
import Hero from "../components/Hero";
import ExperienceCard from "../components/ExperienceCard";
import CertificationCard from "../components/CertificationCard";
import ProjectCard from "../components/ProjectCard";
import ScrollProgressBar from "../components/ScrollProgressBar";
import { profile } from "../data/profile";
import EducationCard from "../components/Education";
import TechPills from "../components/TechPills";
import { publicPath } from "../lib/publicPath";

export default function AppHome() {
  useStableHashScroll();
  
  const [allTech, setAllTech] = useState(() => {
    let allTech = new Map<string, boolean>();
    
    profile.certifications.flatMap(c => c.tech).forEach(t => allTech.set(t, false));
    profile.experience.flatMap(c => c.tech).forEach(t => allTech.set(t, false));
    profile.projects.flatMap(c => c.tech).forEach(t => allTech.set(t, false));
    profile.education.flatMap(c => c.tech).forEach(t => allTech.set(t, false));
        
    return new Map([...allTech.entries()].sort((a, b) => a[0].localeCompare(b[0]))).set("aws", true);
  });

  const toggleTech = (techToToggle: string) => {
    setAllTech(currentTech => {
      const newTech = new Map(currentTech);
      const currentState = newTech.get(techToToggle);
      
      newTech.set(techToToggle, !currentState);
      
      return newTech;
    });
  };

  return (
    <>
      <ResponsiveBackground />
      <ScrollProgressBar />
      <Nav resumeUrl={profile.resumeUrl}/>

      <Hero/>

      <Section id="about" title="About">
        <motion.article
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          <div className="card" style={{padding:"18px"}}>
            <p className="p m-0">
              {profile.summary}
            </p>
          </div>
        </motion.article>
      </Section>

      <Section id="skills" title="Skills">
        <h3 className="h5"> 
          Select those of interest
        </h3>

        <Masonry
          breakpointCols={{
            default: 2,
            1000: 1,
          }}
          className="masonry-grid"
          columnClassName="masonry-grid_column">

          {profile.techCategories.map(category => (
            <div className="card p-2 align-items-center" style={{padding:"18px"}} key={category.title}>
              <p className="p mb-1"> {category.title}</p>
              <TechPills displayTech={category.techList} allTech={allTech} toggleTech={toggleTech } justifyContent="center"/>
            </div>
          ))}

          <div className="card p-2 align-items-center" style={{padding:"18px"}}>
            <p className="p mb-1"> Other</p>
            <TechPills 
              displayTech={Array.from(allTech.keys()).filter(k => !profile.techCategories.flatMap(category => category.techList).includes(k))} 
              allTech={allTech} toggleTech={toggleTech} justifyContent="center"
            />
          </div>

          </Masonry>
      </Section>

      <Section id="experience" title="Experience">
        <div className="col">
            {profile.experience.map((e, i) => <ExperienceCard exp={e} key={i} allTech={allTech} toggleTech={toggleTech} />)}
        </div>
      </Section>

      <Section id="projects" title="Projects">
        <Masonry
          breakpointCols={{
            default: 2,
            1000: 1,
          }}
          className="masonry-grid"
          columnClassName="masonry-grid_column">
            {profile.projects.map((p, i) => <ProjectCard p={p} key={i} allTech={allTech} toggleTech={toggleTech} />)}
        </Masonry>
      </Section>

      <Section id="education" title="Education">
        <div className="col">
          {profile.education.map((ed, i) => <EducationCard ed={ed} allTech={allTech} toggleTech={toggleTech} key={i} />)}
        </div>
      </Section>

      <Section id="certifications" title="Certifications">
        <Masonry
          breakpointCols={{
            default: 4,
            1500: 3,
            1000: 2,
            400: 1,
          }}
          className="masonry-grid"
          columnClassName="masonry-grid_column">
            {profile.certifications.map((c, i) => <CertificationCard cert={c} key={i} allTech={allTech} toggleTech={toggleTech} />)}
        </Masonry>
      </Section>

      <Section id="contact" title="Contact">
        <div className="card p-3 align-items-center">
          <TechPills 
            displayTech={Array.from(allTech).filter(t => t[1] == true).map(t => t[0])} 
            allTech={allTech} toggleTech={toggleTech} justifyContent="center"
          />
          <span className="kbd kbd-m lbd-l p-2" style={{fontSize:27, color:"var(--text)"}}>Let’s talk:</span>

            <div className="btn-group pb-2" role="group">
              <a className="btn primary" style={{fontSize:".9rem"}} href={`mailto:${profile.email}`}>{profile.email}</a>
              <button className="btn glass" title="copy to clipboard" onClick={() => navigator.clipboard.writeText(profile.email)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="p-0 m-0 bi bi-copy" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
                </svg>
              </button>
            </div>

            <div style={{display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"center"}}>
              <a className="btn glass ps-0 pt-0 pb-0" style={{fontSize:".9rem"}} href={profile.linkedin} target="_blank" rel="noreferrer">
                <img
                  className="p-0 m-0"
                  src={publicPath("logos/LI.png")}
                  alt=""
                  width="42"
                  height="42"
                  loading="lazy" 
                  decoding="async"
                  style={{alignSelf:"center", borderRadius:"10px 0px 0px 10px", maxHeight:"1.8rem", maxWidth:"1.8rem"}}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                LinkedIn
              </a>
              <a className="btn glass ps-0 pt-0 pb-0" style={{fontSize:".9rem"}} href={profile.github} target="_blank" rel="noreferrer">
                <img
                  className="p-0 m-0"
                  src={publicPath("logos/GitHub.png")}
                  alt=""
                  width="42"
                  height="42"
                  loading="lazy" 
                  decoding="async"
                  style={{alignSelf:"center", borderRadius:"10px 0px 0px 10px", maxHeight:"1.8rem", maxWidth:"1.8rem"}}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                GitHub
              </a>
              <a className="btn glass ps-0 pt-0 pb-0" style={{fontSize:".9rem"}} href={profile.instagram} target="_blank" rel="noreferrer">
                <img
                  className="p-0 m-0"
                  src={publicPath("logos/insta.png")}
                  alt=""
                  width="42"
                  height="42"
                  loading="lazy" 
                  decoding="async"
                  style={{alignSelf:"center", borderRadius:"10px 0px 0px 10px", maxHeight:"1.8rem", maxWidth:"1.8rem"}}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                Insta
              </a>
            </div>
        </div>
        <p className="p" style={{marginTop:"10px"}}>© {new Date().getFullYear()} {profile.name}</p>
      </Section>
    </>
  );
}

function useStableHashScroll() {
  useEffect(() => {
    let observer: ResizeObserver | undefined;
    let stopTimer: number | undefined;
    let animationFrame: number | undefined;

    const alignWithHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const target = id && document.getElementById(id);
      if (!target) return;

      const previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      target.scrollIntoView({ block: "start" });
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    };

    const stabilizeHashPosition = () => {
      observer?.disconnect();
      window.clearTimeout(stopTimer);
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
      if (!window.location.hash) return;

      alignWithHash();
      animationFrame = requestAnimationFrame(alignWithHash);

      const page = document.getElementById("root");
      if (page) {
        observer = new ResizeObserver(() => {
          if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
          animationFrame = requestAnimationFrame(alignWithHash);
        });
        observer.observe(page);
      }

      // Masonry changes column count during hydration. Once that initial layout
      // has settled, stop following the hash so normal user scrolling takes over.
      stopTimer = window.setTimeout(() => observer?.disconnect(), 1500);
    };

    stabilizeHashPosition();
    window.addEventListener("hashchange", stabilizeHashPosition);

    return () => {
      window.removeEventListener("hashchange", stabilizeHashPosition);
      observer?.disconnect();
      window.clearTimeout(stopTimer);
      if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
    };
  }, []);
}
