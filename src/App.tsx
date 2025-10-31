import { Routes, Route, HashRouter } from "react-router-dom";
import AppHome from "./pages/AppHome";
import BlogList from "./pages/BlogList";
import Blog from "./pages/Blog";
import { StrictMode } from "react";

export default function App() {
  return (
    <StrictMode>
      <HashRouter>
        <Routes>
          <Route path="/" element={<AppHome />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<Blog />} />
        </Routes>
      </HashRouter>
    </StrictMode>
  );
}
