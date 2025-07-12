import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock4,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SwapStatus = 'pending' | 'accepted' | 'rejected' | 'completed'

interface SwapRequest {
  id: string
  title: string
  with: {
    name: string
    avatar: string
  }
  date: string
  time: string
  status: SwapStatus
  skillToLearn: string
  skillToTeach: string
}

const StatusBadge = ({ status }: { status: SwapStatus }) => {
  const variants = {
    pending: {
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      icon: Clock4,
      label: 'Pending'
    },
    accepted: {
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      icon: CheckCircle2,
      label: 'Accepted'
    },
    rejected: {
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      icon: XCircle,
      label: 'Rejected'
    },
    completed: {
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      icon: CheckCircle2,
      label: 'Completed'
    }
  }

  const { color, bg, icon: Icon, label } = variants[status]

  return (
    <div className={cn('flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', color, bg)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  )
}

const SwapCard = ({ swap }: { swap: SwapRequest }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {swap.with.avatar ? (
                <img
                  src={swap.with.avatar}
                  alt={swap.with.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-medium text-primary">
                  {swap.with.name[0]}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-medium">{swap.title}</h3>
              <p className="text-sm text-muted-foreground">with {swap.with.name}</p>
            </div>
          </div>
          <StatusBadge status={swap.status} />
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{swap.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{swap.time}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary">Learn: {swap.skillToLearn}</Badge>
            <Badge variant="secondary">Teach: {swap.skillToTeach}</Badge>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          {swap.status === 'pending' && (
            <>
              <Button size="sm" className="flex-1">Accept</Button>
              <Button size="sm" variant="outline" className="flex-1">Decline</Button>
            </>
          )}
          {swap.status === 'accepted' && (
            <Button size="sm" className="flex-1">
              <MessageCircle className="mr-2 h-4 w-4" />
              Start Chat
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

const Swaps = () => {
  const [filter, setFilter] = useState<SwapStatus | 'all'>('all')
  const [swaps] = useState<SwapRequest[]>([
    {
      id: '1',
      title: 'React Advanced Patterns',
      with: {
        name: 'Sarah Chen',
        avatar: ''
      },
      date: 'Today',
      time: '2:00 PM',
      status: 'pending',
      skillToLearn: 'React',
      skillToTeach: 'UI/UX Design'
    },
    {
      id: '2',
      title: 'UI/UX Design Basics',
      with: {
        name: 'Mike Johnson',
        avatar: ''
      },
      date: 'Tomorrow',
      time: '10:00 AM',
      status: 'accepted',
      skillToLearn: 'UI/UX Design',
      skillToTeach: 'Node.js'
    },
    {
      id: '3',
      title: 'Node.js Performance',
      with: {
        name: 'Alex Kumar',
        avatar: ''
      },
      date: 'Thu, Mar 21',
      time: '3:30 PM',
      status: 'completed',
      skillToLearn: 'Node.js',
      skillToTeach: 'React'
    }
  ])

  const filteredSwaps = filter === 'all'
    ? swaps
    : swaps.filter(swap => swap.status === filter)

  const filterOptions: { value: SwapStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Skill Swaps</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Swap
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Swaps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'default' : 'outline'}
                onClick={() => setFilter(option.value)}
                size="sm"
              >
                {option.label}
              </Button>
            ))}
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