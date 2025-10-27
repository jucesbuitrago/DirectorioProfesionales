import { forwardRef, useId, useState } from 'react';

/**
 * Underlined TextField with label, focus ring, error state, helper, and password toggle (Alt+P).
 *
 * Props:
 * - id, name, label, type ('text' | 'password' | ...), value, onChange, onBlur, placeholder, required, disabled, autoComplete
 * - error (string | ReactNode) => sets aria-invalid and shows inline error (role="alert", aria-live="polite")
 * - helperText (string | ReactNode) => subtle helper text
 * - enableToggle (boolean) => show password toggle for type="password" (default: true)
 * - endAdornment (ReactNode) => optional right-side adornment (e.g., icons)
 * - fullWidth (boolean) => stretch container to 100%
 * - className, inputClassName, containerClassName => style hooks
 *
 * A11y:
 * - Real label with htmlFor
 * - aria-invalid on input when error
 * - aria-describedby links helper/error
 * - Error uses role="alert" and aria-live="polite"
 * - Alt+P toggles password visibility (when enableToggle and type="password")
 */
const TextField = forwardRef(function TextField(
  {
    id,
    name,
    label,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder,
    required,
    disabled,
    autoComplete,
    error,
    helperText,
    enableToggle = true,
    endAdornment,
    fullWidth = true,
    className = '',
    inputClassName = '',
    containerClassName = '',
    ...rest
  },
  ref
) {
  const uid = useId();
  const inputId = id ?? `tf-${uid}`;
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;

  const hasToggle = enableToggle && type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  const actualType = hasToggle ? (showPassword ? 'text' : 'password') : type;

  const describedBy = [
    error ? errorId : null,
    helperText ? helpId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const handleKeyDown = (e) => {
    if (hasToggle && e.altKey && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      if (!disabled) setShowPassword((s) => !s);
    }
    if (typeof rest.onKeyDown === 'function') rest.onKeyDown(e);
  };

  return (
    <div
      className={[
        'textfield',
        fullWidth ? 'btn--full' : '',
        containerClassName,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label && (
        <label className="textfield-label" htmlFor={inputId}>
          {label} {required ? <span aria-hidden="true">*</span> : null}
        </label>
      )}

      <div
        className={[
          'textfield-control',
          hasToggle || endAdornment ? 'has-endAdornment' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <input
          id={inputId}
          name={name}
          type={actualType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={['textfield-input', inputClassName].filter(Boolean).join(' ')}
          onKeyDown={handleKeyDown}
          ref={ref}
          {...rest}
        />

        {(hasToggle || endAdornment) && (
          <div className="textfield-adornment">
            {endAdornment}
            {hasToggle && (
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="focus-ring"
                aria-label={
                  showPassword
                    ? 'Ocultar contraseña (Alt+P)'
                    : 'Mostrar contraseña (Alt+P)'
                }
                title="Alt+P"
                disabled={disabled}
              >
                <EyeIcon open={showPassword} />
              </button>
            )}
          </div>
        )}
      </div>

      {error ? (
        <div id={errorId} role="alert" aria-live="polite" className="helper-error">
          {error}
        </div>
      ) : helperText ? (
        <div id={helpId} className="textfield-helper">
          {helperText}
        </div>
      ) : null}
    </div>
  );
});

function EyeIcon({ open = false }) {
  return open ? (
    // Open eye
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 5c5.05 0 8.64 3.27 10.5 6.05c.35.52.35 1.38 0 1.9C20.64 15.73 17.05 19 12 19S3.36 15.73 1.5 12.95c-.35-.52-.35-1.38 0-1.9C3.36 8.27 6.95 5 12 5m0 2C8.27 7 5.36 9.33 3.8 12C5.36 14.67 8.27 17 12 17s6.64-2.33 8.2-5C18.64 9.33 15.73 7 12 7m0 2a3 3 0 1 1 0 6a3 3 0 0 1 0-6Z"
      />
    </svg>
  ) : (
    // Closed eye (with slash)
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M2.1 3.51L3.5 2.1L21.9 20.5l-1.41 1.41l-3.04-3.04A11.9 11.9 0 0 1 12 19c-5.05 0-8.64-3.27-10.5-6.05a2.2 2.2 0 0 1 0-1.9C2.5 9.92 3.63 8.64 5 7.6L2.1 3.51ZM12 7c3.73 0 6.64 2.33 8.2 5c-.53.87-1.22 1.7-2.06 2.43l-1.47-1.47a4.99 4.99 0 0 0-6.63-6.63L8.57 5.89C9.62 5.43 10.76 5 12 5c5.05 0 8.64 3.27 10.5 6.05c.35.52.35 1.38 0 1.9c-.4.6-.86 1.16-1.37 1.66L18.73 13c.17-.32.27-.69.27-1a3 3 0 0 0-3-3c-.31 0-.68.1-1 .27L12.73 7.0C12.5 7 12.25 7 12 7Zm-2.07 2.21l1.53 1.53c.18-.46.64-.74 1.13-.74a1.5 1.5 0 1 1-1.5 1.5c0-.49.28-.95.74-1.13l-1.53-1.53c-.24.31-.37.7-.37 1.13a3 3 0 0 0 3 3c.43 0 .82-.13 1.13-.37l1.41 1.41c-.71.58-1.61.96-2.54.96a3.99 3.99 0 0 1-4-4c0-.93.38-1.83.96-2.54Z"
      />
    </svg>
  );
}

export default TextField;