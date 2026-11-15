import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Reveal, SectionHeading } from '../components/Reveal'
import { SceneSection } from '../components/SceneSection'
import { freelance, sections } from '../content'

// Submissions are delivered to freelance.email by FormSubmit (formsubmit.co) — no backend or API key.
// The very first submission triggers a one-time "Activate form" email to that inbox; after it's
// confirmed, every enquiry arrives as a formatted email with Reply-To set to the client.
const ENDPOINT = `https://formsubmit.co/ajax/${freelance.email}`

const OTHER = 'Something else — I’ll describe it'
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

const control =
  'block w-full bg-ink/60 px-4 py-3 text-base text-paper ring-1 ring-white/10 transition placeholder:text-faint hover:ring-white/20 focus:ring-wine-soft focus:outline-hidden aria-[invalid=true]:ring-wine-soft'

function validate(v: Record<string, string>, service: string): Errors {
  const e: Errors = {}
  if (v.name.length < 2) e.name = 'Please enter your name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) e.email = 'Please enter a valid email address.'
  const digits = v.phone.replace(/\D/g, '').length
  if (digits < 7 || digits > 15) e.phone = 'Please enter a valid phone number, including the country code.'
  if (!v.country) e.country = 'Please choose your country.'
  if (!service) e.service = 'Please choose what you need.'
  if (service === OTHER && v.custom.length < 3) e.custom = 'Tell me briefly what you need.'
  if (v.details.length < 20) e.details = 'Please describe your project in a sentence or two (20+ characters).'
  return e
}

function Label({ id, children, optional }: { id: string; children: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={id} className="eyebrow flex items-baseline justify-between gap-3">
      <span>
        {children}
        {!optional && (
          <span aria-hidden className="text-wine-soft">
            {' '}
            *
          </span>
        )}
      </span>
      {optional && <span className="tracking-normal text-faint normal-case">Optional</span>}
    </label>
  )
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  return error ? (
    <p id={`${id}-error`} className="mt-2 text-xs text-wine-soft">
      {error}
    </p>
  ) : null
}

