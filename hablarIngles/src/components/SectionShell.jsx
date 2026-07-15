export default function SectionShell({ title, description, children, id }) {
  return (
    <section id={id} className="section-shell">
      <div className="section-head">
        <div>
          <p className="section-label">{title}</p>
          <h2>{description}</h2>
        </div>
      </div>
      {children}
    </section>
  )
}