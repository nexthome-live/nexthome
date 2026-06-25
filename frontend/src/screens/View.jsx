import { useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { Modal } from '../components/Modal'
import { VacancyCard } from '../components/VacancyCard'
import { Icon } from '../components/Icon'
import { SkeletonCard } from '../components/Skeleton'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../components/useToast.jsx'
import { API_BASE_URL } from '../api/config'
import './Post.css'
import './Screen.css'

const ROOM_TYPES = [
  { value: 'PRIVATE',   label: 'Private room' },
  { value: 'SHARED',    label: 'Shared room' },
  { value: 'STUDIO',    label: 'Studio' },
  { value: 'APARTMENT', label: 'Full apartment' },
]

const toVacancyForm = (vacancy) => ({
  title: vacancy?.title || '',
  description: vacancy?.description || '',
  roomType: vacancy?.roomType || '',
  rent: vacancy?.rent != null ? String(vacancy.rent) : '',
  city: vacancy?.city || '',
  address: vacancy?.address || '',
  createdBy: vacancy?.createdBy || '',
  contactEmail: vacancy?.contactEmail || '',
})

const normalizeCity = (city) => (typeof city === 'string' ? city.trim() : '')

export function ViewVacancies({ onBack, onHome }) {
  const [vacancies, setVacancies] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [managingId, setManagingId] = useState(null)
  const { success, error, ToastView } = useToast()

  useEffect(() => {
    // Stable flag to avoid setting state after unmount.
    let cancelled = false

    const loadVacancies = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/api/vacancies`)
        if (!response.ok) throw new Error('Unable to fetch vacancies.')
        const data = await response.json()
        if (!cancelled) {
          setVacancies(Array.isArray(data) ? data : [])
        }
      } catch (loadError) {
        if (!cancelled) error(loadError.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadVacancies()

    return () => { cancelled = true }
    // Run once on mount. `error` is a stable reference (useCallback in useToast),
    // but we intentionally don't list it here so this effect never re-fires
    // on parent re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cityOptions = useMemo(() => {
    const set = new Set()
    vacancies.forEach((v) => {
      const c = normalizeCity(v.city)
      if (c) set.add(c)
    })
    return Array.from(set).sort()
  }, [vacancies])

  const visibleVacancies = useMemo(() => {
    const q = search.trim().toLowerCase()
    return vacancies.filter((v) => {
      const cityOk = !selectedCity || normalizeCity(v.city) === selectedCity
      if (!cityOk) return false
      if (!q) return true
      const haystack = `${v.title} ${v.description} ${v.city} ${v.address || ''}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [vacancies, search, selectedCity])

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
            <Icon.List width={12} height={12} /> Live listings
          </span>
          <h2 className="screen__title">Browse vacancies</h2>
          <p className="screen__subtitle">
            Find a place that fits, or update your own post. Listings are sorted as they come in.
          </p>
        </div>
        {!loading && (
          <span className="screen__count">
            <strong>{visibleVacancies.length}</strong> of {vacancies.length} shown
          </span>
        )}
      </div>

      <div className="view-toolbar">
        <div className="view-search">
          <span className="view-search__icon"><Icon.Search width={16} height={16} /></span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, area…"
            aria-label="Search vacancies"
          />
        </div>
      </div>

      {cityOptions.length > 0 && (
        <div className="view-filters" role="group" aria-label="Filter by city">
          <span className="filter-chip" aria-hidden="true" style={{ pointerEvents: 'none', background: 'transparent', border: 'none', paddingLeft: 0 }}>
            <Icon.Filter width={14} height={14} /> Cities:
          </span>
          <button
            type="button"
            className={`filter-chip ${selectedCity === '' ? 'filter-chip--active' : ''}`}
            onClick={() => setSelectedCity('')}
          >
            All
          </button>
          {cityOptions.map((city) => (
            <button
              key={city}
              type="button"
              className={`filter-chip ${selectedCity === city ? 'filter-chip--active' : ''}`}
              onClick={() => setSelectedCity(city)}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      <div style={{ height: 'var(--space-6)' }} />

      {loading ? (
        <div className="vacancy-list">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : visibleVacancies.length === 0 ? (
        <EmptyState
          icon={vacancies.length === 0 ? '🏘️' : '🔍'}
          title={vacancies.length === 0 ? 'No vacancies yet' : 'No matches'}
          message={
            vacancies.length === 0
              ? 'Be the first to post a vacancy in your area.'
              : 'Try clearing the search or selecting a different city.'
          }
          action={
            vacancies.length === 0 ? (
              <Button variant="primary" onClick={onBack} leadingIcon={<Icon.Plus width={16} height={16} />}>
                Post the first one
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="vacancy-list">
          {visibleVacancies.map((vacancy) => (
            <VacancyCard
              key={vacancy.id}
              vacancy={vacancy}
              isActive={managingId === vacancy.id}
              onManage={() => setManagingId(managingId === vacancy.id ? null : vacancy.id)}
            />
          ))}
        </div>
      )}

      {managingId != null && (
        <ManageModal
          vacancyId={managingId}
          vacancy={vacancies.find((v) => v.id === managingId)}
          onClose={() => setManagingId(null)}
          onUpdated={(updated) => {
            setVacancies((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
            setManagingId(null)
            success('Vacancy updated.')
          }}
          onDeleted={(id) => {
            setVacancies((prev) => prev.filter((v) => v.id !== id))
            setManagingId(null)
            success('Vacancy deleted.')
          }}
          onError={(msg) => error(msg)}
        />
      )}

      {ToastView}
    </section>
  )
}

function ManageModal({ vacancyId, vacancy, onClose, onUpdated, onDeleted, onError }) {
  const [token, setToken] = useState('')
  const [form, setForm] = useState(() => toVacancyForm(vacancy))
  const [actionLoading, setActionLoading] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    setToken('')
    setForm(toVacancyForm(vacancy))
    setConfirmingDelete(false)
  }, [vacancyId, vacancy])

  const errors = useMemo(() => {
    const e = {}
    if (!form.title.trim())       e.title = 'Title is required.'
    if (!form.description.trim()) e.description = 'Description is required.'
    if (!form.roomType.trim())    e.roomType = 'Pick a room type.'
    if (!form.city.trim())        e.city = 'City is required.'
    if (!form.createdBy.trim())   e.createdBy = 'Your name is required.'
    const email = form.contactEmail.trim()
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.contactEmail = 'Please enter a valid email address.'
    }
    const rent = Number(form.rent)
    if (form.rent === '' || !Number.isFinite(rent) || rent <= 0) e.rent = 'Rent must be a positive number.'
    return e
  }, [form])

  const tokenOk = token.trim().length > 0
  const isValid = Object.keys(errors).length === 0
  const canUpdate = tokenOk && isValid
  const canDelete = tokenOk

  const updateField = (field, value) => setForm((p) => ({ ...p, [field]: value }))

  const submitUpdate = async (e) => {
    e.preventDefault()
    if (!canUpdate) {
      onError(isValid ? 'Enter your management token to update.' : 'Please fix the highlighted fields.')
      return
    }
    setActionLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/vacancies/${vacancyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Management-Token': token.trim(),
        },
        body: JSON.stringify({ ...form, rent: Number(form.rent) }),
      })
      if (!response.ok) throw new Error('Unable to update vacancy. Check your management token.')
      const updated = await response.json()
      onUpdated(updated)
    } catch (e2) {
      onError(e2.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!canDelete) {
      onError('Enter your management token to delete.')
      return
    }
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    setActionLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/vacancies/${vacancyId}`, {
        method: 'DELETE',
        headers: { 'X-Management-Token': token.trim() },
      })
      if (!response.ok) throw new Error('Unable to delete vacancy. Check your management token.')
      onDeleted(vacancyId)
    } catch (e2) {
      onError(e2.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Modal
      open
      onClose={actionLoading ? undefined : onClose}
      title="Manage this vacancy"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={actionLoading}>Close</Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={!canDelete || actionLoading}
            leadingIcon={<Icon.Trash width={16} height={16} />}
          >
            {actionLoading && confirmingDelete ? 'Deleting…'
              : confirmingDelete ? 'Click again to confirm'
              : 'Delete'}
          </Button>
          <Button
            variant="primary"
            onClick={submitUpdate}
            disabled={!canUpdate || actionLoading}
            loading={actionLoading && !confirmingDelete}
            leadingIcon={!actionLoading && <Icon.Check width={16} height={16} />}
          >
            {actionLoading && !confirmingDelete ? 'Saving…' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div className="manage-modal__section">
        <Field
          label="Management token"
          required
          hint="The token you received when posting this vacancy."
          htmlFor="manage-token"
        >
          {(props) => (
            <input
              {...props}
              type="password"
              placeholder="Paste your token"
              value={token}
              onChange={(e) => { setToken(e.target.value); setConfirmingDelete(false) }}
              autoComplete="off"
            />
          )}
        </Field>

        <div className="form-grid form-grid--single">
          <Field label="Title" required error={errors.title} htmlFor="manage-title">
            {(props) => (
              <input
                {...props}
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                maxLength={120}
              />
            )}
          </Field>

          <Field label="Description" required error={errors.description} htmlFor="manage-description">
            {(props) => (
              <textarea
                {...props}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                maxLength={1000}
              />
            )}
          </Field>

          <div className="form-grid form-grid--modal-row">
            <Field label="Room type" required error={errors.roomType} htmlFor="manage-roomType">
              {(props) => (
                <select
                  {...props}
                  value={form.roomType}
                  onChange={(e) => updateField('roomType', e.target.value)}
                >
                  <option value="">Select…</option>
                  {ROOM_TYPES.map((rt) => (
                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                  ))}
                </select>
              )}
            </Field>

            <Field label="Monthly rent ($)" required error={errors.rent} htmlFor="manage-rent">
              {(props) => (
                <input
                  {...props}
                  type="number"
                  min="1"
                  step="1"
                  value={form.rent}
                  onChange={(e) => updateField('rent', e.target.value)}
                />
              )}
            </Field>
          </div>

          <div className="form-grid form-grid--modal-row">
            <Field label="City" required error={errors.city} htmlFor="manage-city">
              {(props) => (
                <input
                  {...props}
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                />
              )}
            </Field>

            <Field label="Your name" required error={errors.createdBy} htmlFor="manage-createdBy">
              {(props) => (
                <input
                  {...props}
                  value={form.createdBy}
                  onChange={(e) => updateField('createdBy', e.target.value)}
                />
              )}
            </Field>
          </div>

          <Field label="Address" hint="Optional" htmlFor="manage-address">
            {(props) => (
              <input
                {...props}
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
              />
            )}
          </Field>

          <Field
            label="Contact email"
            hint="Optional — renters will use this to reach you."
            error={errors.contactEmail}
            htmlFor="manage-contactEmail"
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
                maxLength={255}
              />
            )}
          </Field>
        </div>

        {confirmingDelete && (
          <div className="manage-modal__danger" role="alert">
            <h4><Icon.Trash width={16} height={16} /> Confirm deletion</h4>
            <p>
              This will permanently remove this listing. Click "Delete" again in the footer to confirm,
              or close this dialog to cancel.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
