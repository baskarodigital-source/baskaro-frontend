import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

const FOOTER_SECTIONS = [
  {
    id: 'services',
    title: 'Services',
    links: [
      { label: 'Sell Phone', to: '/sell/phone' },
      { label: 'Buy Pre-Owned', to: '/buy-pre-owned' },
      { label: 'Find New Phone', to: '/find-new-phone' },
      { label: 'Repair Phone', to: '/repair-phone' },
      { label: 'Nearby Stores', to: '/nearby-stores' },
    ],
  },
  {
    id: 'company',
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Contact', to: '/contact' },
      { label: 'Warranty', to: '/warranty-policy' },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    links: [
      { label: 'FAQ', to: '/about' },
      { label: 'Refund Policy', to: '/warranty-policy' },
      { label: 'Terms', to: '/terms-and-conditions' },
    ],
  },
]

function MobileFooterAccordion({ section }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[44px] w-full items-center justify-between py-3 text-left text-sm font-bold text-white"
        aria-expanded={open}
      >
        {section.title}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <ul className="space-y-2.5 pb-3 pl-0.5">
          {section.links.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                className="block py-0.5 text-sm font-semibold text-white/75 transition hover:text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function MobileFooter() {
  return (
    <footer className="border-t border-red-950/40 bg-gradient-to-b from-[#6f0006] via-[#260001] to-black text-white md:hidden">
      <div className="px-4 py-5">
        <img
          src="/logo.png"
          alt="BAS karo"
          className="h-12 w-auto max-w-[190px] object-contain object-left brightness-0 invert"
        />
        <p className="mt-2 max-w-xs text-sm font-medium leading-snug text-white/70">
          Buy & sell pre-owned devices — fast, secure, transparent.
        </p>

        <div className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-black/20 px-3">
          {FOOTER_SECTIONS.map((section) => (
            <MobileFooterAccordion key={section.id} section={section} />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/sell/phone"
            className="min-h-[40px] rounded-full bg-red-600 px-4 py-2 text-xs font-black text-white"
          >
            Sell device
          </Link>
          <Link
            to="/buy-pre-owned"
            className="min-h-[40px] rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white"
          >
            Shop deals
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-3 text-[11px] font-semibold text-white/50">
          <p className="w-full">&copy; {new Date().getFullYear()} BAS karo</p>
          <Link className="hover:text-white/80" to="/warranty-policy">
            Privacy
          </Link>
          <Link className="hover:text-white/80" to="/warranty-policy">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}

function DesktopFooter() {
  return (
    <footer className="hidden border-t border-red-950/40 bg-gradient-to-b from-[#6f0006] via-[#260001] to-black text-white md:block">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_1fr_1fr_1fr]">
          <div>
            <img
              src="/logo.png"
              alt="BAS karo"
              className="h-16 w-auto max-w-[250px] object-contain object-left brightness-0 invert"
            />
            <p className="mt-4 max-w-md text-base font-semibold leading-relaxed text-white/80">
              India's most trusted platform to buy and sell pre-owned devices. Fast, secure, and transparent.
            </p>

            <h4 className="mt-8 text-[11px] font-black uppercase tracking-[0.22em] text-red-300">
              Stay Updated
            </h4>
            <p className="mt-2 text-sm font-medium text-white/65">
              Subscribe to get the best deals on pre-owned flagships.
            </p>

            <div className="mt-4 flex max-w-md items-center gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-11 flex-1 rounded-full border border-white/15 bg-black/30 px-4 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-red-500"
              />
              <button
                type="button"
                className="h-11 rounded-full bg-red-600 px-7 text-sm font-black text-white transition hover:bg-red-700"
              >
                Join
              </button>
            </div>

            <div className="mt-8 flex items-center gap-3">
              {['f', 't', 'ig', 'in'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-bold text-white/75 transition hover:border-white/35 hover:text-white"
                  aria-label={`Open ${item} social link`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white">Services</h3>
            <div className="mt-5 space-y-4 text-sm font-semibold text-white/80">
              <Link className="block transition-colors hover:text-white" to="/sell/phone">
                Sell Phone
              </Link>
              <Link className="block transition-colors hover:text-white" to="/find-new-phone">
                Find New Phone
              </Link>
              <Link className="block transition-colors hover:text-white" to="/buy-accessories">
                Buy Accessories
              </Link>
              <Link className="block transition-colors hover:text-white" to="/repair-phone">
                Repair Phone
              </Link>
              <Link className="block transition-colors hover:text-white" to="/nearby-stores">
                Nearby Stores
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white">Company</h3>
            <div className="mt-5 space-y-4 text-sm font-semibold text-white/80">
              <Link className="block transition-colors hover:text-white" to="/about">
                About Us
              </Link>
              <Link className="block transition-colors hover:text-white" to="/careers">
                Careers
              </Link>
              <Link className="block transition-colors hover:text-white" to="/warranty-policy">
                Privacy Policy
              </Link>
              <Link className="block transition-colors hover:text-white" to="/warranty-policy">
                Terms of Use
              </Link>
              <Link className="block transition-colors hover:text-white" to="/warranty-policy">
                Warranty
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.16em] text-white">Support</h3>
            <div className="mt-5 space-y-4 text-sm font-semibold text-white/80">
              <Link className="block transition-colors hover:text-white" to="/about">
                FAQ
              </Link>
              <Link className="block transition-colors hover:text-white" to="/about">
                Contact Us
              </Link>
              <Link className="block transition-colors hover:text-white" to="/warranty-policy">
                Refund Policy
              </Link>
              <Link className="block transition-colors hover:text-white" to="/warranty-policy">
                Shipping
              </Link>
              <Link className="block transition-colors hover:text-white" to="/about">
                Sitemap
              </Link>
            </div>
            <div className="mt-8">
              <Link
                to="/login"
                state={{ redirectTo: '/admin' }}
                className="inline-flex rounded-xl bg-red-950/70 px-4 py-2 text-sm font-black text-red-300 ring-1 ring-red-800/80 transition hover:bg-red-900/80 hover:text-red-200"
              >
                Admin Portal
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs font-semibold text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} BAS karo. All rights reserved. Made in India with ❤️
          </p>
          <div className="flex items-center gap-6 uppercase tracking-[0.14em]">
            <Link className="transition hover:text-white/80" to="/warranty-policy">
              Privacy
            </Link>
            <Link className="transition hover:text-white/80" to="/warranty-policy">
              Terms
            </Link>
            <Link className="transition hover:text-white/80" to="/warranty-policy">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export function SiteFooter() {
  return (
    <>
      <MobileFooter />
      <DesktopFooter />
    </>
  )
}
