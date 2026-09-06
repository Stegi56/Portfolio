import Link from "next/link";
import Nav from "../components/Nav";
import ResponsiveBackground from "../components/ResponsiveBackground";
import { profile } from "../data/profile";

export default function NotFound() {
  return (
    <>
      <ResponsiveBackground />
      <Nav resumeUrl={profile.resumeUrl} />
      <main className="not-found-page">
        <section className="container card overflow-hidden mt-2 p-0">
          <div className="row g-0">
            <div className="col-lg-7">
              <img
                className="d-block w-100 h-100 object-fit-cover"
                src="/confused-monkey.png"
                alt="A confused monkey looking into the distance"
                width="768"
                height="432"
              />
            </div>
            <div className="col-lg-5 d-flex align-items-center">
              <div className="p-4 p-md-5">
                <h2 className="display-1 kbd fw-bold lh-1 mb-1">404</h2>
                <h3 className="h1">This page has gone bananas</h3>
                <h3 className="p">Even monke does not know.</h3>
                <Link className="btn primary" href="/">Return home</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
