import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { buildSellFlowSearch, readSellFlowParams } from '../lib/sellFlowParams.js'
import {
  Camera,
  Fingerprint,
  Volume2,
  Wifi,
  Speaker,
  BellOff,
  Power,
  Battery,
  Mic,
  Bluetooth,
  Vibrate,
  ScanFace,
  PhoneCall,
} from 'lucide-react'

const FUNCTIONAL_OPTIONS = [
  { id: 'front-camera', label: 'Front Camera not working', Icon: Camera },
  { id: 'back-camera', label: 'Back Camera not working', Icon: Camera },
  { id: 'volume-button', label: 'Volume Button not working', Icon: Volume2 },
  { id: 'finger-touch', label: 'Finger Touch not working', Icon: Fingerprint },
  { id: 'wifi', label: 'WiFi not working', Icon: Wifi },
  { id: 'speaker', label: 'Speaker Faulty', Icon: Speaker },
  { id: 'silent-button', label: 'Silent Button not working', Icon: BellOff },
  { id: 'face-sensor', label: 'Face Sensor not working', Icon: ScanFace },
  { id: 'power-button', label: 'Power Button not working', Icon: Power },
  { id: 'charging-port', label: 'Charging Port not working', Icon: Battery },
  { id: 'audio-receiver', label: 'Audio Receiver not working', Icon: PhoneCall },
  { id: 'camera-glass', label: 'Camera Glass Broken', Icon: Camera },
  { id: 'microphone', label: 'Microphone not working', Icon: Mic },
  { id: 'bluetooth', label: 'Bluetooth not working', Icon: Bluetooth },
  { id: 'vibrator', label: 'Vibrator is not working', Icon: Vibrate },
  { id: 'proximity', label: 'Proximity Sensor not working', Icon: ScanFace },
  { id: 'battery-service', label: 'Battery in Service (Health is less than 80%)', Icon: Battery },
  { id: 'battery-health', label: 'Battery Health 80-85%', Icon: Battery },
]

export default function SellFunctionalProblemsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const flow = readSellFlowParams(searchParams)
  const { item, price, img, cat, calls, touch, screen } = flow
  const flowQuery = buildSellFlowSearch(flow)

  const [selectedFunctional, setSelectedFunctional] = useState([])

  const evalDeviceDetails = useMemo(() => {
    if (!calls) return []
    return calls === 'no' ? ['Not Able to Make and Receive Calls', 'No'] : ['Able to Make and Receive Calls', 'Yes']
  }, [calls])

  const evalScreenCondition = useMemo(() => {
    const lines = []
    if (touch) lines.push(touch === 'no' ? 'Touch Faulty' : 'Touch Working Properly')
    if (screen) lines.push(screen === 'no' ? 'Screen Replaced / Not Original' : 'Original Screen')
    return lines
  }, [touch, screen])

  const evalFunctional = useMemo(
    () => FUNCTIONAL_OPTIONS.filter((o) => selectedFunctional.includes(o.id)).map((o) => o.label),
    [selectedFunctional],
  )

  const toggleFunctional = (id) => {
    setSelectedFunctional((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 text-xs font-semibold text-slate-500">
          <Link to={`/sell/defects${flowQuery}`} className="hover:text-red-600">
            Back
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-center text-slate-800">Functional or Physical Problems</h1>
            <p className="mt-3 text-center text-slate-500">Please choose appropriate condition to get accurate quote</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {FUNCTIONAL_OPTIONS.map(({ id, label, Icon }) => {
                const active = selectedFunctional.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleFunctional(id)}
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
                  `/sell/accessories${buildSellFlowSearch({
                    ...flow,
                    functional: selectedFunctional.join(','),
                  })}`,
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
                <div className="mt-4">
                  <p className="text-[18px] font-semibold text-slate-700">Functional Condition</p>
                  <ul className="mt-2 space-y-1.5">
                    {evalFunctional.length ? (
                      evalFunctional.map((line) => (
                        <li key={line} className="flex items-start gap-2 text-[16px] text-slate-600">
                          <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                          <span>{line}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[16px] text-slate-400">Select functional issues</li>
                    )}
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
