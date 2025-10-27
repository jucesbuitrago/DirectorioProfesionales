/* Primary Button with loading/fullWidth; styles via auth.css */
export default function Button({ children, loading = false, loadingText, fullWidth = false, className = '', ...props }) {
  const classes = [
    'btn',
    'btn-primary',
    fullWidth ? 'btn--full' : '',
    loading ? 'btn--loading' : '',
    className
  ].filter(Boolean).join(' ');

  const { disabled } = props;

  return (
    <button
      type={props.type || 'button'}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      <span>{loading ? (loadingText ?? children) : children}</span>
    </button>
  );
}