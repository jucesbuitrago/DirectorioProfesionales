import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TextField from '../ui/TextField.jsx';
import Button from '../ui/Button.jsx';
import { useToast } from '../ui/useToast.js';
import { apiRegister } from '../../api';

/**
 * RegisterCard
 * - Mirrors the LoginCard dark, elegant minimal card UI
 * - Removes duplicated fields when registering as professional
 *   (reuses account email/phone/city; only asks profession, barrio, description)
 * - Validates required fields, shows inline errors and toasts
 *
 * Usage: render inside a page container with class "auth-page"
 */
export default function RegisterCard() {
  const navigate = useNavigate();
  const { show } = useToast();

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    city: '',
    isProfessional: false,
  });

  const [prof, setProf] = useState({
    profesion_principal: '',
    barrio: '',
    descripcion_breve: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    full_name: '',
    profesion_principal: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, checked, value } = e.target;
    if (name === 'isProfessional') {
      setForm((f) => ({ ...f, isProfessional: checked }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onProfChange = (e) => {
    const { name, value } = e.target;
    setProf((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const next = {
      email: '',
      password: '',
      full_name: '',
      profesion_principal: '',
    };

    if (!form.email.trim()) next.email = 'Ingresa tu email';
    if (!form.password || form.password.length < 6) next.password = 'Mínimo 6 caracteres';

    if (form.isProfessional) {
      if (!form.full_name.trim()) next.full_name = 'Requerido para tu perfil profesional';
      if (!prof.profesion_principal.trim()) next.profesion_principal = 'Indica tu profesión principal';
    }

    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim() || undefined,
        phone: form.phone.trim() || undefined,
        city: form.city.trim() || undefined,
        is_professional: form.isProfessional,
        professional: form.isProfessional
          ? {
              // Reuse account fields to avoid duplication
              nombre_completo: form.full_name.trim(),
              profesion_principal: prof.profesion_principal.trim(),
              ciudad: form.city.trim() || undefined,
              barrio: prof.barrio.trim() || undefined,
              telefono: form.phone.trim() || undefined,
              descripcion_breve: prof.descripcion_breve.trim() || undefined,
              // email is omitted so backend can default to account email
            }
          : null,
      };

      await apiRegister(payload);

      show({
        title: 'Cuenta creada',
        message: 'Tu registro fue exitoso, ahora inicia sesión.',
      });

      navigate('/login', { replace: true });
    } catch (err) {
      const status = err?.status;
      const message = err?.message || 'No se pudo registrar';

      if (status === 409) {
        setErrors((prev) => ({ ...prev, email: 'Este email ya está registrado' }));
      }

      show({
        title: 'No se pudo registrar',
        message,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card" role="group" aria-label="Formulario de registro">
      {/* Decorative shapes */}
      <div className="auth-deco" aria-hidden="true">
        <div className="deco-top-left" />
        <div className="deco-bottom-right" />
      </div>

      {/* Title */}
      <h1 className="auth-title">Crear cuenta</h1>

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
          autoComplete="new-password"
          error={errors.password}
          helperText="Mínimo 6 caracteres. Usa Alt+P para mostrar/ocultar"
          enableToggle
        />

        <TextField
          label="Nombre completo"
          name="full_name"
          type="text"
          value={form.full_name}
          onChange={onChange}
          placeholder="Opcional"
          error={errors.full_name}
          helperText={form.isProfessional ? 'Requerido si ofreces servicios' : 'Opcional'}
        />

        <TextField
          label="Teléfono"
          name="phone"
          type="text"
          value={form.phone}
          onChange={onChange}
          placeholder="Opcional"
          autoComplete="tel"
        />

        <TextField
          label="Ciudad"
          name="city"
          type="text"
          value={form.city}
          onChange={onChange}
          placeholder="Opcional"
          autoComplete="address-level2"
        />

        {/* Professional toggle */}
        <div className="actions">
          <label htmlFor="isProfessional" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <input
              id="isProfessional"
              name="isProfessional"
              type="checkbox"
              checked={form.isProfessional}
              onChange={onChange}
            />
            Ofrecer mi servicio (registrar como profesional)
          </label>
          <span />
        </div>

        {/* Professional extra fields (no duplicates) */}
        {form.isProfessional && (
          <div className="mt-3" role="group" aria-label="Datos del profesional">
            <TextField
              label="Profesión principal"
              name="profesion_principal"
              type="text"
              value={prof.profesion_principal}
              onChange={onProfChange}
              required
              error={errors.profesion_principal}
            />

            <TextField
              label="Barrio"
              name="barrio"
              type="text"
              value={prof.barrio}
              onChange={onProfChange}
              placeholder="Opcional"
            />

            <div className="textfield">
              <label className="textfield-label" htmlFor="descripcion_breve">Descripción breve</label>
              <div className="textfield-control">
                <textarea
                  id="descripcion_breve"
                  name="descripcion_breve"
                  rows={4}
                  className="textfield-input"
                  placeholder="Opcional"
                  value={prof.descripcion_breve}
                  onChange={onProfChange}
                />
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          loading={submitting}
          loadingText="Registrando…"
          fullWidth
          aria-label="Registrarme"
        >
          Registrarme
        </Button>

        <div className="meta-row" style={{ textAlign: 'center' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="muted-link">
            Inicia sesión
          </Link>
        </div>
      </form>
    </div>
  );
}