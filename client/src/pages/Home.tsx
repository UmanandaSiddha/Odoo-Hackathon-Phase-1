import { Navbar } from '../components/ui/navbar'
import { Hero } from '../components/ui/hero'
import { Features } from '../components/ui/features'
import { FAQ } from '../components/ui/faq'
import { Contact } from '../components/ui/contact'
import { Footer } from '../components/ui/footer'

export const Home = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  )
} 