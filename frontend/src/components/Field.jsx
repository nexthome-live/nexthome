import { useId } from 'react'
import './Field.css'

export function Field({
  label,
  hint,
  error,
  required = false,
  children,
  className = '',
  htmlFor: htmlForProp,
}) {
  const generatedId = useId()
  const htmlFor = htmlForProp || generatedId

  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
          {required && <span className="field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      {typeof children === 'function'
        ? children({ id: htmlFor, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': hint || error ? `${htmlFor}-desc` : undefined })
        : children}
      {error ? (
        <p className="field__error" id={`${htmlFor}-desc`} role="alert">{error}</p>
      ) : hint ? (
        <p className="field__hint" id={`${htmlFor}-desc`}>{hint}</p>
      ) : null}
    </div>
  )
}
