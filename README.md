# KTECH Hotel Management System

A modern, full-featured hotel management application built with Next.js and Go.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38B2AC?logo=tailwind-css)
![Go](https://img.shields.io/badge/Go-Backend-00ADD8?logo=go)

## Features

### 🏨 Room Management
- View all rooms with real-time availability status
- Create, edit, and manage room inventory
- Room type categorization (Standard, Deluxe, Suite)
- Floor-based organization

### 📅 Booking System
- Create new reservations with guest selection
- Real-time room availability checking
- Booking status tracking (Pending, Confirmed, Checked-in, Checked-out, Cancelled)
- QR code generation for bookings

### 👤 Guest Management
- Comprehensive guest profiles with history
- Guest preferences tracking (room floors, meal types, special requests)
- AI-powered guest insights and recommendations
- ID verification and document upload

### ✅ Check-in / Check-out
- Streamlined check-in process with ID verification
- AI-assisted guest verification
- Payment and deposit tracking
- Express checkout functionality

### 🍽️ Room Service
- In-room ordering system
- Order tracking and status updates
- Menu management

### 🧹 Housekeeping
- Service request management
- Task assignment and tracking
- Priority-based scheduling

### 👥 Staff Management
- Staff profiles and role management
- Shift scheduling
- Performance tracking

### 🔔 Real-time Notifications
- Server-Sent Events (SSE) for instant updates
- Push notifications for new bookings, check-ins, service requests
- Notification history with persistence
- Sound alerts for high-priority events

### 📊 Dashboard
- Real-time statistics and KPIs
- Booking trends and analytics
- Revenue tracking
- Recent activity feed with live updates

### 🌐 Internationalization
- Multi-language support (English, French, Spanish, German, Chinese)
- Locale-aware date and currency formatting

### 🎨 Theming
- Light and dark mode support
- Customizable color schemes

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with SSR/SSG |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **TailwindCSS 4** | Utility-first styling |
| **TanStack Query** | Server state management |
| **Redux Toolkit** | Client state management |
| **Framer Motion** | Animations |
| **Lucide React** | Icons |
| **React Hot Toast** | Toast notifications |
| **ApexCharts** | Data visualization |
| **i18next** | Internationalization |

### Backend
| Technology | Purpose |
|------------|---------|
| **Go** | Backend language |
| **Gin** | HTTP framework |
| **GORM** | ORM |
| **PostgreSQL** | Database |
| **JWT** | Authentication |
| **SSE** | Real-time notifications |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Go 1.21+ (for backend)
- PostgreSQL (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hotel-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Backend Setup

The backend is a separate Go application. See the `backend/` directory for setup instructions.

## Project Structure

```
hotel-react/
├── components/          # Reusable UI components
│   ├── notifications/   # Notification system components
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── ...
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   ├── NotificationContext.tsx  # SSE notifications
│   └── ThemeContext.tsx # Theme management
├── hooks/               # Custom React hooks
│   ├── useReservations.ts
│   ├── useGuests.ts
│   ├── useRooms.ts
│   └── ...
├── lib/                 # Utilities and configurations
│   ├── api.ts           # API client
│   ├── axios.ts         # Axios instance
│   └── queryClient.ts   # TanStack Query client
├── pages/               # Next.js pages
│   ├── dashboard.tsx    # Main dashboard
│   ├── bookings/        # Booking management
│   ├── rooms.tsx        # Room management
│   ├── checkin.tsx      # Check-in/out
│   ├── guesthistory.tsx # Guest profiles
│   └── ...
├── store/               # Redux store
├── styles/              # Global styles
├── types/               # TypeScript types
└── locales/             # i18n translations
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |

## API Endpoints

The frontend connects to the following main API endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/reservations` | List reservations |
| `POST /api/v1/reservations` | Create reservation |
| `GET /api/v1/guests` | List guests |
| `GET /api/v1/rooms` | List rooms |
| `GET /api/v1/reservations/dashboard` | Dashboard stats |
| `GET /api/v1/reservations/recent-activity` | Recent bookings & preferences |
| `GET /notifications/stream` | SSE notification stream |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software developed for KTECH.

---

Built with ❤️ by the KTECH Team
