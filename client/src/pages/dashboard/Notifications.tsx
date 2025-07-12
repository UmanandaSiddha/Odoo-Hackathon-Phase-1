import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Bell,
  MessageSquare,
  Star,
  Calendar,
  CheckCircle2,
  XCircle,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NotificationType = 'swap_request' | 'message' | 'review' | 'reminder' | 'system'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  from?: {
    name: string
    avatar: string
  }
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  const icons = {
    swap_request: Calendar,
    message: MessageSquare,
    review: Star,
    reminder: Bell,
    system: CheckCircle2
  }

  const Icon = icons[type]

  return (
    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
      <Icon className="h-5 w-5 text-primary" />
    </div>
  )
}

const NotificationCard = ({
  notification,
  onMarkAsRead
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <Card
      className={cn(
        'p-4 transition-colors hover:bg-accent/50',
        !notification.read && 'border-l-4 border-l-primary'
      )}
    >
      <div className="flex items-start gap-4">
        <NotificationIcon type={notification.type} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium">{notification.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-muted-foreground">
              {notification.timestamp}
            </span>
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto text-xs px-2 py-1"
                onClick={() => onMarkAsRead(notification.id)}
              >
                Mark as read
              </Button>
            )}
            {notification.actionUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto text-xs px-2 py-1"
                asChild
              >
                <a href={notification.actionUrl}>View details</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
)

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'swap_request',
      title: 'New Swap Request',
      message: 'Sarah Chen wants to learn React Advanced Patterns in exchange for UI/UX Design lessons.',
      timestamp: '2 minutes ago',
      read: false,
      actionUrl: '/swaps/1',
      from: {
        name: 'Sarah Chen',
        avatar: ''
      }
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'Mike Johnson sent you a message about the upcoming Node.js session.',
      timestamp: '1 hour ago',
      read: false,
      actionUrl: '/messages/2',
      from: {
        name: 'Mike Johnson',
        avatar: ''
      }
    },
    {
      id: '3',
      type: 'review',
      title: 'New Review',
      message: 'Alex Kumar left you a 5-star review for the React basics session.',
      timestamp: 'Yesterday',
      read: true,
      actionUrl: '/reviews/3',
      from: {
        name: 'Alex Kumar',
        avatar: ''
      }
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Upcoming Session',
      message: 'Your UI/UX Design session with Mike Johnson starts in 1 hour.',
      timestamp: 'Yesterday',
      read: true,
      actionUrl: '/calendar'
    },
    {
      id: '5',
      type: 'system',
      title: 'Profile Completion',
      message: 'Complete your profile to get better skill swap matches.',
      timestamp: '2 days ago',
      read: true,
      actionUrl: '/profile'
    }
  ])

  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => !n.read)

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
          size="sm"
        >
          Unread
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
          {filteredNotifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Notifications 