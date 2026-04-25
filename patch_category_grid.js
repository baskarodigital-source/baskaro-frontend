const fs = require('fs');
const file = 'src/pages/LandingPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const categoryGridComponent = `
function CategoryGridSection() {
  const navigate = useNavigate()
  return (
    <section className="w-full py-12 bg-gray-50 border-y border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black text-blue-950 tracking-tight sm:text-3xl">
            Shop by Category <span className="text-red-600">.</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
          {MORE_CATEGORIES.map((c) => (
            <button
              key={c.title}
              type="button"
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:ring-blue-900 hover:shadow-xl"
              onClick={() => c.path && navigate(c.path)}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-50 shadow-sm transition-transform group-hover:scale-110">
                <img
                  src={c.img}
                  alt={c.title}
                  className="h-10 w-10 object-contain drop-shadow-sm"
                  loading="lazy"
                />
              </div>
              <span className="text-center text-[11px] font-black uppercase tracking-widest text-gray-600 group-hover:text-red-600">
                {c.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {`;

content = content.replace('export default function LandingPage() {', categoryGridComponent);
fs.writeFileSync(file, content);
