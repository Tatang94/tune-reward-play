# MusicReward App - Replit Migration

## Project Overview
A music streaming reward application that allows users to listen to music and earn rewards. Users can discover trending songs, play music, and accumulate earnings that can be withdrawn through an admin dashboard.

## Recent Changes
- **July 21, 2025**: Admin Authentication System with Supabase
  - Sistem login admin dengan database PostgreSQL (Supabase)
  - Kredensial admin: username "admin", password "audio"
  - Autentikasi aman dengan bcrypt dan session tokens
  - Protected admin routes dengan middleware authentication
  - Admin dashboard dengan fungsi logout dan navigasi
  - Database tables: admins, admin_sessions, users, withdraw_requests
- **July 21, 2025**: Enhanced Balance Display and YouTube Music Integration
  - Improved balance display styling with larger text and gradient background
  - Integrated real YouTube Music API using ytmusicapi Python library
  - Created Python service for YouTube Music data fetching
  - Added Express API routes for search, charts, and song details
  - Removed admin button from main header per user request
- **July 20, 2025**: Migrated from Lovable to Replit environment
  - Converted routing from react-router-dom to wouter
  - Set up proper QueryClient configuration
  - Fixed styling to use Tailwind CSS variables for theme consistency
  - Configured proper client/server separation with Express backend
- **July 20, 2025**: Moved admin access from landing page
  - Removed admin button from main header per user request
  - Added proper admin header with navigation back to home
  - Admin panel accessible only via direct URL /admin

## Project Architecture
- **Frontend**: React with TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js server serving both API and frontend
- **Routing**: wouter for client-side routing
- **State Management**: TanStack Query for server state, localStorage for user data
- **Storage**: In-memory storage for backend, localStorage for frontend user data

## Key Features
- Music discovery and trending songs
- Music player with earnings system (50 Rp per 30 seconds)
- User dashboard with balance tracking
- Admin dashboard for withdrawal request management
- Mock YouTube Music API integration

## User Preferences
- Indonesian language interface (Bahasa Indonesia) - untuk semua komunikasi dan interface
- Reward-based music streaming concept
- Simple, clean UI with card-based layouts
- Admin panel dengan kredensial: admin/audio
- Database menggunakan Supabase

## Technical Notes
- Uses real YouTube Music API via ytmusicapi Python library
- Python backend service provides authentic music data
- Express API routes proxy requests to Python ytmusicapi service
- Earnings system awards 50 Rp after 30 seconds of listening
- Admin panel accessible only via direct URL /admin
- Enhanced balance display with gradient styling
- Responsive design with Tailwind CSS
- TypeScript throughout for type safety