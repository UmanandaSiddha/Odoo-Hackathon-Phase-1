import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/ui/sidebar'
import { motion } from 'framer-motion'
import { useState } from 'react'

export const DashboardLayout = () => {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

	return (
		<div className="min-h-screen bg-background">
			<Sidebar isCollapsed={isSidebarCollapsed} onCollapsedChange={setIsSidebarCollapsed} />
			<motion.main
				initial={{ opacity: 0, y: 20 }}
				animate={{
					opacity: 1,
					y: 0,
					paddingLeft: isSidebarCollapsed ? '90px' : '280px'
				}}
				transition={{
					duration: 0.3,
					ease: 'easeInOut'
				}}
				className="p-6 md:p-10"
			>
				<Outlet />
			</motion.main>
		</div>
	)
} 