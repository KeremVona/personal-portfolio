import { LazyMotion, MotionConfig } from 'motion/react'
import { Nav } from './components/Nav'
import { SkipLink } from './components/SkipLink'
import { useInitialHashScroll } from './hooks/useInitialHashScroll'
import { About } from './sections/About'
import { Experience } from './sections/Experience'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Projects } from './sections/Projects'

const loadMotionFeatures = () =>
  import('./motionFeatures').then((module) => module.default)

function App() {
  useInitialHashScroll()

  return (
    // Animation features load as a separate chunk; reduced motion keeps fades, drops movement.
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <SkipLink />
        <Nav />
        <main id="main" tabIndex={-1} className="focus:outline-none">
          <Hero />
          <About />
          <Projects />
          <Experience />
        </main>
        <Footer />
      </MotionConfig>
    </LazyMotion>
  )
}

export default App
