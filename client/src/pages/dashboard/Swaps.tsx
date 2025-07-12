import { useState, useEffect } from 'react'
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
  RotateCcw,
  Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  getSwapStats,
  getSwaps,
  acceptSwapRequest,
  completeSwap,
  deleteSwapRequest,
  SwapResponse,
  type SwapStats as SwapStatsType
} from '@/services/api'

const SwapCard = ({ swap, onAccept, onComplete, onDelete }: { 
  swap: SwapResponse;
  onAccept: (id: string) => Promise<void>;
  onComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAction = async (action: 'accept' | 'complete' | 'delete') => {
    try {
      setIsLoading(true);
      switch (action) {
        case 'accept':
          await onAccept(swap.id);
          toast.success('Swap request accepted');
          break;
        case 'complete':
          await onComplete(swap.id);
          toast.success('Swap marked as completed');
          break;
        case 'delete':
          await onDelete(swap.id);
          toast.success('Swap request deleted');
          break;
      }
    } catch (error) {
      console.error(`Error ${action}ing swap:`, error);
      toast.error(`Failed to ${action} swap`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className={`overflow-hidden transition-all hover:shadow-lg ${isLoading ? 'opacity-50' : ''}`}>
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
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {swap.status === 'pending' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleAction('delete')}>
                      <XCircle className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                    <Button size="sm" onClick={() => handleAction('accept')}>
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
                    <Button size="sm" onClick={() => handleAction('complete')}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                    <Button size="sm" asChild>
                      <Link to={`/chat/${swap.id}`}>
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Message
                      </Link>
                    </Button>
                  </>
                )}
                {swap.status === 'completed' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/reviews/new/${swap.id}`}>
                      <Star className="w-4 h-4 mr-1" />
                      Leave Review
                    </Link>
                  </Button>
                )}
              </>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const SwapStats = ({ stats }: { stats: SwapStatsType }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { label: 'Pending Swaps', value: stats.pending, icon: Clock4, color: 'text-yellow-500' },
      { label: 'Active Swaps', value: stats.active, icon: CalendarClock, color: 'text-blue-500' },
      { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-500' },
      { label: 'Hours Exchanged', value: `${stats.hoursExchanged}h`, icon: Hourglass, color: 'text-primary' }
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
  const [swaps, setSwaps] = useState<SwapResponse[]>([])
  const [stats, setStats] = useState<SwapStatsType>({ pending: 0, active: 0, completed: 0, hoursExchanged: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchSwaps = async () => {
    try {
      setIsLoading(true);
      const response = await getSwaps(filter, searchQuery, page);
      if (response.success && response.data) {
        setSwaps(response.data.swaps);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching swaps:', error);
      toast.error('Failed to fetch swaps');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getSwapStats();
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchSwaps();
  }, [filter, searchQuery, page]);

  const handleAccept = async (id: string) => {
    await acceptSwapRequest(id);
    await fetchSwaps();
    await fetchStats();
  };

  const handleComplete = async (id: string) => {
    await completeSwap(id);
    await fetchSwaps();
    await fetchStats();
  };

  const handleDelete = async (id: string) => {
    await deleteSwapRequest(id);
    await fetchSwaps();
    await fetchStats();
  };

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

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
      <SwapStats stats={stats} />

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
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
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
                  onClick={() => {
                    setFilter(option.value as typeof filter);
                    setPage(1);
                  }}
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
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </motion.div>
          ) : swaps.length > 0 ? (
            <>
              {swaps.map(swap => (
                <SwapCard
                  key={swap.id}
                  swap={swap}
                  onAccept={handleAccept}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              ))}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
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