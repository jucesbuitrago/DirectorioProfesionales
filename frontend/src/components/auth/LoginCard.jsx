import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TextField from '../ui/TextField.jsx';
import Button from '../ui/Button.jsx';
import { useToast } from '../ui/useToast.js';
import { apiLogin } from '../../api';

/**
 * LoginCard
 * - Dark, elegant minimal card with underlined inputs
 * - Decorative gradients (aria-hidden)
 * - a11y: labels, described-by, focus rings, aria-live errors
 * - Microinteractions per brief
 *
 * Usage: render inside a page container with class "auth-page"
 */
export default function LoginCard() {
  const navigate = useNavigate();
  const { show } = useToast();

  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [submitting, setSubmitting] = useState(false);

  // Field-level error messaging (inline)
  const [errors, setErrors] = useState({ email: '', password: '' });

  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: '', password: '' });
    setSubmitting(true);

    try {
      await apiLogin({ email: form.email, password: form.password });

      // Optional: persist longer if "remember" is checked
      // Current api.js persists token; here you could set a longer expiry if you had a cookie-based session.
      show({
        title: 'Bienvenido',
        message: 'Inicio de sesión exitoso',
      });

      // Per brief: Éxito → navegación a /app
      navigate('/app', { replace: true });
    } catch (err) {
      const status = err?.status;
      const message = err?.message || 'Error al iniciar sesión';

      // Inline errors: if 401 or validation
      if (status === 401) {
        setErrors((prev) => ({ ...prev, password: 'Credenciales inválidas' }));
      } else {
        // Try to attribute to a field if backend provided hints; fallback to email
        setErrors((prev) => ({ ...prev, email: prev.email || message }));
      }

      // Toast non-intrusive top-right
      show({
        title: 'No se pudo iniciar sesión',
        message,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card" role="group" aria-label="Formulario de inicio de sesión">
      {/* Decorative shapes */}
      <div className="auth-deco" aria-hidden="true">
        <div className="deco-top-left" />
        <div className="deco-bottom-right" />
      </div>

      {/* Logo/Title */}
      <h1 className="auth-title">Iniciar sesión</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
          autoComplete="email"
          error={errors.email}
          placeholder="tucorreo@ejemplo.com"
        />

        <TextField
          label="Contraseña"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
          autoComplete="current-password"
          error={errors.password}
          helperText="Consejo: usa Alt+P para mostrar/ocultar"
          enableToggle
        />

        {/* Actions row */}
        <div className="actions">
          <label htmlFor="remember" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={form.remember}
              onChange={onChange}
            />
            Recordarme
          </label>

          <Link className="muted-link" to="#" aria-label="¿Olvidaste tu contraseña?">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          loading={submitting}
          loadingText="Iniciando…"
          fullWidth
          aria-label="Iniciar sesión"
        >
          Iniciar sesión
        </Button>

        {/* Meta */}
        <div className="meta-row" style={{ textAlign: 'center' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="muted-link">
            Crear cuenta
          </Link>
        </div>
      </form>
    </div>
  );
}