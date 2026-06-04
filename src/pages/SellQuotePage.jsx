import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Truck, Banknote } from 'lucide-react'
import {
  buildSellFlowSearch,
  readSellFlowParams,
  computeSellQuotePrice,
  formatInr,
  parsePriceNumber,
} from '../lib/sellFlowParams.js'

const PHONE_FALLBACK =
  'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=160&auto=format&fit=crop'

export default function SellQuotePage() {
  const [searchParams] = useSearchParams()
  const flow = readSellFlowParams(searchParams)

  const initialPrice = parsePriceNumber(flow.price)
  const finalPrice = useMemo(() => computeSellQuotePrice(flow.price, flow), [flow])

  const adjustment = initialPrice - finalPrice

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-8 text-center text-white sm:px-10">
            <CheckCircle2 className="mx-auto h-12 w-12 opacity-95" strokeWidth={1.75} />
            <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">Your final offer is ready</h1>
            <p className="mt-2 text-sm font-medium text-emerald-50/95">
              Based on the details you shared. Final amount confirmed at pickup after quick verification.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-2">
                <img
                  src={flow.img || PHONE_FALLBACK}
                  alt=""
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-lg font-bold text-slate-900">{flow.item}</p>
                {initialPrice > 0 && initialPrice !== finalPrice ? (
                  <p className="mt-1 text-sm text-slate-500">
                    Starting estimate ₹{formatInr(initialPrice)}
                    {adjustment > 0 ? (
                      <span className="text-amber-700"> · adjusted −₹{formatInr(adjustment)}</span>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">You get</p>
              <p className="mt-2 text-4xl font-black text-emerald-700 sm:text-5xl">₹{formatInr(finalPrice)}</p>
            </div>

            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              <li className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                <Truck className="h-8 w-8 text-red-600" strokeWidth={1.75} />
                <p className="mt-2 text-xs font-bold text-slate-800">Free doorstep pickup</p>
              </li>
              <li className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                <Banknote className="h-8 w-8 text-red-600" strokeWidth={1.75} />
                <p className="mt-2 text-xs font-bold text-slate-800">Instant payment</p>
              </li>
              <li className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-red-600" strokeWidth={1.75} />
                <p className="mt-2 text-xs font-bold text-slate-800">Secure & verified</p>
              </li>
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-red-600 px-8 text-base font-bold text-white transition hover:bg-red-700"
              >
                Login to schedule pickup
              </Link>
              <Link
                to="/sell/phone"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-base font-bold text-slate-700 transition hover:border-slate-300"
              >
                Sell another device
              </Link>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              <Link
                to={`/sell/accessories${buildSellFlowSearch(flow)}`}
                className="font-semibold text-red-600 hover:underline"
              >
                Back to accessories
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
