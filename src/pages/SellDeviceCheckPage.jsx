import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const QUESTIONS = [
  {
    key: 'calls',
    title: 'Are you able to make and receive calls?',
    text: 'Check your device for cellular network connectivity issues.',
  },
  {
    key: 'touch',
    title: "Is your device's touch screen working properly?",
    text: 'Check the touch screen functionality of your phone.',
  },
  {
    key: 'screen',
    title: "Is your phone's screen original?",
    text: 'Pick "Yes" if screen was never changed or was changed by Authorized Service Center. Pick "No" if changed at local shop.',
  },
]

function ChoiceButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 w-full items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
        active
          ? 'border-red-400 bg-red-50 text-red-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      }`}
    >
      <span className={`h-4 w-4 rounded-full border ${active ? 'border-red-500 bg-red-500' : 'border-slate-300 bg-white'}`} />
      {label}
    </button>
  )
}

export default function SellDeviceCheckPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const item = searchParams.get('item')?.trim() || 'Selected device'
  const price = searchParams.get('price')?.trim() || '24,120'
  const img = searchParams.get('img')?.trim() || ''
  const cat = searchParams.get('cat')?.trim() || 'phone'

  const [answers, setAnswers] = useState({})
  const allAnswered = useMemo(() => QUESTIONS.every((q) => answers[q.key]), [answers])
  const evalDeviceDetails = useMemo(() => {
    if (!answers.calls) return []
    if (answers.calls === 'no') return ['Not Able to Make and Receive Calls', 'No']
    return ['Able to Make and Receive Calls', 'Yes']
  }, [answers.calls])

  const evalScreenCondition = useMemo(() => {
    const lines = []
    if (answers.touch) {
      lines.push(answers.touch === 'no' ? 'Touch Faulty' : 'Touch Working Properly')
    }
    if (answers.screen) {
      lines.push(answers.screen === 'no' ? 'Screen Replaced / Not Original' : 'Original Screen')
    }
    return lines
  }, [answers.touch, answers.screen])

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 text-xs font-semibold text-slate-500">
          <Link to={`/sell/sub?item=${encodeURIComponent(item)}&cat=${encodeURIComponent(cat)}&price=${encodeURIComponent(price)}&img=${encodeURIComponent(img)}`} className="hover:text-red-600">
            Back
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-center text-slate-800">Tell us more about your device?</h1>
            <p className="mt-3 text-center text-slate-500">Please answer a few questions about your device.</p>

            <div className="mt-8 space-y-8">
              {QUESTIONS.map((q) => (
                <div key={q.key}>
                  <h3 className="text-[30px] font-bold text-slate-900">{q.title}</h3>
                  <p className="mt-2 text-[22px] text-slate-500">{q.text}</p>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-[520px]">
                    <ChoiceButton active={answers[q.key] === 'yes'} label="Yes" onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: 'yes' }))} />
                    <ChoiceButton active={answers[q.key] === 'no'} label="No" onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: 'no' }))} />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={!allAnswered}
              onClick={() =>
                navigate(
                  `/sell/defects?item=${encodeURIComponent(item)}&cat=${encodeURIComponent(cat)}&price=${encodeURIComponent(price)}&img=${encodeURIComponent(img)}&calls=${encodeURIComponent(answers.calls || '')}&touch=${encodeURIComponent(answers.touch || '')}&screen=${encodeURIComponent(answers.screen || '')}`,
                )
              }
              className="mx-auto mt-8 flex h-11 min-w-[190px] items-center justify-center rounded-lg bg-red-600 px-6 text-lg font-bold text-white transition enabled:hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                    {evalDeviceDetails.length ? (
                      evalDeviceDetails.map((line) => (
                        <li key={line} className="flex items-start gap-2 text-[16px] text-slate-600">
                          <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                          <span>{line}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[16px] text-slate-400">Select call condition</li>
                    )}
                  </ul>
                </div>

                <div className="mt-4">
                  <p className="text-[18px] font-semibold text-slate-700">Screen Condition</p>
                  <ul className="mt-2 space-y-1.5">
                    {evalScreenCondition.length ? (
                      evalScreenCondition.map((line) => (
                        <li key={line} className="flex items-start gap-2 text-[16px] text-slate-600">
                          <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                          <span>{line}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[16px] text-slate-400">Select screen answers</li>
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
