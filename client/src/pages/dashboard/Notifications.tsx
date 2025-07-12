import { useState } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'swap' | 'message' | 'system' | 'review';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
  metadata?: {
    userName?: string;
    skillName?: string;
    rating?: number;
  };
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'swap',
    title: 'New Swap Request',
    description: 'Sarah Chen wants to learn React from you',
    timestamp: '5 minutes ago',
    read: false,
    actionUrl: '/swaps',
    priority: 'high',
    metadata: {
      userName: 'Sarah Chen',
      skillName: 'React',
    },
  },
  {
    id: '2',
    type: 'review',
    title: 'New Review Received',
    description: 'Mike Johnson gave you a 5-star rating',
    timestamp: '1 hour ago',
    read: false,
    actionUrl: '/profile',
    priority: 'medium',
    metadata: {
      userName: 'Mike Johnson',
      rating: 5,
    },
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    description: 'Alex Kumar sent you a message about the Node.js session',
    timestamp: '2 hours ago',
    read: true,
    actionUrl: '/chat',
    priority: 'high',
    metadata: {
      userName: 'Alex Kumar',
    },
  },
  {
    id: '4',
    type: 'system',
    title: 'Profile Verification',
    description: 'Your profile has been successfully verified',
    timestamp: 'Yesterday',
    read: true,
    priority: 'low',
  },
];

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  const icons = {
    swap: Repeat2,
    message: MessageSquare,
    system: AlertCircle,
    review: Star,
  };
  const Icon = icons[type];
  return <Icon className="h-5 w-5" />;
};

const PriorityBadge = ({ priority }: { priority: Notification['priority'] }) => {
  const colors = {
    high: 'bg-red-500/10 text-red-500',
    medium: 'bg-yellow-500/10 text-yellow-500',
    low: 'bg-green-500/10 text-green-500',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const NotificationCard = ({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
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
        !notification.read && "bg-primary/5 dark:bg-primary/10"
      )}>
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-2 rounded-full",
            notification.read ? "bg-muted" : "bg-primary/10"
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
              <span>{notification.timestamp}</span>
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
          {!notification.read && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
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
            onClick={() => onDelete(notification.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );
};

const NotificationStats = () => {
  const stats = [
    {
      label: 'Unread',
      value: '3',
      icon: Bell,
      color: 'text-primary',
    },
    {
      label: 'This Week',
      value: '12',
      icon: Calendar,
      color: 'text-blue-500',
    },
    {
      label: 'Total',
      value: '148',
      icon: CheckCircle2,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
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
  const [notificationList, setNotificationList] = useState(notifications);

  const handleMarkAsRead = (id: string) => {
    setNotificationList(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDelete = (id: string) => {
    setNotificationList(prev =>
      prev.filter(notif => notif.id !== id)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotificationList(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleClearAll = () => {
    setNotificationList([]);
  };

  const filteredNotifications = notificationList.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

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
      <NotificationStats />

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
                onClick={() => setFilter(f as typeof filter)}
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
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
          {filteredNotifications.length === 0 && (
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