import { useEffect } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Users,
  LayoutDashboard,
  MessageSquare,
  Repeat2,
  LogOut,
  Wrench,
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: Repeat2, label: 'Swaps', path: '/admin/swaps' },
    { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
    { icon: Wrench, label: 'Skills', path: '/admin/skills' },
  ];

  return (
    <div className="min-h-screen flex bg-muted/50">
      {/* Sidebar */}
      <div className="w-64 bg-background border-r">
        <div className="p-6">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-2 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
} 