import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface FeatureCardProps {
  title: string
  tag: string
  description: string
  imageSrc: string
  isReversed?: boolean
}

const FeatureCard = ({ title, tag, description, imageSrc, isReversed = false }: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring animations for smooth movement - reduced rotation for subtler effect
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [3, -3]), {
    stiffness: 200,
    damping: 25
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-3, 3]), {
    stiffness: 200,
    damping: 25
  })

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Calculate mouse position relative to card center (-1 to 1)
    mouseX.set((event.clientX - centerX) / rect.width)
    mouseY.set((event.clientY - centerY) / rect.height)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  useEffect(() => {
    console.log(`FeatureCard mounted for ${title}, loading image: ${imageSrc}`)
  }, [title, imageSrc])

  return (
    <div className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center py-20`}>
      {/* Content */}
      <div className="flex-1 text-left">
        <div className="inline-block bg-primary/5 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/10 mb-6">
          <span className="text-sm text-primary/80">{tag}</span>
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground">{title}</h2>
        <p className="text-lg text-muted-foreground max-w-xl">{description}</p>
      </div>

      {/* Image with 3D effect */}
      <motion.div 
        ref={cardRef}
        className="flex-1 relative group perspective-1000"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
      >
        <div 
          className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full 
                     group-hover:bg-primary/10 transition-all duration-300"
          style={{
            transform: "translateZ(-40px)"
          }}
        />
        <motion.div 
          className="relative bg-card rounded-xl overflow-hidden border border-border"
          whileHover={{ scale: 1.01 }}
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(40px)"
          }}
        >
          <img 
            src={imageSrc} 
            alt={title} 
            className="w-full h-auto"
            onLoad={() => console.log(`Image loaded successfully: ${imageSrc}`)}
            onError={(e) => {
              console.error(`Failed to load image: ${imageSrc}`);
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </motion.div>

        {/* Subtle highlight effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 
                     group-hover:opacity-100 transition-opacity duration-300"
          style={{
            transform: "translateZ(60px)",
            pointerEvents: "none"
          }}
        />
      </motion.div>
    </div>
  )
}

export const Features = () => {
  const features = [
    {
      tag: "Task Help",
      title: "Get help on your tasks",
      description: "Post your tasks and connect with skilled helpers who can assist you. Our platform makes it easy to find the right person with the expertise you need, like a free freelancing marketplace focused on skill exchange.",
      imageSrc: "/features/task-help.svg"
    },
    {
      tag: "Skill Matching",
      title: "Find the perfect learning partner",
      description: "Our intelligent matching system connects you with users who have complementary skills, ensuring meaningful exchanges and optimal learning outcomes.",
      imageSrc: "/features/skill-matching.svg"
    },
    {
      tag: "Real-time Collaboration",
      title: "Learn and teach in real-time",
      description: "Engage in live skill-sharing sessions with built-in tools for video calls, screen sharing, and collaborative workspaces.",
      imageSrc: "/features/real-time.svg"
    },
    {
      tag: "Progress Tracking",
      title: "Track your learning journey",
      description: "Monitor your progress, set learning goals, and get insights into your skill development through our comprehensive tracking system.",
      imageSrc: "/features/progress.svg"
    },
    {
      tag: "Community Engagement",
      title: "Join a thriving community",
      description: "Connect with a diverse community of learners and experts, participate in group sessions, and build your professional network.",
      imageSrc: "/features/community.svg"
    }
  ]

  useEffect(() => {
    console.log('Features component mounted, image paths:', features.map(f => f.imageSrc))
  }, [])

  return (
    <section className="w-full bg-background px-6 md:px-12 py-20">
      <div className="max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <FeatureCard 
            key={feature.tag}
            {...feature}
            isReversed={index % 2 !== 0}
          />
        ))}
      </div>
    </section>
  )
} 