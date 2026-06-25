import { useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { Icon } from '../components/Icon'
import { useToast } from '../components/useToast.jsx'
import { API_BASE_URL } from '../api/config'
import './Post.css'
import './Screen.css'

const initialForm = {
  title: '',
  description: '',
  roomType: 'PRIVATE',
  rent: '',
  city: '',
  address: '',
  createdBy: '',
  contactEmail: '',
}

const ROOM_TYPES = [
  { value: 'PRIVATE',   label: 'Private room' },
  { value: 'SHARED',    label: 'Shared room' },
  { value: 'STUDIO',    label: 'Studio' },
  { value: 'APARTMENT', label: 'Full apartment' },
]

function validate(form) {
  const errors = {}
  if (!form.title.trim())           errors.title = 'Please give your listing a title.'
  if (form.title.length > 120)      errors.title = 'Keep the title under 120 characters.'
  if (!form.description.trim())     errors.description = 'A short description helps renters decide.'
  if (form.description.length > 1000) errors.description = 'Please keep it under 1000 characters.'
  if (!form.roomType.trim())        errors.roomType = 'Pick a room type.'
  if (!form.city.trim())            errors.city = 'City is required.'

  const email = form.contactEmail.trim()
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.contactEmail = 'Please enter a valid email address.'
  }
  if (!form.createdBy.trim())       errors.createdBy = 'Tell us who to credit for the post.'

  const rent = Number(form.rent)
  if (form.rent === '' || !Number.isFinite(rent) || rent <= 0) {
    errors.rent = 'Rent must be a positive number.'
  }

  return errors
}

