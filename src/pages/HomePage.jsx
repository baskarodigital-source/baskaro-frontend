import { useMemo, useState, useEffect } from 'react'
import { getCatalogStructure, postPricingEstimate } from '../lib/api/baskaroApi.js'

const SCREEN_OPTIONS = ['Excellent', 'Good', 'Fair', 'Bad / Cracked']
const BODY_OPTIONS = ['Excellent', 'Good', 'Fair', 'Bad / Scratched']
const BATTERY_OPTIONS = ['90% - 100%', '80% - 89%', '60% - 79%', 'Below 60%']
const ACCESSORIES_OPTIONS = [
  'Original box + all accessories',
  'Original charger only',
  'No charger / no box',
  'No accessories',
]
const AGE_OPTIONS = [
  { label: '0–6 months', months: 3 },
  { label: '6–12 months', months: 9 },
  { label: '1–2 years', months: 18 },
  { label: '2–3 years', months: 30 },
]
const PAYMENT_METHODS = ['UPI', 'Bank Transfer']

const inputClass =
  'h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-red-500 transition focus:ring-2'

function formatMoney(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n)
}

export default function HomePage() {
  const [catalog, setCatalog] = useState({})
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogErr, setCatalogErr] = useState(null)

  useEffect(() => {
    setCatalogLoading(true)
    getCatalogStructure()
      .then((data) => {
        setCatalog(data || {})
        setCatalogErr(null)
      })
      .catch((err) => {
        console.error('Failed to load catalog:', err)
        setCatalogErr('Failed to load catalog data.')
      })
      .finally(() => setCatalogLoading(false))
  }, [])

  const brands = useMemo(() => Object.keys(catalog), [catalog])
  const [step, setStep] = useState('select') // select -> estimate -> pickup -> confirm
  const [selectedBrand, setSelectedBrand] = useState(brands[0] ?? 'Apple')
  useEffect(() => {
    if (brands.length && !selectedBrand) setSelectedBrand(brands[0])
    if (brands.length && selectedBrand && !brands.includes(selectedBrand)) setSelectedBrand(brands[0])
  }, [brands, selectedBrand])

  const models = useMemo(
    () => Object.keys(catalog[selectedBrand] ?? {}),
    [catalog, selectedBrand],
  )

  const [modelQuery, setModelQuery] = useState('')
  const filteredModels = useMemo(() => {
    const q = modelQuery.trim().toLowerCase()
    if (!q) return models
    return models.filter((m) => m.toLowerCase().includes(q))
  }, [modelQuery, models])

  const [selectedModel, setSelectedModel] = useState(null)
  const modelEntry = selectedModel ? catalog[selectedBrand]?.[selectedModel] : null
  const variants = useMemo(() => modelEntry?.variants ?? [], [modelEntry])

  const [selectedRam, setSelectedRam] = useState('')
  const [selectedStorage, setSelectedStorage] = useState('')
  const ramOptions = useMemo(
    () => Array.from(new Set(variants.map((v) => v.ram))),
    [variants],
  )
  const storageOptions = useMemo(() => {
    const list = variants.filter((v) => v.ram === selectedRam)
    return Array.from(new Set(list.map((v) => v.storage)))
  }, [variants, selectedRam])

  const [screenCondition, setScreenCondition] = useState('Good')
  const [bodyCondition, setBodyCondition] = useState('Good')
  const [batteryHealth, setBatteryHealth] = useState('80% - 89%')
  const [accessories, setAccessories] = useState('Original charger only')
  const [deviceAgeMonths, setDeviceAgeMonths] = useState(18)

  const [pickupDateTime, setPickupDateTime] = useState('')
  const [pickupAddress, setPickupAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    pincode: '',
  })

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [order, setOrder] = useState(null)

  const ORDER_STATUSES = [
    { key: 'submitted', label: 'Request submitted' },
    { key: 'pickup', label: 'Pickup scheduled' },
    { key: 'received', label: 'Device received' },
    { key: 'paid', label: 'Payment completed' },
  ]

  const [estimate, setEstimate] = useState(null)
  const [estimateLoading, setEstimateLoading] = useState(false)

  useEffect(() => {
    if (!selectedModel || !selectedRam || !selectedStorage) {
      setEstimate(null)
      return
    }
    let cancelled = false
    setEstimateLoading(true)
    postPricingEstimate({
      brand: selectedBrand,
      model: selectedModel,
      ram: selectedRam,
      storage: selectedStorage,
      screenCondition,
      bodyCondition,
      batteryHealth,
      accessories,
      deviceAgeMonths,
    })
      .then((r) => {
        if (!cancelled) setEstimate(r && typeof r === 'object' ? r : null)
      })
      .catch(() => {
        if (!cancelled) setEstimate(null)
      })
      .finally(() => {
        if (!cancelled) setEstimateLoading(false)
      })
    return () => { cancelled = true }
  }, [
    selectedBrand,
    selectedModel,
    selectedRam,
    selectedStorage,
    screenCondition,
    bodyCondition,
    batteryHealth,
    accessories,
    deviceAgeMonths,
  ])

  const statusIndex = order?.statusIndex ?? -1

  function resetToSelect(nextBrand = selectedBrand) {
    setSelectedBrand(nextBrand)
    setSelectedModel(null)
    setSelectedRam('')
    setSelectedStorage('')
    setModelQuery('')
    setOrder(null)
    setStep('select')
  }

  function selectModel(model) {
    const first = catalog[selectedBrand]?.[model]?.variants?.[0]
    setSelectedModel(model)
    setSelectedRam(first?.ram ?? '')
    setSelectedStorage(first?.storage ?? '')
    setStep('estimate')
  }

  function schedulePickup() {
    if (!estimate?.finalPrice) return
    setOrder({
      id: `ORD-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
      brand: selectedBrand,
      model: selectedModel,
      ram: selectedRam,
      storage: selectedStorage,
      estimate: estimate.finalPrice,
      statusIndex: 1,
      paymentMethod,
    })
    setStep('confirm')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <p className="mb-2 text-xs text-slate-500">
          Home / Sell Old Mobile Phone / {selectedBrand}
        </p>

        {catalogErr && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {catalogErr}
          </div>
        )}
        {catalogLoading && (
          <p className="mb-4 text-sm text-slate-500">Loading catalog…</p>
        )}
        {step === 'select' && (
          <>
            <h1 className="mb-4 text-3xl font-extrabold text-slate-900">
              Sell Old Mobile Phone
            </h1>
            {!catalogLoading && !brands.length && !catalogErr && (
              <p className="mb-4 text-sm text-slate-600">No devices in catalog yet. Add brands and models in the admin panel.</p>
            )}
            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold">Select Brand</label>
                <select
                  className={inputClass}
                  value={selectedBrand}
                  onChange={(e) => resetToSelect(e.target.value)}
                  disabled={!brands.length}
                >
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold">Search Model</label>
                <input
                  className={inputClass}
                  placeholder="Type model name"
                  value={modelQuery}
                  onChange={(e) => setModelQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold">Select Model</h2>
              <span className="text-xs font-semibold text-slate-500">
                {filteredModels.length} model{filteredModels.length === 1 ? '' : 's'}
              </span>
            </div>

            <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {filteredModels.map((m) => (
                <button
                  key={m}
                  onClick={() => selectModel(m)}
                  className="rounded-xl border bg-white p-3 text-center transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow"
                >
                  <div className="mx-auto mb-2 h-12 w-8 rounded-lg bg-slate-200" />
                  <div className="text-sm font-semibold text-slate-800">{m}</div>
                </button>
              ))}
            </section>
          </>
        )}

        {step === 'estimate' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {selectedBrand} {selectedModel}
              </h2>
              <button
                onClick={() => resetToSelect()}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
              >
                Change Model
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <section className="rounded-xl border bg-white p-4">
                <h3 className="mb-3 text-base font-bold">Phone Details</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold">RAM</label>
                    <select
                      className={inputClass}
                      value={selectedRam}
                      onChange={(e) => {
                        const nextRam = e.target.value
                        setSelectedRam(nextRam)
                        setSelectedStorage(
                          variants.find((v) => v.ram === nextRam)?.storage ?? '',
                        )
                      }}
                    >
                      {ramOptions.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">Storage</label>
                    <select
                      className={inputClass}
                      value={selectedStorage}
                      onChange={(e) => setSelectedStorage(e.target.value)}
                    >
                      {storageOptions.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <ConditionSelect
                    label="Screen Condition"
                    value={screenCondition}
                    setValue={setScreenCondition}
                    options={SCREEN_OPTIONS}
                  />
                  <ConditionSelect
                    label="Body Condition"
                    value={bodyCondition}
                    setValue={setBodyCondition}
                    options={BODY_OPTIONS}
                  />
                  <ConditionSelect
                    label="Battery Health"
                    value={batteryHealth}
                    setValue={setBatteryHealth}
                    options={BATTERY_OPTIONS}
                  />
                  <ConditionSelect
                    label="Accessories"
                    value={accessories}
                    setValue={setAccessories}
                    options={ACCESSORIES_OPTIONS}
                  />
                  <div>
                    <label className="mb-1 block text-xs font-bold">Device age</label>
                    <select
                      className={inputClass}
                      value={deviceAgeMonths}
                      onChange={(e) => setDeviceAgeMonths(Number(e.target.value))}
                    >
                      {AGE_OPTIONS.map((o) => (
                        <option key={o.label} value={o.months}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setStep('pickup')}
                  disabled={!estimate?.finalPrice}
                  className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-60"
                >
                  Continue to Schedule Pickup
                </button>
              </section>

              <aside className="rounded-xl border bg-white p-4">
                <h3 className="text-base font-bold">Estimated Price</h3>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {estimateLoading ? '…' : `₹${estimate?.finalPrice ? formatMoney(estimate.finalPrice) : '0'}`}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Base: ₹{estimate?.breakdown?.basePrice != null ? formatMoney(estimate.breakdown.basePrice) : '0'}
                </p>
                <p className="text-sm text-slate-600">
                  Demand adj: ₹{estimate?.breakdown?.demandAdjusted != null ? formatMoney(estimate.breakdown.demandAdjusted) : '0'}
                </p>
                <p className="text-sm text-slate-600">
                  Depreciation: ₹{estimate?.breakdown?.depreciationInr != null ? formatMoney(estimate.breakdown.depreciationInr) : '0'}
                </p>
                <p className="text-sm text-slate-600">
                  Condition loss: ₹{estimate?.breakdown?.conditionLossInr != null ? formatMoney(estimate.breakdown.conditionLossInr) : '0'}
                </p>
              </aside>
            </div>
          </>
        )}

        {step === 'pickup' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Schedule Pickup</h2>
              <button
                onClick={() => setStep('estimate')}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
              >
                Back
              </button>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <section className="rounded-xl border bg-white p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Pickup Date & Time">
                    <input
                      type="datetime-local"
                      className={inputClass}
                      value={pickupDateTime}
                      onChange={(e) => setPickupDateTime(e.target.value)}
                    />
                  </Field>
                  <Field label="Full Name">
                    <input
                      className={inputClass}
                      value={pickupAddress.fullName}
                      onChange={(e) =>
                        setPickupAddress((p) => ({ ...p, fullName: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      className={inputClass}
                      value={pickupAddress.phone}
                      onChange={(e) =>
                        setPickupAddress((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Address">
                    <input
                      className={inputClass}
                      value={pickupAddress.line1}
                      onChange={(e) =>
                        setPickupAddress((p) => ({ ...p, line1: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="City">
                    <input
                      className={inputClass}
                      value={pickupAddress.city}
                      onChange={(e) =>
                        setPickupAddress((p) => ({ ...p, city: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Pincode">
                    <input
                      className={inputClass}
                      value={pickupAddress.pincode}
                      onChange={(e) =>
                        setPickupAddress((p) => ({ ...p, pincode: e.target.value }))
                      }
                    />
                  </Field>
                </div>
                <button
                  onClick={schedulePickup}
                  disabled={!estimate?.finalPrice || !pickupDateTime}
                  className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-60"
                >
                  Submit Request
                </button>
              </section>

              <aside className="rounded-xl border bg-white p-4">
                <h3 className="text-base font-bold">Order Summary</h3>
                <p className="mt-2 text-sm font-semibold">
                  {selectedBrand} {selectedModel}
                </p>
                <p className="text-sm text-slate-600">
                  Variant: {selectedRam} / {selectedStorage}
                </p>
                <p className="mt-2 text-xl font-extrabold">
                  ₹{estimate?.finalPrice ? formatMoney(estimate.finalPrice) : '0'}
                </p>
              </aside>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Order Confirmation</h2>
              <button
                onClick={() => resetToSelect()}
                className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
              >
                Start New Request
              </button>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <section className="rounded-xl border bg-white p-4">
                <h3 className="mb-3 text-base font-bold">Track Order</h3>
                <div className="space-y-2">
                  {ORDER_STATUSES.map((s, idx) => {
                    const done = idx <= statusIndex
                    return (
                      <div key={s.key} className="flex items-center gap-2">
                        <span
                          className={`h-3 w-3 rounded-full border ${done ? 'border-red-500 bg-red-200' : 'border-slate-300'}`}
                        />
                        <span className="text-sm font-semibold">
                          {s.label}
                          {done && idx === statusIndex ? ' (Current)' : ''}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 space-y-1 border-t pt-3 text-sm">
                  <p>
                    Order ID: <span className="font-mono">{order?.id}</span>
                  </p>
                  <p>Pickup: {pickupDateTime}</p>
                </div>
                {statusIndex < 2 && (
                  <button
                    onClick={() => setOrder((p) => ({ ...p, statusIndex: 2 }))}
                    className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-700"
                  >
                    Simulate: Device Received
                  </button>
                )}
                {statusIndex >= 2 && statusIndex < 3 && (
                  <div className="mt-4 space-y-3">
                    <Field label="Payment Method">
                      <select
                        className={inputClass}
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </Field>
                    <button
                      onClick={() =>
                        setOrder((p) => ({ ...p, statusIndex: 3, paymentMethod }))
                      }
                      className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-bold text-red-700"
                    >
                      Simulate: Pay Now
                    </button>
                  </div>
                )}
              </section>

              <aside className="rounded-xl border bg-white p-4">
                <h3 className="text-base font-bold">Device & Payment</h3>
                <p className="mt-2 text-sm font-semibold">
                  {order?.brand} {order?.model}
                </p>
                <p className="text-sm text-slate-600">
                  Variant: {order?.ram} / {order?.storage}
                </p>
                <p className="mt-2 text-xl font-extrabold">
                  ₹{order?.estimate ? formatMoney(order.estimate) : '0'}
                </p>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold">{label}</label>
      {children}
    </div>
  )
}

function ConditionSelect({ label, value, setValue, options }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold">{label}</label>
      <select
        className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-red-500 transition focus:ring-2"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}