/** aria wiring shared by every validated control. */
const invalid = (id: string, error?: string) =>
  error ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` } : {}

type SelectProps = {
  id: string
  name: string
  placeholder: string
  options: string[]
  required?: boolean
  error?: string
  value?: string
  onChange?: (v: string) => void
}

function Select({ id, name, placeholder, options, required, error, value, onChange }: SelectProps) {
  return (
    <div className="relative mt-3">
      <select
        id={id}
        name={name}
        required={required}
        {...(value !== undefined ? { value } : { defaultValue: '' })}
        onChange={onChange && ((e) => onChange(e.target.value))}
        {...invalid(id, error)}
        className={`${control} cursor-pointer appearance-none pr-11 [color-scheme:dark] [&:has(option[value='']:checked)]:text-faint`}
      >
        <option value="" disabled={required} className="bg-ink text-faint">
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-ink text-paper">
            {o}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        width="12"
        height="12"
        viewBox="0 0 12 12"
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
      >
        <path d="M2 4.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </div>
  )
}

export function Freelance() {
  const [service, setService] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const [detailsLen, setDetailsLen] = useState(0)
  const [sentTo, setSentTo] = useState({ name: '', email: '' })
  const [mailto, setMailto] = useState('')
  const [formKey, setFormKey] = useState(0)
  const doneRef = useRef<HTMLDivElement>(null)

  // The thank-you panel is shorter than the form: bring it into view and move focus to it.
  useEffect(() => {
    if (status.state !== 'sent') return
    doneRef.current?.scrollIntoView({ block: 'center' })
    doneRef.current?.focus({ preventScroll: true })
  }, [status.state])

  const pickService = (name: string) => {
    setService(name)
    setErrors((e) => ({ ...e, service: undefined }))
    document.getElementById('fl-service')?.focus()
  }

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    if (status.state === 'sending') return
    const form = ev.currentTarget
    const fd = new FormData(form)
    const v = Object.fromEntries(
      ['name', 'email', 'phone', 'country', 'custom', 'details', 'budget', 'timeline', 'company', 'contactBy', 'website'].map(
        (k) => [k, String(fd.get(k) ?? '').trim()],
      ),
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
        fields.map(([k, x]) => `${k}: ${x}`).join('\n').slice(0, 1800),
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
          'Sent from': window.location.href,
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
      const network = err instanceof TypeError // fetch() rejects with TypeError when offline / blocked
      let message = aborted
        ? 'The request timed out.'
        : network
          ? 'Please check your internet connection.'
          : err instanceof Error
            ? err.message
            : 'Something went wrong.'
      if (!/[.!?]$/.test(message)) message += '.'
      setStatus({ state: 'error', message })
    } finally {
      window.clearTimeout(timer)
    }
  }

  const reset = () => {
    setService('')
    setErrors({})
    setDetailsLen(0)
    setStatus({ state: 'idle' })
    setFormKey((k) => k + 1)
  }

  const sending = status.state === 'sending'

  return (
    <SceneSection id="freelance" scene="freelance" text="right">
      <SectionHeading index="08" label="Freelance" title={sections.freelance.title} />
      <Reveal delay={0.1}>
        <p className="mt-6 max-w-lg text-muted">{sections.freelance.intro}</p>
      </Reveal>

      <Reveal delay={0.15}>
        <h3 className="mt-10 eyebrow">What I build</h3>
        <ul className="mt-4 grid gap-px bg-line ring-1 ring-line sm:grid-cols-2">
          {freelance.services.map((s, i) => (
            <li key={s.name} className={`bg-ink/80 ${i === freelance.services.length - 1 && i % 2 === 0 ? 'sm:col-span-2' : ''}`}>
              <button
                type="button"
                onClick={() => pickService(s.name)}
                aria-label={`${s.name} — ${s.note} Select in the form`}
                className={`group flex h-full w-full items-baseline gap-3 px-4 py-4 text-left transition-colors hover:bg-ink-2 ${
                  service === s.name ? 'bg-ink-2' : ''
                }`}
              >
                <span className="font-display text-lg text-wine-soft">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span
                    className={`block text-sm font-medium transition-colors ${
                      service === s.name ? 'text-wine-soft' : 'text-paper group-hover:text-wine-soft'
                    }`}
                  >
                    {s.name}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">{s.note}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-12 border-t border-line pt-10">
          {status.state === 'sent' ? (
            <div ref={doneRef} tabIndex={-1} role="status" className="bg-ink/80 p-8 ring-1 ring-wine focus:outline-hidden">
              <p className="eyebrow flex items-center gap-3">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-wine-soft" />
                Request received
              </p>
              <p className="mt-4 font-display text-4xl leading-tight">
                Thank you, <em>{sentTo.name.split(' ')[0]}</em>.
              </p>
              <p className="mt-4 text-muted">
                Your project details are on their way to me. I’ll reply to <span className="text-paper">{sentTo.email}</span>{' '}
                with next steps.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-8 inline-flex items-center px-6 py-3.5 text-sm font-medium text-paper ring-1 ring-white/20 transition hover:ring-paper"
              >
                Send another request
              </button>
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
              aria-labelledby="fl-form-title"
              className="space-y-7"
            >
              <div>
                <h3 id="fl-form-title" className="font-display text-3xl leading-tight sm:text-4xl">
                  Start a <em>project</em>
                </h3>
                <p className="mt-2 text-sm text-muted">
                  Fields marked <span className="text-wine-soft">*</span> are required. Your details are only used to reply to
                  you.
                </p>
              </div>

              <div className="grid gap-7 sm:grid-cols-2">
                <div>
                  <Label id="fl-name">Full name</Label>
                  <input id="fl-name" name="name" autoComplete="name" required maxLength={100} placeholder="Jane Doe"
                    {...invalid('fl-name', errors.name)} className={`${control} mt-3`} />
                  <ErrorText id="fl-name" error={errors.name} />
                </div>
                <div>
                  <Label id="fl-email">Email</Label>
                  <input id="fl-email" name="email" type="email" autoComplete="email" inputMode="email" required maxLength={150}
                    placeholder="you@company.com" {...invalid('fl-email', errors.email)} className={`${control} mt-3`} />
                  <ErrorText id="fl-email" error={errors.email} />
                </div>
                <div>
                  <Label id="fl-phone">Phone / WhatsApp</Label>
                  <input id="fl-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={25}
                    placeholder="+1 555 123 4567" {...invalid('fl-phone', errors.phone)} className={`${control} mt-3`} />
                  <ErrorText id="fl-phone" error={errors.phone} />
                </div>
                <div>
                  <Label id="fl-country">Country</Label>
                  <Select id="fl-country" name="country" placeholder="Select your country" options={COUNTRIES} required
                    error={errors.country} />
                  <ErrorText id="fl-country" error={errors.country} />
                </div>
              </div>

              <div>
                <Label id="fl-service">What do you need?</Label>
                <Select
                  id="fl-service"
                  name="service"
                  placeholder="Choose a service"
                  options={[...freelance.services.map((s) => s.name), OTHER]}
                  required
                  value={service}
                  onChange={(x) => {
                    setService(x)
                    setErrors((e) => ({ ...e, service: undefined, custom: undefined }))
                  }}
                  error={errors.service}
                />
                <ErrorText id="fl-service" error={errors.service} />
              </div>

              {service === OTHER && (
                <div className="fade-up">
                  <Label id="fl-custom">Describe what you need</Label>
                  <input id="fl-custom" name="custom" required maxLength={150} autoFocus
                    placeholder="e.g. A booking system for my clinic" {...invalid('fl-custom', errors.custom)}
                    className={`${control} mt-3`} />
                  <ErrorText id="fl-custom" error={errors.custom} />
                </div>
              )}

              <div className="grid gap-7 sm:grid-cols-2">
                <div>
                  <Label id="fl-budget" optional>Budget (USD)</Label>
                  <Select id="fl-budget" name="budget" placeholder="Select a range" options={BUDGETS} />
                </div>
                <div>
                  <Label id="fl-timeline" optional>Timeline</Label>
                  <Select id="fl-timeline" name="timeline" placeholder="When do you need it?" options={TIMELINES} />
                </div>
                <div>
                  <Label id="fl-company" optional>Company / current website</Label>
                  <input id="fl-company" name="company" maxLength={150} placeholder="Acme Inc. · acme.com"
                    className={`${control} mt-3`} />
                </div>
                <div>
                  <Label id="fl-contact" optional>Best way to reach you</Label>
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
                  className={`${control} mt-3 min-h-36 resize-y leading-relaxed`}
                />
                <div className="flex items-start justify-between gap-4">
                  <ErrorText id="fl-details" error={errors.details} />
                  <p aria-hidden className="mt-2 ml-auto text-xs text-faint tabular-nums">
                    {detailsLen}/{DETAILS_MAX}
                  </p>
                </div>
              </div>

              {/* Honeypot — hidden from people and assistive tech */}
              <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="fl-website">Leave this empty</label>
                <input id="fl-website" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-3 bg-wine px-7 py-4 text-sm font-medium text-paper transition hover:bg-[#8f1d3f] disabled:cursor-wait disabled:opacity-70"
                >
                  {sending ? 'Sending…' : 'Send project request'} <span aria-hidden>→</span>
                </button>
                <p className="text-xs text-muted">
                  Prefer email?{' '}
                  <a href={`mailto:${freelance.email}`} className="text-paper underline decoration-wine underline-offset-4 transition hover:decoration-paper">
                    {freelance.email}
                  </a>
                </p>
              </div>

              <div role="alert" aria-live="assertive">
                {status.state === 'error' && (
                  <p className="bg-ink/80 p-4 text-sm text-muted ring-1 ring-wine-soft">
                    <span className="text-paper">Your request couldn’t be sent.</span> {status.message}{' '}
                    Please try again, or{' '}
                    <a href={mailto} className="text-wine-soft underline underline-offset-4 hover:text-paper">
                      send it by email instead
                    </a>
                    .
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </Reveal>
    </SceneSection>
  )
}
