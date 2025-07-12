import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Users, Repeat2, CheckCircle, Clock } from 'lucide-react';
import { api } from '@/services/api';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSwaps: number;
  completedSwaps: number;
  pendingSwaps: number;
  totalHours: number;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description: string;
}

const StatCard = ({ title, value, icon: Icon, description }: StatCardProps) => (
  <Card className="p-6">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-primary/10 rounded-lg">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  </Card>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSwaps: 0,
    completedSwaps: 0,
    pendingSwaps: 0,
    totalHours: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/admin/dashboard/stats');
        setStats(response.data.stats);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard stats',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Monitor platform activity and performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description={`${stats.activeUsers} active users`}
        />
        <StatCard
          title="Total Swaps"
          value={stats.totalSwaps}
          icon={Repeat2}
          description={`${stats.completedSwaps} completed swaps`}
        />
        <StatCard
          title="Success Rate"
          value={`${Math.round((stats.completedSwaps / stats.totalSwaps) * 100)}%`}
          icon={CheckCircle}
          description={`${stats.pendingSwaps} pending swaps`}
        />
        <StatCard
          title="Total Hours"
          value={stats.totalHours}
          icon={Clock}
          description="Hours of skills exchanged"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {/* Add recent activity list here */}
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Popular Skills</h2>
          {/* Add popular skills list here */}
        </Card>
      </div>
    </div>
  );
}