export function PostVacancy({ onBack, onHome }) {
  const [form, setForm] = useState(initialForm)
  const [touched, setTouched] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null) // { id, token }
  const { success, error, ToastView } = useToast()

  const errors = useMemo(() => validate(form), [form])
  const isValid = Object.keys(errors).length === 0
  const canSubmit = isValid && !isLoading

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const showError = (field) => touched[field] ? errors[field] : ''

  const submit = async (event) => {
    event.preventDefault()
    if (!isValid) {
      setTouched({ title: 1, description: 1, roomType: 1, rent: 1, city: 1, createdBy: 1, contactEmail: 1 })
      error('Please fix the highlighted fields before posting.')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/vacancies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rent: Number(form.rent) }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload) {
        throw new Error('Unable to post vacancy. Please verify the details and try again.')
      }

      const createdId = payload?.vacancy?.id
      const token = payload.managementToken || ''
      setResult({ id: createdId, token })
      success('Vacancy posted successfully.')
      setForm(initialForm)
      setTouched({})
      // scroll into view
      requestAnimationFrame(() => {
        document.getElementById('post-success')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch (submitError) {
      error(submitError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToken = async () => {
    if (!result?.token) return
    try {
      await navigator.clipboard.writeText(result.token)
      success('Token copied to clipboard.')
    } catch {
      error('Unable to copy token. Please copy it manually.')
    }
  }

  return (
    <section className="screen">
      <div className="screen__back-row">
        <Button variant="ghost" size="sm" onClick={onBack} leadingIcon={<Icon.ArrowLeft width={16} height={16} />}>
          Back
        </Button>
        <Button variant="ghost" size="sm" onClick={onHome}>Home</Button>
      </div>

      <div className="screen__header">
        <div className="screen__heading">
          <span className="screen__eyebrow">
            <Icon.Plus width={12} height={12} /> New listing
          </span>
          <h2 className="screen__title">Post a vacancy</h2>
          <p className="screen__subtitle">
            Share the essentials. You'll get a management token to update or delete the post later.
          </p>
        </div>
      </div>

      <form className="form-card" onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field label="Title" required error={showError('title')} htmlFor="post-title">
            {(props) => (
              <input
                {...props}
                placeholder="e.g. Sunny 2BR near downtown"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                onBlur={() => markTouched('title')}
                maxLength={120}
              />
            )}
          </Field>

          <Field label="Room type" required error={showError('roomType')} htmlFor="post-roomType">
            {(props) => (
              <select
                {...props}
                value={form.roomType}
                onChange={(e) => updateField('roomType', e.target.value)}
                onBlur={() => markTouched('roomType')}
              >
                {ROOM_TYPES.map((rt) => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
            )}
          </Field>

          <Field
            label="Description"
            required
            error={showError('description')}
            htmlFor="post-description"
            className="form-grid__full"
          >
            {(props) => (
              <textarea
                {...props}
                placeholder="Mention highlights — furnished, balcony, nearby transit, etc."
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                onBlur={() => markTouched('description')}
                maxLength={1000}
              />
            )}
          </Field>

          <Field
            label="Monthly rent ($)"
            required
            error={showError('rent')}
            hint="Numbers only, no symbols."
            htmlFor="post-rent"
          >
            {(props) => (
              <input
                {...props}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                placeholder="1800"
                value={form.rent}
                onChange={(e) => updateField('rent', e.target.value)}
                onBlur={() => markTouched('rent')}
              />
            )}
          </Field>

          <Field label="City" required error={showError('city')} htmlFor="post-city">
            {(props) => (
              <input
                {...props}
                placeholder="Austin"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                onBlur={() => markTouched('city')}
                list="city-suggestions"
              />
            )}
          </Field>
          <datalist id="city-suggestions">
            <option value="Austin" />
            <option value="Boston" />
            <option value="Brooklyn" />
            <option value="Chicago" />
            <option value="Dallas" />
            <option value="Denver" />
            <option value="Los Angeles" />
            <option value="Miami" />
            <option value="New York" />
            <option value="Oakland" />
            <option value="Portland" />
            <option value="San Diego" />
            <option value="San Francisco" />
            <option value="Seattle" />
            <option value="Washington" />
          </datalist>

          <Field
            label="Address"
            hint="Optional — leave blank to share later."
            htmlFor="post-address"
          >
            {(props) => (
              <input
                {...props}
                placeholder="Street, neighborhood (optional)"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            )}
          </Field>

          <Field label="Your name" required error={showError('createdBy')} htmlFor="post-createdBy">
            {(props) => (
              <input
                {...props}
                placeholder="e.g. Alex M."
                value={form.createdBy}
                onChange={(e) => updateField('createdBy', e.target.value)}
                onBlur={() => markTouched('createdBy')}
                maxLength={100}
              />
            )}
          </Field>

          <Field
            label="Contact email"
            error={showError('contactEmail')}
            hint="Optional — renters will use this to reach you."
            htmlFor="post-contactEmail"
          >
            {(props) => (
              <input
                {...props}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                onBlur={() => markTouched('contactEmail')}
                maxLength={255}
              />
            )}
          </Field>
        </div>

        <div className="form-card__actions">
          <Button variant="ghost" type="button" onClick={onBack} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={!canSubmit}
            leadingIcon={!isLoading && <Icon.Plus width={16} height={16} />}
          >
            {isLoading ? 'Posting…' : 'Post Vacancy'}
          </Button>
        </div>
      </form>

      {result && (
        <div className="token-result" id="post-success" role="status" aria-live="polite">
          <div className="token-result__head">
            <div className="token-result__check"><Icon.Check width={22} height={22} /></div>
            <div>
              <div className="token-result__title">Your vacancy is live!</div>
              <div className="token-result__subtitle">
                Save your management token now — you'll need it to update or remove this listing.
              </div>
            </div>
          </div>

          {result.id != null && (
            <div className="token-result__id">
              <span className="token-result__id-label">Vacancy ID:</span>
              <span className="token-result__id-value">#{result.id}</span>
            </div>
          )}

          <div className="token-result__box">
            <span className="token-result__token">{result.token}</span>
            <Button variant="outline" size="sm" onClick={copyToken} leadingIcon={<Icon.Copy width={14} height={14} />}>
              Copy
            </Button>
          </div>

          <p className="token-result__warning">
            ⚠ We don't store the token on the server side in a recoverable form. If you lose it,
            you won't be able to edit or delete this listing.
          </p>
        </div>
      )}

      {ToastView}
    </section>
  )
}
