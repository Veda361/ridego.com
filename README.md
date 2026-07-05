<p align="center">
  <img src="https://img.shields.io/badge/⚡-RiderGo.AI-ff3333?style=for-the-badge&labelColor=070708" alt="RiderGo.AI" />
</p>

<h1 align="center">RiderGo.AI</h1>

<p align="center">
  <strong>AI-Powered Ride-Hailing Platform — Real-Time Dispatch, Live Maps & Smart Matching</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socket.io" />
  <img src="https://img.shields.io/badge/Leaflet-Maps-199900?style=flat-square&logo=leaflet" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-0C2451?style=flat-square&logo=razorpay" />
</p>

---

## 📋 Overview

**RiderGo.AI** is a full-stack ride-hailing web application that connects riders with drivers in real-time. Built with a modern tech stack featuring Next.js 16, Express 5, MongoDB Atlas, Firebase Authentication, Socket.IO for real-time communication, and Leaflet for interactive map experiences.

The platform supports three user roles — **Rider**, **Driver**, and **Admin** — each with dedicated dashboards, real-time tracking, and role-specific functionality.

---

## ✨ Features

### 🚗 Rider Experience
- **Instant Ride Booking** — Set pickup & destination with interactive map selection
- **Live Ride Tracking** — Real-time driver location on Leaflet maps with route visualization
- **Ride History** — View past rides, statuses, and payment details
- **In-Ride Chat** — Real-time messaging with the assigned driver via Socket.IO
- **Payments** — Razorpay-integrated payment processing

### 🏎️ Driver Dashboard
- **Go Online/Offline** — Toggle availability with one click
- **Ride Requests** — Receive and accept nearby ride requests in real-time
- **Live Navigation** — Turn-by-turn route display with Leaflet Routing Machine
- **Earnings & Stats** — Track completed rides, earnings, and performance metrics
- **Ride Lifecycle** — Accept → Start → Complete ride flow

### 🛡️ Admin Panel
- **Analytics Dashboard** — Platform-wide statistics with interactive Recharts visualizations
- **User Management** — View, search, and manage all registered users
- **Driver Management** — Monitor driver registrations, verification status, and activity
- **Ride Monitoring** — Track all rides across the platform with status filters
- **Detailed User Profiles** — Deep-dive into individual user data and ride history

### 🔐 Security
- **Firebase Authentication** — Secure email/password auth with ID token verification
- **Role-Based Access Control** — Middleware-enforced route protection (Rider/Driver/Admin)
- **Helmet.js** — HTTP security headers
- **Rate Limiting** — API abuse prevention (100 requests / 15 minutes)
- **MongoDB Sanitization** — NoSQL injection prevention

---

## 🏗️ Project Structure

