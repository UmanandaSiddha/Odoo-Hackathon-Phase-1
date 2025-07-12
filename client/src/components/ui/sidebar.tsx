import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { ThemeToggle } from './theme-toggle'
import {
  LayoutDashboard,
  Users,
  Repeat2,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'

interface NavItemProps {
  to: string
  icon: React.ElementType
  label: string
  isCollapsed: boolean
}

const NavItem = ({ to, icon: Icon, label, isCollapsed }: NavItemProps) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors relative group',
        isActive 
          ? 'text-primary-foreground' 
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeNavBackground"
          className="absolute inset-0 bg-primary rounded-lg -z-10"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      )}
      <Icon className="h-5 w-5" />
      {!isCollapsed && (
        <span className="text-sm font-medium">{label}</span>
      )}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </Link>
  )
}

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { logout } = useAuth()

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/profile', icon: Users, label: 'Profile' },
    { to: '/swaps', icon: Repeat2, label: 'Swaps' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/settings', icon: Settings, label: 'Settings' }
  ]

  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '70px' }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <motion.aside
        initial="expanded"
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40 hidden md:flex flex-col gap-4 p-4 border-r border-border bg-background/50 backdrop-blur-sm',
          isCollapsed ? 'items-center' : 'items-stretch'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-2 h-12',
          isCollapsed ? 'justify-center' : 'px-2'
        )}>
          <img src="/logo.svg" alt="Skill Swap" className="h-6 w-6" />
          {!isCollapsed && (
            <span className="font-bold text-lg">Skill Swap</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              {...item}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'w-full flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10',
              isCollapsed ? 'justify-center' : 'justify-start'
            )}
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </motion.aside>
    </>
  )
} 