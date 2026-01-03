import { motion } from "framer-motion";

import type { Blog } from "../typeDefs/blog";

export default function BlogPeekCard({ blog}: { blog: Blog}) {


  return (
    <motion.article
      className="btn card mb-3"
      onClick={() => { window.location.href = `/blog/${blog.slug}`; }}
      style={{ padding: "16px", display: "grid", gap: "10px" }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "clamp(.2rem, 0.2vw + .3rem, 12px)", textAlign:"start" }}>
        <img
          src={blog.cover}
          key={blog.slug}
          height="60"
          loading="lazy" 
          decoding="async"
          style={{alignSelf:"center"}}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div style={{ flex: 1, minWidth: 150, maxWidth:"80%"}}>
          <strong style={{ fontWeight: 700 }}>{blog.title}</strong>
          <div><i className="mb-0 italic" style={{ color:"var(--muted)" }}>{blog.length}</i></div>
        </div>
        <span className="kbd kbd-s ps-0 ms-0" style={{ flex: 1, minWidth: 60, maxWidth:"20%" ,color: "var(--muted)", textAlign:"end"}}>{blog.date}</span>
      </div>
    </motion.article>
  );
}
