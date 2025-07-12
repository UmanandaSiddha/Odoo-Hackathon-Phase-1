# 🌐 Frontend — Skill Swap Platform (Hackathon '25)

This is the **frontend implementation** of the **Skill Swap Platform**, a real-time application designed for the Odoo Hackathon '25. Built using modern, responsive, and type-safe technologies.

---

## 🔧 Tech Stack

| Tool           | Purpose                                        |
|----------------|------------------------------------------------|
| React (w/ Vite) | Core frontend library                          |
| TypeScript     | Type safety and better tooling                  |
| TailwindCSS    | Utility-first responsive styling                |
| ShadCN UI      | Prebuilt accessible component library           |
| React Router   | Client-side routing                             |
| Axios          | API communication                              |
| React Query    | API state and cache management                  |
| JWT            | Token-based auth (via HTTP headers)             |
| Redux Toolkit  | Global state (optional for auth or sockets)     |
| Socket.IO-Client | Real-time messaging                            |
| Form Libraries | e.g. React Hook Form + Zod for validation       |
| Cloudinary / S3| File/image upload (if needed)                   |

---

## 📁 Folder Structure

```
/frontend
├── src/
│   ├── assets/            # Static files
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature folders (Auth, Users, Swaps, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── layouts/           # Common layouts (Dashboard, Auth, etc.)
│   ├── pages/             # Page-level components (routed)
│   ├── routes/            # Route definitions
│   ├── services/          # API & socket service handlers
│   ├── store/             # Redux slices (optional)
│   ├── utils/             # Constants, helpers
│   ├── App.tsx            # Main App component
│   └── main.tsx           # App entry point
├── public/
├── index.html
└── tailwind.config.js
```

---

## 🎨 Design & Responsiveness

- TailwindCSS ensures fully responsive UI for mobile and tablets
- Uses media queries and Flexbox/Grid layouts
- Consistent design tokens (font sizes, spacing, colors)
- All colors accessible (contrast-checked)
- ShadCN components ensure accessibility (keyboard & ARIA)

---

## 🔐 JWT Authentication Flow

- User logs in via `/login` or `/register`
- Token is stored in `localStorage` or `HttpOnly Cookie`
- Axios interceptors attach token to `Authorization` header
- Protected routes check auth and redirect if unauthorized

---

## 📡 WebSocket Integration (Socket.IO)

- Establishes socket connection on app load with JWT
- Listens to real-time events:
  - `message`: for chats
  - `swap-update`: for live swap request updates
  - `notify`: for notifications

```ts
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  auth: {
    token: localStorage.getItem("token"),
  },
});
```

---

## 📤 File Uploads

- Use input type="file" with preview
- Upload via Axios `multipart/form-data`
- Shows progress bar and preview thumbnails
- Uploads to backend, then image path saved to DB

---

## 📬 Notifications UI

- Notification icon (bell) in navbar
- Real-time badge count from WebSocket events
- Dropdown of recent notifications
- Read/unread toggle

---

## 🔁 Pages & Routes

### Public Routes
- `/` — Landing Page
- `/login` — Login Form
- `/register` — Registration Form
- `/profile/:id` — Public profile view

### Protected Routes
- `/dashboard` — User dashboard with skills & availability
- `/swaps` — Sent & received swap requests
- `/notifications` — User's notifications
- `/edit-profile` — Edit own profile
- `/rate/:id` — Rate a user

---

## 🔍 Features Summary

### ✅ User Profile
- Edit name, location, photo, availability
- Toggle public/private
- View skills offered and wanted

### ✅ Skill Management
- Add/remove offered or wanted skills
- Tag-based input

### ✅ Swap Requests
- Search users by skill
- Send swap requests
- View pending, accepted, rejected requests
- Delete pending requests

### ✅ Feedback & Ratings
- Rate users after swap
- View rating summary on public profile

### ✅ Real-Time Chat (Future Scope)
- Initiate chat after swap is accepted

---

## 🧪 Form Handling

- Built using **React Hook Form** + **Zod** for validation
- Errors shown inline with accessible labels
- All forms have reset and loading states

---

## 🪄 Enhancements

- Dark Mode Support (Tailwind’s dark variant)
- Skeleton Loaders (for data fetching states)
- Pagination on large lists (e.g., user search, swaps)
- Toast notifications (e.g., swap accepted, rating added)

---

## 🔍 Search & Filters

- Search users by skill name
- Filter by availability (weekends, weekdays, etc.)
- Tag-based dynamic suggestions

---

## 📦 State Management

- `React Query`: Data fetching, cache, invalidation
- `Redux Toolkit` (Optional): Auth, Socket, Notification count

---

## ✅ Dev Setup

```bash
npm install

# Run on localhost:3000
npm run dev
```

> Ensure `.env` contains:
```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Production Build

```bash
npm run build
npm run preview
```

---

> Built with 💛 using React + TypeScript + TailwindCSS + ShadCN UI  
> Designed for Hackathon '25 — Fully Responsive & Realtime.