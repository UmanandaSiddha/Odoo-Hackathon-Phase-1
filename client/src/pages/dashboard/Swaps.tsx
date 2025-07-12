import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import {
  Plus,
  Calendar,
  Clock,
  Users,
  Star,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock4,
  ArrowRight,
  Filter,
  Search,
  CalendarClock,
  Hourglass,
  CheckCircle2,
  RotateCcw
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SwapData {
  id: string
  title: string
  with: {
    name: string
    avatar: string
    rating: number
  }
  skillToTeach: {
    name: string
    level: string
  }
  skillToLearn: {
    name: string
    level: string
  }
  status: 'pending' | 'accepted' | 'completed' | 'cancelled'
  date: string
  duration: string
  messages: number
  lastActive: string
}

const SwapCard = ({ swap }: { swap: SwapData }) => {
  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-500',
    accepted: 'bg-blue-500/10 text-blue-500',
    completed: 'bg-green-500/10 text-green-500',
    cancelled: 'bg-red-500/10 text-red-500'
  }

  const statusIcons = {
    pending: Clock4,
    accepted: CheckCircle2,
    completed: CheckCircle,
    cancelled: XCircle
  }

  const StatusIcon = statusIcons[swap.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            {/* Left Section */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {swap.with.avatar ? (
                    <img
                      src={swap.with.avatar}
                      alt={swap.with.name}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <Users className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {swap.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">with {swap.with.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{swap.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{swap.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{swap.with.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="group-hover:border-primary/50">
                  Teaching: {swap.skillToTeach.name}
                  <span className="ml-1 text-xs text-muted-foreground">
                    • {swap.skillToTeach.level}
                  </span>
                </Badge>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <Badge variant="outline" className="group-hover:border-primary/50">
                  Learning: {swap.skillToLearn.name}
                  <span className="ml-1 text-xs text-muted-foreground">
                    • {swap.skillToLearn.level}
                  </span>
                </Badge>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex flex-col items-end gap-3">
              <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${statusColors[swap.status]}`}>
                <StatusIcon className="w-3 h-3" />
                <span className="capitalize">{swap.status}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>{swap.messages} messages</span>
              </div>

              <p className="text-xs text-muted-foreground">
                Last active {swap.lastActive}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t flex items-center justify-end gap-2"
          >
            {swap.status === 'pending' && (
              <>
                <Button variant="outline" size="sm">
                  <XCircle className="w-4 h-4 mr-1" />
                  Decline
                </Button>
                <Button size="sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Accept
                </Button>
              </>
            )}
            {swap.status === 'accepted' && (
              <>
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reschedule
                </Button>
                <Button size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </>
            )}
            {swap.status === 'completed' && (
              <Button variant="outline" size="sm">
                <Star className="w-4 h-4 mr-1" />
                Leave Review
              </Button>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const SwapStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { label: 'Pending Swaps', value: 3, icon: Clock4, color: 'text-yellow-500' },
      { label: 'Active Swaps', value: 2, icon: CalendarClock, color: 'text-blue-500' },
      { label: 'Completed', value: 12, icon: CheckCircle2, color: 'text-green-500' },
      { label: 'Hours Exchanged', value: '24h', icon: Hourglass, color: 'text-primary' }
    ].map((stat, index) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -5 }}
      >
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-background rounded-lg">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ))}
  </div>
)

const Swaps = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const swaps: SwapData[] = [
    {
      id: '1',
      title: 'React Advanced Patterns',
      with: {
        name: 'Sarah Chen',
        avatar: '',
        rating: 4.8
      },
      skillToTeach: {
        name: 'React',
        level: 'Expert'
      },
      skillToLearn: {
        name: 'UI/UX',
        level: 'Intermediate'
      },
      status: 'pending',
      date: 'Today, 2:00 PM',
      duration: '1 hour',
      messages: 5,
      lastActive: '5 mins ago'
    },
    {
      id: '2',
      title: 'Node.js Performance Optimization',
      with: {
        name: 'Mike Johnson',
        avatar: '',
        rating: 4.9
      },
      skillToTeach: {
        name: 'Node.js',
        level: 'Advanced'
      },
      skillToLearn: {
        name: 'React',
        level: 'Beginner'
      },
      status: 'accepted',
      date: 'Tomorrow, 3:00 PM',
      duration: '1.5 hours',
      messages: 12,
      lastActive: '1 hour ago'
    },
    {
      id: '3',
      title: 'TypeScript Best Practices',
      with: {
        name: 'Alex Kumar',
        avatar: '',
        rating: 4.7
      },
      skillToTeach: {
        name: 'TypeScript',
        level: 'Expert'
      },
      skillToLearn: {
        name: 'GraphQL',
        level: 'Intermediate'
      },
      status: 'completed',
      date: 'Yesterday',
      duration: '1 hour',
      messages: 8,
      lastActive: '2 days ago'
    }
  ]

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ]

  const filteredSwaps = swaps
    .filter(swap => filter === 'all' || swap.status === filter)
    .filter(swap =>
      searchQuery
        ? swap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          swap.with.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          swap.skillToTeach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          swap.skillToLearn.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold tracking-tight">Skill Swaps</h1>
          <p className="text-muted-foreground">
            Manage your skill exchange sessions
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button asChild>
            <Link to="/swaps/new">
              <Plus className="mr-2 h-4 w-4" />
              New Swap
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <SwapStats />

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search swaps..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {filterOptions.map(option => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? 'default' : 'outline'}
                  onClick={() => setFilter(option.value as typeof filter)}
                  size="sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swaps List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredSwaps.map(swap => (
            <SwapCard key={swap.id} swap={swap} />
          ))}
          {filteredSwaps.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No swaps found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Swaps 