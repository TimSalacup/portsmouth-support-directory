import categoryImage1 from './assets/categories/mental-wellbeing-resources.webp'
import categoryImage2 from './assets/categories/veterans-support.webp'
import categoryImage3 from './assets/categories/elderly-support.webp'
import categoryImage4 from './assets/categories/relationship-support.webp'
import categoryImage5 from './assets/categories/bereavement.webp'
import categoryImage6 from './assets/categories/citizens-advice.webp'
import categoryImage7 from './assets/categories/domestic-abuse-and-rape.webp'
import categoryImage8 from './assets/categories/drugs-and-substance-abuse.webp'
import categoryImage9 from './assets/categories/end-of-life-support.webp'
import categoryImage10 from './assets/categories/paediatrics.webp'
import categoryImage11 from './assets/categories/mental-health-in-crisis.webp'
import categoryImage12 from './assets/categories/other-resources.webp'

const categories = [
  { title: "Mental Wellbeing Resources", image: categoryImage1 },
  { title: "Veterans Support", image: categoryImage2 },
  { title: "Elderly Support", image: categoryImage3 },
  { title: "Relationship Support", image: categoryImage4 },
  { title: "Bereavement", image: categoryImage5 },
  { title: "Citizens Advice", image: categoryImage6 },
  { title: "Domestic Abuse and Rape", image: categoryImage7 },
  { title: "Drugs and Substance Abuse", image: categoryImage8 },
  { title: "End of Life Support", image: categoryImage9 },
  { title: "Paediatrics", image: categoryImage10 },
  { title: "Mental Health in Crisis", image: categoryImage11 },
  { title: "Other Resources", image: categoryImage12 }
]

export default function App() {
  return (
    <>
      <header className="directory-header">
        <h1><span>PORTSMOUTH</span>{' '}<span>SUPPORT DIRECTORY</span></h1>
      </header>
      <main className="directory-content">
        <ul aria-label="Support categories" className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.title} className="category-card rounded-2xl p-8">
              <img className="category-background" src={category.image} alt="" loading="lazy" decoding="async" />
              <h2 className="category-title">{category.title}</h2>
              <span className="category-view" aria-hidden="true">
                <svg className="click-pointer" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
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
