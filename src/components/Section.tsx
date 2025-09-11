import { motion } from "framer-motion";
import React from "react";

export default function Section(props: { id: string; title: string; children: React.ReactNode; subtitle?: string }) {
  const { id, title, subtitle, children } = props;
  return (
    <section id={id} className="section pt-2 pb-4">
      <div className="container ps-0 pe-0">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="h2 mb-1" style={{background:"var(--header)",WebkitBackgroundClip:"text",color:"transparent"}}>{title}</h2>
          {subtitle && <p className="p" style={{marginTop:4}}>{subtitle}</p>}
          <hr className="sep mt-0" />
        </motion.header>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
