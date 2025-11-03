import { useData } from 'vike-react/useData'
import type { Data } from './+data'

export default function Page() {
  const { Content } = useData<Data>()

  return (
    <>
      <section className=" container mb-2 pt-3 ps-0 pe-0 pb-2" style={{backdropFilter:"blur(10px)"}}>
        <div
          className="card mb-3"
          style={{ padding: "16px", color: "var(--text)" }}
        >
          <Content />
        </div>
      </section>
    </>
  )
}