```
ridego.com/
├── backend/                    # Express.js API Server
│   ├── server.js               # Entry point — HTTP server + Socket.IO setup
│   ├── src/
│   │   ├── app.js              # Express app configuration & middleware
│   │   ├── config/
│   │   │   ├── db.js           # MongoDB Atlas connection
│   │   │   ├── firebaseAdmin.js# Firebase Admin SDK initialization
│   │   │   └── razorpay.js     # Razorpay client configuration
│   │   ├── controllers/        # Route handlers
│   │   │   ├── userController.js
│   │   │   ├── rideController.js
│   │   │   ├── driverController.js
│   │   │   ├── adminController.js
│   │   │   ├── paymentController.js
│   │   │   └── messageController.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js    # Firebase token verification
│   │   │   ├── driverMiddleware.js  # Driver role guard
│   │   │   └── errorMiddleware.js   # Global error handler
│   │   ├── model/              # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Ride.js
│   │   │   ├── Driver.js
│   │   │   ├── Payment.js
│   │   │   ├── Review.js
│   │   │   ├── Notification.js
│   │   │   └── Message.js
│   │   ├── route/              # Express routers
│   │   ├── sockets/
│   │   │   └── socketHandler.js # Real-time event handling
│   │   └── validators/         # Request validation schemas
│   ├── package.json
│   └── .gitignore
│
├── frontend/                   # Next.js 16 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js             # Landing page (RiderGo.AI homepage)
│   │   │   ├── login/page.js       # Authentication — Login
│   │   │   ├── register/page.js    # Authentication — Register
│   │   │   ├── dashboard/page.js   # Rider dashboard with map & booking
│   │   │   ├── driver/page.js      # Driver dashboard
│   │   │   ├── admin/page.js       # Admin analytics & management
│   │   │   ├── become-driver/page.js # Driver registration form
│   │   │   └── chat/[rideId]/page.jsx # Real-time ride chat
│   │   ├── components/
│   │   │   ├── LiveRideMap.jsx      # Rider-side live tracking map
│   │   │   ├── DriverLiveMap.jsx    # Driver-side navigation map
│   │   │   ├── TiltWrapper.jsx      # 3D tilt card animation
│   │   │   ├── ProtectedRoute.jsx   # Auth route guard
│   │   │   ├── DriverRoute.jsx      # Driver role route guard
│   │   │   └── admin/               # Admin panel components
│   │   ├── context/
│   │   │   └── authContext.js       # Global auth state (Firebase + MongoDB)
│   │   └── lib/
│   │       ├── firebase.js          # Firebase client SDK config
│   │       └── socket.js            # Socket.IO client instance
│   ├── public/
│   ├── package.json
│   └── .gitignore
│
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Lucide Icons |
| **Backend** | Express 5, Node.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | Firebase Auth (Email/Password) + Firebase Admin SDK |
| **Real-Time** | Socket.IO (WebSocket) |
| **Maps** | Leaflet + React-Leaflet + Leaflet Routing Machine |
| **Payments** | Razorpay |
| **Charts** | Recharts |
| **Security** | Helmet, express-rate-limit, express-mongo-sanitize |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB Atlas** account (or local MongoDB instance)
- **Firebase** project with Authentication enabled
- **Razorpay** account (for payment features)

### 1. Clone the Repository

```bash
git clone https://github.com/Veda361/ridego.com.git
cd ridego.com
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=5000
```

Add your Firebase Admin SDK service account key:
- Download `serviceAccountKey.json` from your Firebase Console → Project Settings → Service Accounts
- Place it in `backend/src/config/serviceAccountKey.json`

Start the backend:

```bash
npm run dev      # Development (with nodemon)
npm start        # Production
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev      # Development (http://localhost:3000)
npm run build    # Production build
npm start        # Production server
```

---

## 🔌 API Endpoints

### Authentication & Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/users/register` | Register a new user |
| `GET` | `/api/users/me` | Get current user profile |

### Rides
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/rides/request` | Request a new ride |
| `PUT` | `/api/rides/accept/:id` | Driver accepts a ride |
| `PUT` | `/api/rides/start/:id` | Driver starts the ride |
| `PUT` | `/api/rides/complete/:id` | Driver completes the ride |
| `PUT` | `/api/rides/cancel/:id` | Cancel a ride |
| `GET` | `/api/rides/my-rides` | Get rider's ride history |
| `GET` | `/api/rides/driver-rides` | Get driver's ride history |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/drivers/register` | Register as a driver |
| `PUT` | `/api/drivers/go-online` | Toggle driver online |
| `PUT` | `/api/drivers/go-offline` | Toggle driver offline |
| `GET` | `/api/drivers/stats` | Get driver statistics |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/stats` | Platform-wide analytics |
| `GET` | `/api/admin/users` | List all users |
| `GET` | `/api/admin/users/:id` | Get user details |
| `GET` | `/api/admin/drivers` | List all drivers |
| `GET` | `/api/admin/rides` | List all rides |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments/create-order` | Create Razorpay order |
| `POST` | `/api/payments/verify` | Verify payment signature |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/messages/:rideId` | Get messages for a ride |
| `POST` | `/api/messages/send` | Send a message |

---

## 🔄 Real-Time Events (Socket.IO)

| Event | Direction | Description |
|-------|-----------|-------------|
| `register-user` | Client → Server | Register user's socket connection |
| `new-ride-request` | Server → Driver | Notify nearby drivers of a new ride |
| `ride-accepted` | Server → Rider | Notify rider that a driver accepted |
| `driver-location-update` | Driver → Server → Rider | Live location streaming |
| `ride-started` | Server → Rider | Notify rider the ride has started |
| `ride-completed` | Server → Rider | Notify rider the ride is complete |
| `send-message` | Client → Server | Send a chat message |
| `receive-message` | Server → Client | Receive a chat message |

---

## 🌍 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay API secret |
| `PORT` | ❌ | Server port (default: `5000`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `NEXT_FIREBASE_STORAGE_BUCKET` | ❌ | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL |

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Veda361">Veda361</a>
</p>
