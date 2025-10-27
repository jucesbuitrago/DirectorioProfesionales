import { Link } from 'react-router-dom';


export default function Landing() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--txt)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg)', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <nav
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Link to="/" style={{ color: 'var(--txt)', textDecoration: 'none', fontWeight: 700, letterSpacing: '-0.01em' }}>
            TuApp
          </Link>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/login" className="btn" style={{ color: '#fff', background: 'rgba(255,255,255,.06)' }}>
              Iniciar sesión
            </Link>
            <Link to="/register" className="btn btn-primary">
              Crear cuenta
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 16 }}>
        <section
          style={{
            width: 'min(920px, 94vw)',
            textAlign: 'center',
            display: 'grid',
            gap: 16,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(28px, 4.6vw, 48px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontWeight: 700,
            }}
          >
            Conecta con profesionales y obtén ayuda al instante
          </h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 'clamp(16px, 2.6vw, 18px)' }}>
            Nuestra plataforma te permite conversar y coordinar servicios de forma sencilla, segura y rápida.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary">
              Comenzar ahora
            </Link>
            <Link to="/login" className="btn" style={{ color: '#fff', background: 'rgba(255,255,255,.06)' }}>
              Ya tengo cuenta
            </Link>
          </div>

          {/* Decorative blur background using existing auth tokens */}
          <div aria-hidden="true" style={{ position: 'relative', height: 0 }}>
            <div
              style={{
                position: 'absolute',
                inset: '-120px auto auto -120px',
                width: 360,
                height: 360,
                background:
                  'radial-gradient(closest-side, color-mix(in oklab, var(--primary) 15%, transparent) 0%, transparent 65%)',
                filter: 'blur(6px)',
                opacity: 0.55,
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 'auto -140px -140px auto',
                width: 420,
                height: 420,
                background:
                  'radial-gradient(closest-side, color-mix(in oklab, var(--primary) 10%, transparent) 0%, transparent 70%)',
                filter: 'blur(8px)',
                opacity: 0.45,
                pointerEvents: 'none',
              }}
            />
          </div>
        </section>
      </main>

      <footer style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted)', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        © {new Date().getFullYear()} TuApp
      </footer>
    </div>
  );
}