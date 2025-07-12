import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  MoreVertical,
  Star,
  Trash2,
  Users,
  X,
  MessageSquare,
  Repeat2,
  Settings,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  NotificationResponse,
  type NotificationStats as NotificationStatsType,
} from '@/services/api';

interface NotificationCardProps {
  notification: NotificationResponse;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const NotificationIcon = ({ type }: { type: NotificationResponse['type'] }) => {
  const icons = {
    SWAP: Repeat2,
    MESSAGE: MessageSquare,
    SYSTEM: AlertCircle,
    REVIEW: Star,
  };
  const Icon = icons[type];
  return <Icon className="h-5 w-5" />;
};

const PriorityBadge = ({ priority }: { priority: NotificationResponse['priority'] }) => {
  const colors = {
    HIGH: 'bg-red-500/10 text-red-500',
    MEDIUM: 'bg-yellow-500/10 text-yellow-500',
    LOW: 'bg-green-500/10 text-green-500',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colors[priority]}`}>
      {priority.toLowerCase()}
    </span>
  );
};

const NotificationCard = ({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsRead = async () => {
    try {
      setIsLoading(true);
      await onMarkAsRead(notification.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await onDelete(notification.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className={cn(
        "p-4 transition-all hover:shadow-md",
        !notification.isRead && "bg-primary/5 dark:bg-primary/10",
        isLoading && "opacity-50"
      )}>
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-2 rounded-full",
            notification.isRead ? "bg-muted" : "bg-primary/10"
          )}>
            <NotificationIcon type={notification.type} />
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium leading-none">
                  {notification.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.description}
                </p>
              </div>
              <PriorityBadge priority={notification.priority} />
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{new Date(notification.timestamp).toLocaleString(undefined, { 
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>

            {notification.metadata && (
              <div className="flex flex-wrap gap-2 mt-2">
                {notification.metadata.userName && (
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {notification.metadata.userName}
                  </Badge>
                )}
                {notification.metadata.skillName && (
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    {notification.metadata.skillName}
                  </Badge>
                )}
                {notification.metadata.rating && (
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1" fill="currentColor" />
                    {notification.metadata.rating}/5
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 pt-3 border-t flex items-center justify-end gap-2"
        >
          {!notification.isRead && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMarkAsRead}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-1" />
              )}
              Mark as read
            </Button>
          )}
          {notification.actionUrl && (
            <Button size="sm" asChild>
              <Link to={notification.actionUrl}>
                View
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );
};

const NotificationStats = ({ stats }: { stats: NotificationStatsType }) => {
  const statItems = [
    {
      label: 'Unread',
      value: stats.unread.toString(),
      icon: Bell,
      color: 'text-primary',
    },
    {
      label: 'This Week',
      value: stats.weekly.toString(),
      icon: Calendar,
      color: 'text-blue-500',
    },
    {
      label: 'Total',
      value: stats.total.toString(),
      icon: CheckCircle2,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-background rounded-lg">
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

const NotificationsPage = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [stats, setStats] = useState<NotificationStatsType>({ unread: 0, weekly: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await getNotifications(filter, page);
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
        setStats(response.data.stats);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter, page]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await markNotificationAsRead(id);
      if (response.success) {
        await fetchNotifications();
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteNotification(id);
      if (response.success) {
        await fetchNotifications();
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllNotificationsAsRead();
      if (response.success) {
        await fetchNotifications();
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await deleteAllNotifications();
      if (response.success) {
        await fetchNotifications();
        toast.success('All notifications cleared');
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      toast.error('Failed to clear all notifications');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your skill swap activities
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
          <Button variant="outline" onClick={handleClearAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear all
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <NotificationStats stats={stats} />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            {['all', 'unread', 'read'].map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => {
                  setFilter(f as typeof filter);
                  setPage(1);
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <motion.div layout className="space-y-4">
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
          ) : notifications.length > 0 ? (
            <>
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
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
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No notifications</h3>
              <p className="text-muted-foreground">
                You're all caught up! Check back later for updates.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default NotificationsPage; 