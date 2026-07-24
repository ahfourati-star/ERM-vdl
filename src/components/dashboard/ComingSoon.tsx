export function ComingSoon({ title, sub }: { title: string; sub: string }) {
  return (
    <>
      <div className="topbar">
        <h1>{title}</h1>
        <span className="sub">{sub}</span>
      </div>
      <div className="canvas">
        <div className="card">
          <h3>{title}</h3>
          <p className="muted">
            Cette page du tableau de bord arrive bientôt. On la construit juste après la Synthèse.
          </p>
        </div>
      </div>
    </>
  );
}
