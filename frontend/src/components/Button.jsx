import './Button.css'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    loading ? 'btn--loading' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {leadingIcon && <span className="btn__icon" aria-hidden="true">{leadingIcon}</span>}
      <span className="btn__label">{children}</span>
      {trailingIcon && <span className="btn__icon" aria-hidden="true">{trailingIcon}</span>}
    </button>
  )
}
