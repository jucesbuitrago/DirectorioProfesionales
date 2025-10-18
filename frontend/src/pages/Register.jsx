import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRegister } from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [isProfessional, setIsProfessional] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    city: '',
  });

  const [profForm, setProfForm] = useState({
    nombre_completo: '',
    profesion_principal: '',
    ciudad: '',
    barrio: '',
    telefono: '',
    email: '',
    descripcion_breve: '',
  });

  const onUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm((f) => ({ ...f, [name]: value }));
  };

  const onProfChange = (e) => {
    const { name, value } = e.target;
    setProfForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...userForm,
        is_professional: isProfessional,
        professional: isProfessional
          ? {
              nombre_completo: profForm.nombre_completo,
              profesion_principal: profForm.profesion_principal,
              ciudad: profForm.ciudad || undefined,
              barrio: profForm.barrio || undefined,
              telefono: profForm.telefono || undefined,
              email: profForm.email || undefined,
              descripcion_breve: profForm.descripcion_breve || undefined,
            }
          : null,
      };

      await apiRegister(payload);
      // Success: go to login
      navigate('/login');
    } catch (err) {
      setError(err?.message || 'Error en el registro');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '32px auto', padding: 16 }}>
      <h2>Registro</h2>
      <form onSubmit={onSubmit}>
        <fieldset style={{ border: '1px solid #ddd', padding: 16, marginBottom: 16 }}>
          <legend>Datos de cuenta</legend>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={userForm.email}
              onChange={onUserChange}
              style={{ display: 'block', width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              value={userForm.password}
              onChange={onUserChange}
              style={{ display: 'block', width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="full_name">Nombre completo</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={userForm.full_name}
              onChange={onUserChange}
              placeholder="Opcional"
              style={{ display: 'block', width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="phone">Teléfono</label>
            <input
              id="phone"
              name="phone"
              type="text"
              value={userForm.phone}
              onChange={onUserChange}
              placeholder="Opcional"
              style={{ display: 'block', width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="city">Ciudad</label>
            <input
              id="city"
              name="city"
              type="text"
              value={userForm.city}
              onChange={onUserChange}
              placeholder="Opcional"
              style={{ display: 'block', width: '100%', padding: 8 }}
            />
          </div>
        </fieldset>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={isProfessional}
              onChange={(e) => setIsProfessional(e.target.checked)}
            />
            Ofrecer mi servicio (registrar como profesional)
          </label>
        </div>

        {isProfessional && (
          <fieldset style={{ border: '1px solid #ddd', padding: 16, marginBottom: 16 }}>
            <legend>Datos del profesional</legend>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="nombre_completo">Nombre completo</label>
              <input
                id="nombre_completo"
                name="nombre_completo"
                type="text"
                required
                value={profForm.nombre_completo}
                onChange={onProfChange}
                style={{ display: 'block', width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="profesion_principal">Profesión principal</label>
              <input
                id="profesion_principal"
                name="profesion_principal"
                type="text"
                required
                value={profForm.profesion_principal}
                onChange={onProfChange}
                style={{ display: 'block', width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="ciudad">Ciudad</label>
              <input
                id="ciudad"
                name="ciudad"
                type="text"
                value={profForm.ciudad}
                onChange={onProfChange}
                placeholder="Opcional"
                style={{ display: 'block', width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="barrio">Barrio</label>
              <input
                id="barrio"
                name="barrio"
                type="text"
                value={profForm.barrio}
                onChange={onProfChange}
                placeholder="Opcional"
                style={{ display: 'block', width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                name="telefono"
                type="text"
                value={profForm.telefono}
                onChange={onProfChange}
                placeholder="Opcional"
                style={{ display: 'block', width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="prof_email">Email de contacto</label>
              <input
                id="prof_email"
                name="email"
                type="email"
                value={profForm.email}
                onChange={onProfChange}
                placeholder="Opcional (por defecto usa el email de cuenta)"
                style={{ display: 'block', width: '100%', padding: 8 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="descripcion_breve">Descripción breve</label>
              <textarea
                id="descripcion_breve"
                name="descripcion_breve"
                value={profForm.descripcion_breve}
                onChange={onProfChange}
                placeholder="Opcional"
                rows={4}
                style={{ display: 'block', width: '100%', padding: 8 }}
              />
            </div>
          </fieldset>
        )}

        {error && (
          <div style={{ color: 'red', marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} style={{ padding: '8px 16px' }}>
          {submitting ? 'Registrando...' : 'Registrarme'}
        </button>

        <div style={{ marginTop: 12 }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
}