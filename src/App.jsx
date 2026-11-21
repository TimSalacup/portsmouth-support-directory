const categories = [
  "Mental Wellbeing Resources",
  "Veterans Support",
  "Elderly Support",
  "Relationship Support",
  "Bereavement",
  "Citizens Advice",
  "Domestic Abuse and Rape",
  "Drugs and Substance Abuse",
  "End of Life Support",
  "Paediatrics",
  "Mental Health in Crisis",
  "Other Resources"
]

export default function App() {
  return (
    <>
      <nav aria-label="Directory title" className="px-6 py-8 text-center">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Portsmouth Support Directory</h1>
      </nav>
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:px-8 sm:pt-12">
        <ul aria-label="Support categories" className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category} className={`category-card rounded-2xl p-8 ${category === 'Mental Health in Crisis' ? 'category-card--crisis' : ''}`}>
              <h2 className="text-2xl font-semibold leading-8 tracking-tight">{category}</h2>
              <span className="category-view" aria-hidden="true">
                <svg className="click-pointer" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                  <path d="m8 8 4 12 2-5 5-2-11-5Z" />
                  <g className="click-rays"><path d="M8 2v2M2 8h2M3.5 3.5 5 5M12 3l-1 2M3 12l2-1" /></g>
                </svg>
                <span className="view-word">view</span>
              </span>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
