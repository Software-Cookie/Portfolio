import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { freelance, sections } from '../content'
import { onFreelanceOpen } from '../freelanceEvents'
import { Modal, ModalHeader } from './Modal'
import { ArrowRight, Check } from './Icons'
import { Emph } from './Reveal'

// Submissions are delivered to freelance.email by FormSubmit (formsubmit.co) — no backend or API key.
// The very first submission triggers a one-time "Activate form" email to that inbox; after it's
// confirmed, every enquiry arrives as a formatted email with Reply-To set to the client.
const ENDPOINT = `https://formsubmit.co/ajax/${freelance.email}`

const OTHER = 'Something else'
const BUDGETS = ['Under $500', '$500 – $1,500', '$1,500 – $5,000', '$5,000 – $10,000', '$10,000+', 'Not sure yet']
const TIMELINES = ['As soon as possible', 'Within a month', '1 – 3 months', '3+ months', 'Flexible']
const CONTACT_BY = ['Email', 'Phone call', 'WhatsApp']
const DETAILS_MAX = 3000

// ISO 3166 region codes; names come from the browser (Intl.DisplayNames), so the list stays small.
const REGIONS =
  'AF AX AL DZ AS AD AO AI AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI XK KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF KP MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA KR SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UY UZ VU VE VN VG VI WF EH YE ZM ZW'

const COUNTRIES = (() => {
  let names: Intl.DisplayNames | undefined
  try {
    names = new Intl.DisplayNames(['en'], { type: 'region' })
  } catch {
    /* very old browser: fall back to the codes */
  }
  return [...new Set(REGIONS.split(' ').map((c) => names?.of(c) ?? c))].sort((a, b) => a.localeCompare(b))
})()

type Field = 'name' | 'email' | 'phone' | 'country' | 'service' | 'custom' | 'details'
type Errors = Partial<Record<Field, string>>
type Status = { state: 'idle' | 'sending' | 'sent' } | { state: 'error'; message: string }

function validate(v: Record<string, string>, service: string): Errors {
  const e: Errors = {}
  if (!service) e.service = 'Please choose what you need.'
  if (service === OTHER && v.custom.length < 3) e.custom = 'Tell me briefly what you need.'
  if (v.name.length < 2) e.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) e.email = 'Please enter a valid email address.'
  const digits = v.phone.replace(/\D/g, '').length
  if (digits < 7 || digits > 15) e.phone = 'Please enter a valid phone number, including the country code.'
  if (!v.country) e.country = 'Please choose your country.'
  if (v.details.length < 20) e.details = 'Please describe your project in a sentence or two (20+ characters).'
  return e
}

function Label({ id, children, optional }: { id: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
      <span>
        {children}
        {!optional && (
          <span aria-hidden className="text-brand">
            {' '}
            *
          </span>
        )}
      </span>
      {optional && <span className="text-xs font-normal text-muted">Optional</span>}
    </label>
  )
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-bad">
      {error}
    </p>
  ) : null
}

