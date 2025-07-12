import { Link } from 'react-router-dom'
import { Button } from './button'
import { ThemeToggle } from './theme-toggle'

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 w-full py-4 px-6 md:px-12 flex items-center justify-between bg-background/50 backdrop-blur-sm z-50 border-b border-border">
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="Skill Swap" className="h-6 text-foreground" />
        <span className="text-xl font-bold text-foreground">SKILL SWAP</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
        <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
        <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
        <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button asChild variant="secondary" className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">
          <Link to="/register">Book a call</Link>
        </Button>
      </div>
    </nav>
  )
} 