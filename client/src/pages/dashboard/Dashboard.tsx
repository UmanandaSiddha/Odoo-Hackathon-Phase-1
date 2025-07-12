import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/AuthContext'
import {
  Users,
  Repeat2,
  Star,
  TrendingUp,
  ChevronRight,
  Calendar,
  Clock,
  ArrowUpRight,
  Activity,
  Target,
  Award,
  BarChart
} from 'lucide-react'

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  delay
}: {
  title: string
  value: string | number
  icon: React.ElementType
  description: string
  trend?: { value: number; isPositive: boolean }
  delay: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -5 }}
    className="group"
  >
    <Card className="p-6 space-y-2 transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
        </div>
        <motion.div 
          className="p-2 bg-primary/10 rounded-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="h-5 w-5 text-primary" />
        </motion.div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{description}</p>
        {trend && (
          <Badge variant={trend.isPositive ? 'default' : 'destructive'} className="ml-2">
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </Badge>
        )}
      </div>
    </Card>
  </motion.div>
)

const UpcomingSwap = ({
  title,
  with: partner,
  date,
  skillToLearn,
  skillToTeach,
  delay
}: {
  title: string
  with: string
  date: string
  skillToLearn: string
  skillToTeach: string
  delay: number
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    whileHover={{ x: 5 }}
  >
    <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{title}</h4>
            <Badge variant="outline" className="text-xs">
              {skillToLearn} ↔ {skillToTeach}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">with {partner}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{date}</span>
            </div>
          </div>
          <motion.div whileHover={{ x: 5 }}>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </div>
    </Card>
  </motion.div>
)

const SkillProgress = ({
  skill,
  progress,
  level,
  hoursSpent,
  delay
}: {
  skill: string
  progress: number
  level: string
  hoursSpent: number
  delay: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="group"
  >
    <Card className="p-4 hover:bg-accent/50 transition-colors">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">{skill}</h4>
            <p className="text-sm text-muted-foreground">{level}</p>
          </div>
          <Badge>{hoursSpent}h spent</Badge>
        </div>
        <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </Card>
  </motion.div>
)

const AchievementCard = ({
  title,
  description,
  icon: Icon,
  delay
}: {
  title: string
  description: string
  icon: React.ElementType
  delay: number
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    whileHover={{ scale: 1.05 }}
  >
    <Card className="p-4 text-center hover:bg-accent/50 transition-colors">
      <motion.div 
        className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        <Icon className="h-6 w-6 text-primary" />
      </motion.div>
      <h4 className="font-medium mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
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
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Active Connections',
      value: 12,
      icon: Users,
      description: '3 new this week',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Average Rating',
      value: '4.8',
      icon: Star,
      description: 'From 18 reviews',
      trend: { value: 5, isPositive: true }
    },
    {
      title: 'Skills Progress',
      value: '85%',
      icon: TrendingUp,
      description: '5 skills improved',
      trend: { value: 15, isPositive: true }
    },
  ]

  const upcomingSwaps = [
    {
      title: 'React Advanced Patterns',
      with: 'Sarah Chen',
      date: 'Today, 2:00 PM',
      skillToLearn: 'React',
      skillToTeach: 'UI/UX'
    },
    {
      title: 'UI/UX Design Basics',
      with: 'Mike Johnson',
      date: 'Tomorrow, 10:00 AM',
      skillToLearn: 'UI/UX',
      skillToTeach: 'Node.js'
    },
    {
      title: 'Node.js Performance',
      with: 'Alex Kumar',
      date: 'Thu, 3:30 PM',
      skillToLearn: 'Node.js',
      skillToTeach: 'React'
    },
  ]

  const skillProgress = [
    {
      skill: 'React Development',
      progress: 85,
      level: 'Advanced',
      hoursSpent: 48
    },
    {
      skill: 'UI/UX Design',
      progress: 60,
      level: 'Intermediate',
      hoursSpent: 32
    },
    {
      skill: 'Node.js',
      progress: 40,
      level: 'Beginner',
      hoursSpent: 24
    }
  ]

  const achievements = [
    {
      title: 'Fast Learner',
      description: 'Completed 5 skills in record time',
      icon: Activity
    },
    {
      title: 'Goal Setter',
      description: 'Achieved all learning objectives',
      icon: Target
    },
    {
      title: 'Top Rated',
      description: 'Maintained 4.8+ rating',
      icon: Award
    },
    {
      title: 'Consistent',
      description: '30-day learning streak',
      icon: BarChart
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
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
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Swaps */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Swaps</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View all
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="space-y-4">
              {upcomingSwaps.map((swap, i) => (
                <UpcomingSwap key={swap.title} {...swap} delay={i * 0.1} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skill Progress */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center justify-between">
              <CardTitle>Skill Progress</CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View all
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="space-y-4">
              {skillProgress.map((skill, i) => (
                <SkillProgress key={skill.skill} {...skill} delay={i * 0.1} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="grid gap-4 md:grid-cols-4">
            {achievements.map((achievement, i) => (
              <AchievementCard key={achievement.title} {...achievement} delay={i * 0.1} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard 