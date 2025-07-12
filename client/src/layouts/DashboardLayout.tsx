import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/ui/sidebar'
import { motion } from 'framer-motion'

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="md:pl-[240px] p-4 md:p-8"
      >
        <Outlet />
      </motion.main>
    </div>
  )
} 