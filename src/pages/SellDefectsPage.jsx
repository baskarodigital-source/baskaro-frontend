import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Smartphone, ScanLine, Wrench, PanelRight } from 'lucide-react'

const DEFECT_OPTIONS = [
  { id: 'screen-scratch', label: 'Broken/scratch on device screen', Icon: Smartphone },
  { id: 'screen-spot', label: 'Dead Spot/Visible line and Discoloration on screen', Icon: ScanLine },
  { id: 'body-dent', label: 'Scratch/Dent on device body', Icon: Wrench },
  { id: 'panel-broken', label: 'Device panel missing/broken', Icon: PanelRight },
]

export default function SellDefectsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const item = searchParams.get('item')?.trim() || 'Selected device'
  const price = searchParams.get('price')?.trim() || '24,120'
  const img = searchParams.get('img')?.trim() || ''
  const cat = searchParams.get('cat')?.trim() || 'phone'
  const calls = searchParams.get('calls')?.trim() || ''
  const touch = searchParams.get('touch')?.trim() || ''
  const screen = searchParams.get('screen')?.trim() || ''

  const [selectedDefects, setSelectedDefects] = useState([])

  const evalDeviceDetails = useMemo(() => {
    if (!calls) return []
    return calls === 'no' ? ['Not Able to Make and Receive Calls', 'No'] : ['Able to Make and Receive Calls', 'Yes']
  }, [calls])

  const evalScreenCondition = useMemo(() => {
    const lines = []
    if (touch) lines.push(touch === 'no' ? 'Touch Faulty' : 'Touch Working Properly')
    if (screen) lines.push(screen === 'no' ? 'Screen Replaced / Not Original' : 'Original Screen')
    if (selectedDefects.length) {
      const labels = DEFECT_OPTIONS.filter((o) => selectedDefects.includes(o.id)).map((o) => o.label)
      lines.push(...labels)
    }
    return lines
  }, [touch, screen, selectedDefects])

  const toggleDefect = (id) => {
    setSelectedDefects((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 text-xs font-semibold text-slate-500">
          <Link
            to={`/sell/device-check?item=${encodeURIComponent(item)}&cat=${encodeURIComponent(cat)}&price=${encodeURIComponent(price)}&img=${encodeURIComponent(img)}`}
            className="hover:text-red-600"
          >
            Back
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-center text-slate-800">Select screen/body defects that are applicable!</h1>
            <p className="mt-3 text-center text-slate-500">Please provide correct details</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {DEFECT_OPTIONS.map(({ id, label, Icon }) => {
                const active = selectedDefects.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleDefect(id)}
                    className={`overflow-hidden rounded-xl border text-center transition ${
                      active ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex h-36 items-center justify-center bg-slate-50">
                      <Icon className={`h-14 w-14 ${active ? 'text-red-600' : 'text-slate-600'}`} strokeWidth={1.75} />
                    </div>
                    <p className="min-h-[74px] bg-slate-100 px-3 py-3 text-sm font-semibold text-slate-800">{label}</p>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/sell/functional-problems?item=${encodeURIComponent(item)}&cat=${encodeURIComponent(cat)}&price=${encodeURIComponent(price)}&img=${encodeURIComponent(img)}&calls=${encodeURIComponent(calls)}&touch=${encodeURIComponent(touch)}&screen=${encodeURIComponent(screen)}`,
                )
              }
              className="mx-auto mt-10 flex h-11 min-w-[190px] items-center justify-center rounded-lg bg-red-600 px-6 text-lg font-bold text-white transition hover:bg-red-700"
            >
              Continue <span className="ml-2">→</span>
            </button>
          </section>

          <aside className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-4 border-b border-slate-200 p-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-slate-100 bg-white">
                <img src={img || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=160&auto=format&fit=crop'} alt="" className="max-h-full max-w-full object-contain" />
              </div>
              <p className="text-xl font-semibold text-slate-800">{item}</p>
            </div>
            <div className="space-y-5 p-4">
              <div className="text-sm text-slate-500">
                Estimated value: <span className="font-bold text-rose-500">₹{price}</span>
              </div>
              <div>
                <h3 className="text-[22px] font-semibold text-slate-800">Device Evaluation</h3>
                <div className="mt-3">
                  <p className="text-[18px] font-semibold text-slate-700">Device Details</p>
                  <ul className="mt-2 space-y-1.5">
                    {evalDeviceDetails.map((line) => (
                      <li key={line} className="flex items-start gap-2 text-[16px] text-slate-600">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <p className="text-[18px] font-semibold text-slate-700">Screen Condition</p>
                  <ul className="mt-2 space-y-1.5">
                    {evalScreenCondition.map((line) => (
                      <li key={line} className="flex items-start gap-2 text-[16px] text-slate-600">
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
