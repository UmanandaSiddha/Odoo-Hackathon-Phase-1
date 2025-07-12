import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'
import {
  Users,
  Repeat2,
  Star,
  TrendingUp,
  ChevronRight,
  Calendar
} from 'lucide-react'

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  delay
}: {
  title: string
  value: string | number
  icon: React.ElementType
  description: string
  delay: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="p-6 space-y-2">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  </motion.div>
)

const UpcomingSwap = ({
  title,
  with: partner,
  date,
  delay
}: {
  title: string
  with: string
  date: string
  delay: number
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
  >
    <div className="p-2 bg-primary/10 rounded-lg">
      <Calendar className="h-5 w-5 text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-medium truncate">{title}</h4>
      <p className="text-sm text-muted-foreground">with {partner}</p>
    </div>
    <p className="text-sm text-muted-foreground whitespace-nowrap">{date}</p>
  </motion.div>
)

const Dashboard = () => {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Total Swaps',
      value: 24,
      icon: Repeat2,
      description: '8 completed this month',
    },
    {
      title: 'Active Connections',
      value: 12,
      icon: Users,
      description: '3 new this week',
    },
    {
      title: 'Average Rating',
      value: '4.8',
      icon: Star,
      description: 'From 18 reviews',
    },
    {
      title: 'Skills Progress',
      value: '85%',
      icon: TrendingUp,
      description: '5 skills improved',
    },
  ]

  const upcomingSwaps = [
    {
      title: 'React Advanced Patterns',
      with: 'Sarah Chen',
      date: 'Today, 2:00 PM',
    },
    {
      title: 'UI/UX Design Basics',
      with: 'Mike Johnson',
      date: 'Tomorrow, 10:00 AM',
    },
    {
      title: 'Node.js Performance',
      with: 'Alex Kumar',
      date: 'Thu, 3:30 PM',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your skill swaps.
          </p>
        </div>
        <Button className="hidden sm:flex" asChild>
          <a href="/swaps/new">
            New Swap
            <ChevronRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} delay={i * 0.1} />
        ))}
      </div>

      {/* Upcoming Swaps */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold tracking-tight">
            Upcoming Swaps
          </h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View all
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          {upcomingSwaps.map((swap, i) => (
            <UpcomingSwap key={swap.title} {...swap} delay={i * 0.1} />
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Dashboard 