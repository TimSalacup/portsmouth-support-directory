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
      <nav aria-label="Directory title" className="border-b border-[#d9dfda] px-6 py-8 text-center">
        <h1 className="text-xl font-medium tracking-tight sm:text-2xl">Portsmouth Support Directory</h1>
      </nav>
      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
        <ul aria-label="Support categories" className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category} className={`flex min-h-40 items-end rounded-2xl border p-6 sm:min-h-48 sm:p-8 ${category === 'Mental Health in Crisis' ? 'border-[#a7bdb7] bg-[#e7eeea] text-[#254f48]' : 'border-[#d9dfda] bg-[#fffefa]'}`}>
              <h2 className="max-w-64 text-2xl font-medium leading-8 tracking-tight">{category}</h2>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
