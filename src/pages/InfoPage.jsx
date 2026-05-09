import { Link, useLocation } from 'react-router-dom'

const PAGE_META = {
  '/new-offers': {
    title: 'New Offers',
    description: 'Check latest deals, cashback, and seasonal offers across gadgets and services.',
  },
  '/partner': {
    title: 'Partner',
    description: 'Explore partnership opportunities with Baskaro for business growth.',
  },
  '/contact': {
    title: 'Contact',
    description: 'Reach the Baskaro team for support, assistance, and queries.',
  },
  '/contact-us': {
    title: 'Contact Us',
    description: 'Get in touch with us for product, order, or service related help.',
  },
  '/articles': {
    title: 'Articles',
    description: 'Read useful gadget guides, comparisons, and buying tips.',
  },
  '/become-partner': {
    title: 'Become Partner',
    description: 'Join Baskaro as a partner and expand your services with us.',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions',
    description: 'Review terms governing usage of Baskaro services and platform.',
  },
}

export default function InfoPage() {
  const { pathname } = useLocation()
  const page = PAGE_META[pathname] ?? {
    title: 'Information',
    description: 'This page is ready for content.',
  }

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Baskaro</p>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">{page.title}</h1>
      <p className="mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">{page.description}</p>
      <Link to="/" className="mt-8 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600">
        Back to Home
      </Link>
    </section>
  )
}
