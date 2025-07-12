import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// import { useAuth } from '@/features/auth/AuthContext'
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
  BarChart,
  AlertCircle
} from 'lucide-react'
import { getDashboardStats, type DashboardStats } from '@/services/api'

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

const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-64">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
    />
  </div>
)

const ErrorMessage = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-2 p-4 text-destructive bg-destructive/10 rounded-lg"
  >
    <AlertCircle className="h-5 w-5" />
    <p>{message}</p>
  </motion.div>
)

const Dashboard = () => {
  // const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getDashboardStats()
        
        // Validate the required data
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format')
        }

        // Set default values for missing data
        const validatedData: DashboardStats = {
          totalSwaps: data.totalSwaps ?? 0,
          activeConnections: data.activeConnections ?? 0,
          averageRating: data.averageRating ?? 0,
          skillsProgress: data.skillsProgress ?? 0,
          completedSwapsThisMonth: data.completedSwapsThisMonth ?? 0,
          newConnectionsThisWeek: data.newConnectionsThisWeek ?? 0,
          totalReviews: data.totalReviews ?? 0,
          improvedSkills: data.improvedSkills ?? 0,
          upcomingSwaps: Array.isArray(data.upcomingSwaps) ? data.upcomingSwaps : [],
          skillProgress: Array.isArray(data.skillProgress) ? data.skillProgress : []
        }

        setDashboardData(validatedData)
      } catch (err) {
        console.error('Dashboard stats error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard statistics. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!dashboardData) {
    return null
  }

  const stats = [
    {
      title: 'Total Swaps',
      value: dashboardData.totalSwaps,
      icon: Repeat2,
      description: `${dashboardData.completedSwapsThisMonth} completed this month`,
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Active Connections',
      value: dashboardData.activeConnections,
      icon: Users,
      description: `${dashboardData.newConnectionsThisWeek} new this week`,
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Average Rating',
      value: Number(dashboardData.averageRating).toFixed(1),
      icon: Star,
      description: `From ${dashboardData.totalReviews} reviews`,
      trend: { value: 5, isPositive: true }
    },
    {
      title: 'Skills Progress',
      value: `${dashboardData.skillsProgress}%`,
      icon: TrendingUp,
      description: `${dashboardData.improvedSkills} skills improved`,
      trend: { value: 15, isPositive: true }
    },
  ]

  return (
    <div className="space-y-8 p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Swaps</CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View all
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.upcomingSwaps.map((swap, index) => (
              <UpcomingSwap key={index} {...swap} delay={index * 0.1} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Skills Progress</CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View all
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.skillProgress.map((skill, index) => (
              <SkillProgress key={skill.skill} {...skill} delay={index * 0.1} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard 