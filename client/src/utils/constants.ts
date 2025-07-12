export const APP_NAME = 'Skill Swap';

export const ROUTES = {
	HOME: '/',
	LOGIN: '/login',
	REGISTER: '/register',
	DASHBOARD: '/dashboard',
	PROFILE: '/profile',
	EDIT_PROFILE: '/edit-profile',
	SWAPS: '/swaps',
	NOTIFICATIONS: '/notifications',
} as const;

export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: '/auth/login',
		REGISTER: '/auth/register',
		LOGOUT: '/auth/logout',
	},
	USERS: {
		PROFILE: '/users/profile',
		UPDATE: '/users/update',
	},
	SWAPS: {
		LIST: '/swaps',
		CREATE: '/swaps/create',
		UPDATE: '/swaps/update',
	},
} as const; 