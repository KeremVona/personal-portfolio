import { Nav } from './components/Nav'
import { SkipLink } from './components/SkipLink'
import { useInitialHashScroll } from './hooks/useInitialHashScroll'
import { About } from './sections/About'
import { Experience } from './sections/Experience'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Projects } from './sections/Projects'

function App() {
  useInitialHashScroll()

  return (
    <>
      <SkipLink />
      <Nav />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <About />
        <Projects />
        <Experience />
      </main>
      <Footer />
    </>
  )
}

export default App