const invalid = (id: string, error?: string) => (error ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` } : {})

function Select({ id, name, placeholder, options, required, error }: { id: string; name: string; placeholder: string; options: string[]; required?: boolean; error?: string }) {
  return (
    <div className="relative mt-2">
      <select
        id={id}
        name={name}
        required={required}
        defaultValue=""
        {...invalid(id, error)}
        className="control cursor-pointer appearance-none pr-10 [&:has(option[value='']:checked)]:text-muted"
      >
        <option value="" disabled={required}>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted">
        <path d="M2 4.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

export function FreelanceModal() {
  const [open, setOpen] = useState(false)
  const [service, setService] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const [detailsLen, setDetailsLen] = useState(0)
  const [sentTo, setSentTo] = useState({ name: '', email: '' })
  const [mailto, setMailto] = useState('')
  const [formKey, setFormKey] = useState(0)
  const body = useRef<HTMLDivElement>(null)

  // Opens from the navbar button (or any openFreelance() call), and from #freelance links.
  useEffect(() => {
    const fromHash = () => location.hash === '#freelance' && setOpen(true)
    fromHash()
    window.addEventListener('hashchange', fromHash)
    const off = onFreelanceOpen(() => setOpen(true))
    return () => {
      off()
      window.removeEventListener('hashchange', fromHash)
    }
  }, [])

  const close = () => {
    setOpen(false)
    if (location.hash === '#freelance') history.replaceState(null, '', location.pathname + location.search)
    if (status.state === 'sent') reset()
  }

  useEffect(() => {
    if (status.state === 'sent') body.current?.scrollTo({ top: 0 })
  }, [status.state])

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (status.state === 'sending') return
    const form = ev.currentTarget
    const fd = new FormData(form)
    const v = Object.fromEntries(
      ['name', 'email', 'phone', 'country', 'custom', 'details', 'budget', 'timeline', 'company', 'contactBy', 'website'].map((k) => [
        k,
        String(fd.get(k) ?? '').trim(),
      ]),
    )

    const found = validate(v, service)
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }

    // Honeypot: real people never see this field; bots fill it. Pretend it worked.
    if (v.website) {
      setSentTo({ name: v.name, email: v.email })
      setStatus({ state: 'sent' })
      return
    }

    const need = service === OTHER ? `Other: ${v.custom}` : service
    const fields: [string, string][] = [
      ['Name', v.name],
      ['Email', v.email],
      ['Phone', v.phone],
      ['Country', v.country],
      ['Service needed', need],
      ['Budget', v.budget || 'Not specified'],
      ['Timeline', v.timeline || 'Not specified'],
      ['Company / current website', v.company || '—'],
      ['Preferred contact', v.contactBy || 'Not specified'],
      ['Project details', v.details],
    ]
    const subject = `New freelance enquiry: ${need} — ${v.name} (${v.country})`
    setMailto(
      `mailto:${freelance.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        fields
          .map(([k, x]) => `${k}: ${x}`)
          .join('\n')
          .slice(0, 1800),
      )}`,
    )

    setStatus({ state: 'sending' })
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 20000)
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(fields),
          'Sent from': window.location.origin,
          _subject: subject,
          _replyto: v.email,
          _template: 'table',
          _captcha: 'false',
        }),
        signal: ctrl.signal,
      })
      const json = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string }
      if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || `Request failed (${res.status})`)
      setSentTo({ name: v.name, email: v.email })
      setStatus({ state: 'sent' })
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === 'AbortError'
      const network = err instanceof TypeError
      let message = aborted ? 'The request timed out.' : network ? 'Please check your internet connection.' : err instanceof Error ? err.message : 'Something went wrong.'
      if (!/[.!?]$/.test(message)) message += '.'
      setStatus({ state: 'error', message })
    } finally {
      window.clearTimeout(timer)
    }
  }

  function reset() {
    setService('')
    setErrors({})
    setDetailsLen(0)
    setStatus({ state: 'idle' })
    setFormKey((k) => k + 1)
  }

  const sending = status.state === 'sending'
  const options = [...freelance.services, { name: OTHER, note: 'Describe it in your own words.' }]

  return (
    <Modal open={open} onClose={close} labelledBy="freelance-title" width="max-w-3xl">
      <ModalHeader id="freelance-title" eyebrow="Freelance" title={<Emph text={sections.freelance.title} />} onClose={close} />
      <div ref={body} className="overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-7">
        {status.state === 'sent' ? (
          <div role="status" className="py-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-tint text-brand-700">
              <Check size={26} strokeWidth={2.4} />
            </span>
            <p className="mt-5 text-2xl font-semibold text-ink">Thank you, {sentTo.name.split(' ')[0]}.</p>
            <p className="mx-auto mt-3 max-w-md text-body">
              Your project details are on their way. I’ll reply to <span className="font-medium text-ink">{sentTo.email}</span> with next steps.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={reset} className="btn btn-outline">
                Send another request
              </button>
              <button type="button" onClick={close} className="btn btn-primary">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form
            key={formKey}
            noValidate
            onSubmit={onSubmit}
            onInput={(e) => {
              const n = (e.target as HTMLInputElement).name as Field
              if (errors[n]) setErrors((x) => ({ ...x, [n]: undefined }))
            }}
            aria-labelledby="freelance-title"
            className="space-y-7"
          >
            <p className="text-body">{sections.freelance.intro}</p>

            <fieldset>
              <legend className="text-sm font-medium text-ink">
                What do you need?<span aria-hidden className="text-brand"> *</span>
              </legend>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2" {...(errors.service ? { 'aria-describedby': 'fl-service-error' } : {})}>
                {options.map((s) => {
                  const on = service === s.name
                  return (
                    <label
                      key={s.name}
                      className={`relative flex cursor-pointer gap-3 rounded-xl p-3.5 ring-1 transition duration-300 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand ${
                        on ? 'bg-tint ring-brand' : 'bg-white ring-line-2 hover:bg-soft hover:ring-sky'
                      }`}
                    >
                      <input
                        type="radio"
                        name="service"
                        value={s.name}
                        checked={on}
                        onChange={() => {
                          setService(s.name)
                          setErrors((e) => ({ ...e, service: undefined, custom: undefined }))
                        }}
                        className="sr-only"
                      />
                      <span
                        aria-hidden
                        className={`mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full ring-1 transition ${on ? 'bg-brand text-white ring-brand' : 'bg-white ring-line-2'}`}
                      >
                        {on && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span>
                        <span className={`block text-sm font-semibold ${on ? 'text-brand-700' : 'text-ink'}`}>{s.name}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">{s.note}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
              <ErrorText id="fl-service" error={errors.service} />
            </fieldset>

            {service === OTHER && (
              <div className="fade-up">
                <Label id="fl-custom">Describe what you need</Label>
                <input
                  id="fl-custom"
                  name="custom"
                  required
                  maxLength={150}
                  autoFocus
                  placeholder="e.g. A booking system for my clinic"
                  {...invalid('fl-custom', errors.custom)}
                  className="control mt-2"
                />
                <ErrorText id="fl-custom" error={errors.custom} />
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label id="fl-name">Full name</Label>
                <input id="fl-name" name="name" autoComplete="name" required maxLength={100} placeholder="Jane Doe" {...invalid('fl-name', errors.name)} className="control mt-2" />
                <ErrorText id="fl-name" error={errors.name} />
              </div>
              <div>
                <Label id="fl-email">Email</Label>
                <input
                  id="fl-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  maxLength={150}
                  placeholder="you@company.com"
                  {...invalid('fl-email', errors.email)}
                  className="control mt-2"
                />
                <ErrorText id="fl-email" error={errors.email} />
              </div>
              <div>
                <Label id="fl-phone">Phone / WhatsApp</Label>
                <input
                  id="fl-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  maxLength={25}
                  placeholder="+1 555 123 4567"
                  {...invalid('fl-phone', errors.phone)}
                  className="control mt-2"
                />
                <ErrorText id="fl-phone" error={errors.phone} />
              </div>
              <div>
                <Label id="fl-country">Country</Label>
                <Select id="fl-country" name="country" placeholder="Select your country" options={COUNTRIES} required error={errors.country} />
                <ErrorText id="fl-country" error={errors.country} />
              </div>
              <div>
                <Label id="fl-budget" optional>
                  Budget (USD)
                </Label>
                <Select id="fl-budget" name="budget" placeholder="Select a range" options={BUDGETS} />
              </div>
              <div>
                <Label id="fl-timeline" optional>
                  Timeline
                </Label>
                <Select id="fl-timeline" name="timeline" placeholder="When do you need it?" options={TIMELINES} />
              </div>
              <div>
                <Label id="fl-company" optional>
                  Company / current website
                </Label>
                <input id="fl-company" name="company" maxLength={150} placeholder="Acme Inc. · acme.com" className="control mt-2" />
              </div>
              <div>
                <Label id="fl-contact" optional>
                  Best way to reach you
                </Label>
                <Select id="fl-contact" name="contactBy" placeholder="Any is fine" options={CONTACT_BY} />
              </div>
            </div>

            <div>
              <Label id="fl-details">Project details</Label>
              <textarea
                id="fl-details"
                name="details"
                required
                rows={5}
                maxLength={DETAILS_MAX}
                onInput={(e) => setDetailsLen(e.currentTarget.value.length)}
                placeholder="What are you building, who is it for, and what should it do? Links to designs or examples help."
                {...invalid('fl-details', errors.details)}
                className="control mt-2 min-h-32 resize-y leading-relaxed"
              />
              <div className="flex items-start justify-between gap-4">
                <ErrorText id="fl-details" error={errors.details} />
                <p aria-hidden className="mt-1.5 ml-auto text-xs text-muted tabular-nums">
                  {detailsLen}/{DETAILS_MAX}
                </p>
              </div>
            </div>

            {/* Honeypot — hidden from people and assistive tech */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="fl-website">Leave this empty</label>
              <input id="fl-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div role="alert" aria-live="assertive">
              {status.state === 'error' && (
                <p className="rounded-xl bg-[#fdf1f1] p-4 text-sm text-body ring-1 ring-[#f3cccc]">
                  <span className="font-semibold text-bad">Your request couldn’t be sent.</span> {status.message} Please try again, or{' '}
                  <a href={mailto} className="font-medium text-brand-700 underline underline-offset-4">
                    send it by email instead
                  </a>
                  .
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted">
                Prefer email?{' '}
                <a href={`mailto:${freelance.email}`} className="font-medium text-brand-700 hover:underline">
                  {freelance.email}
                </a>
              </p>
              <button type="submit" disabled={sending} className="btn btn-primary btn-lg">
                {sending ? 'Sending…' : 'Send project request'} {!sending && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  )
}
