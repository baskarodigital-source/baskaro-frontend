import iphone14Front from '../assets/products/iphone14_purple.jpg'

/**
 * Full-width teal “Download the App” strip (matches home page CTA).
 */
export function DownloadAppBanner({
  subtitle = 'Sell your old phone | Buy top-quality pre-owned phones | Get your phone repaired',
}) {
  return (
    <section className="w-full pb-10">
      <div className="w-full overflow-hidden bg-[#b00008] px-4 py-8 shadow-sm sm:px-6 sm:py-10 lg:px-10 xl:px-16">
        <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Download the App
            </h2>
            <p className="mt-3 text-base font-semibold text-white/90 sm:text-lg">{subtitle}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-lg bg-black px-4 py-2 text-left text-white shadow-sm transition hover:bg-slate-900"
              >
                <svg
                  width="18"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M3 2v20l11-10L3 2Z" fill="#34A853" />
                  <path d="M14 12 20.5 8.3 17 6.3 10.5 10 14 12Z" fill="#FBBC05" />
                  <path d="M14 12 10.5 14 17 17.7l3.5-2-6.5-3.7Z" fill="#EA4335" />
                  <path d="M3 2 10.5 10 14 12 10.5 14 3 22" stroke="#4285F4" strokeWidth="1.5" />
                </svg>
                <span className="leading-tight">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-white/70">
                    Get it on
                  </span>
                  <span className="block text-xl font-bold">Google Play</span>
                </span>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-lg bg-black px-4 py-2 text-left text-white shadow-sm transition hover:bg-slate-900"
              >
                <svg
                  width="18"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M16.5 12.5c0-2 1.7-3 1.8-3.1-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.6 0-3 .9-3.8 2.3-1.6 2.8-.4 6.9 1.1 9.1.7 1.1 1.6 2.4 2.8 2.4 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 2-1.1 2.7-2.2.8-1.2 1.1-2.4 1.1-2.5 0 0-2.1-.8-2.1-4.2Z"
                    fill="currentColor"
                  />
                  <path
                    d="M14.4 5.8c.6-.7 1-1.6.9-2.6-.9 0-2 .6-2.7 1.3-.6.6-1.1 1.6-1 2.5 1 .1 2-.5 2.8-1.2Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="leading-tight">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-white/70">
                    Download on the
                  </span>
                  <span className="block text-xl font-bold">App Store</span>
                </span>
              </a>
            </div>
          </div>

          <div className="relative h-[220px] w-full max-w-[420px] shrink-0 self-end sm:h-[260px]">
            <img
              src={iphone14Front}
              alt=""
              className="absolute bottom-0 right-6 h-[220px] w-auto rounded-2xl object-contain drop-shadow-2xl sm:h-[260px] mix-blend-multiply"
              loading="lazy"
            />
            <img
              src="https://commons.wikimedia.org/wiki/Special:FilePath/Smartphone.png"
              alt=""
              className="absolute bottom-2 right-40 h-[190px] w-auto rounded-2xl object-contain drop-shadow-2xl sm:bottom-3 sm:h-[225px]"
              loading="lazy"
            />
            <div
              className="absolute bottom-0 left-3 flex h-[170px] w-[140px] items-center justify-center rounded-2xl bg-white text-3xl font-extrabold tracking-tight text-slate-900 shadow-lg sm:h-[200px] sm:w-[160px] sm:text-4xl"
              aria-hidden="true"
            >
              BAS
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
