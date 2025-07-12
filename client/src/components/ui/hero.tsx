import { Link } from 'react-router-dom'
import { Button } from './button'

export const Hero = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-12 bg-background text-foreground relative overflow-hidden pt-20">
      {/* Purple accent in background */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/20 blur-[120px] rounded-full" />
      
      {/* New tag */}
      <div className="flex items-center gap-2 bg-background/5 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-border">
        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">New</span>
        <span className="text-sm text-muted-foreground">Real-time Skill Matching Platform</span>
      </div>

      {/* Main heading */}
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold max-w-4xl mb-6 leading-tight tracking-tight">
        Connect, Learn,
        <br />
        and Grow with
        <br />
        Skill Swap.
      </h1>

      {/* Subheading */}
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
        Join our community of learners and experts. Exchange skills, share knowledge, and build meaningful connections in real-time.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        <Button 
          asChild 
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 h-auto rounded-xl"
        >
          <Link to="/register">Get in touch →</Link>
        </Button>
        <Button 
          asChild 
          variant="outline" 
          className="text-lg px-8 py-6 h-auto border-border text-foreground hover:bg-accent rounded-xl"
        >
          <Link to="/services">View services</Link>
        </Button>
      </div>
    </div>
  )
} 