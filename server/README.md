# 🚛 FleetFlow Backend API

Production-ready Node.js + Express backend for the **FleetFlow Fleet & Logistics Management System**.

## 📁 Folder Structure

```
server/
├── database/
│   ├── schema.sql          # Database tables & ENUMs
│   └── seed.sql            # Demo seed data
├── src/
│   ├── app.js              # Express app configuration
│   ├── server.js           # Entry point
│   ├── config/
│   │   └── supabase.js     # Supabase client (service role)
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── drivers.controller.js
│   │   ├── fuel.controller.js
│   │   ├── maintenance.controller.js
│   │   ├── trips.controller.js
│   │   └── vehicles.controller.js
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   └── rbac.js          # Role-based access control
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── drivers.routes.js
│   │   ├── fuel.routes.js
│   │   ├── maintenance.routes.js
│   │   ├── trips.routes.js
│   │   └── vehicles.routes.js
│   └── utils/
│       └── rules.js         # Business rules & AI features
├── .env.example
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Supabase** project ([supabase.com](https://supabase.com))

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### 3. Create database tables

1. Go to your Supabase project → **SQL Editor**
2. Run `database/schema.sql` to create all tables
3. Run `database/seed.sql` to load demo data

### 4. Create Auth users in Supabase

1. Go to **Authentication → Users** in Supabase dashboard
2. Create users with email/password (e.g., `alice@fleetflow.io`)
3. Copy each user's UUID and update the `INSERT INTO users` statement in `seed.sql`
4. Run the users INSERT in the SQL editor

### 5. Start the server

```bash
# Development (with hot-reload)
npm run dev

# Production
npm start
```

The API will start at `http://localhost:5000`.

## 📡 API Endpoints

| Method | Endpoint              | Description              | Roles                              |
|--------|-----------------------|--------------------------|--------------------------------------|
| POST   | `/auth/login`         | Login with email/password| Public                               |
| POST   | `/vehicles`           | Create vehicle           | Manager                              |
| GET    | `/vehicles`           | List vehicles            | Manager, Dispatcher                  |
| POST   | `/drivers`            | Create driver            | Manager, SafetyOfficer               |
| GET    | `/drivers`            | List drivers             | Manager, SafetyOfficer, Dispatcher   |
| POST   | `/trips`              | Create trip              | Manager, Dispatcher                  |
| PUT    | `/trips/:id/status`   | Update trip status       | Manager, Dispatcher                  |
| POST   | `/maintenance`        | Add maintenance log      | Manager, SafetyOfficer               |
| POST   | `/fuel`               | Add fuel log             | Manager, FinancialAnalyst            |
| GET    | `/dashboard/kpis`     | Get fleet KPIs           | Manager, Dispatcher, FinancialAnalyst|

### Query Parameters

- `GET /vehicles?available=true` — exclude vehicles with status "In Shop"

## 🔐 Authentication

All endpoints (except `/auth/login`) require a JWT token:

```
Authorization: Bearer <access_token>
```

Get a token by calling `POST /auth/login` with `{ "email": "...", "password": "..." }`.

## ⚙️ Business Rules

| Rule                              | Enforcement                                      |
|-----------------------------------|--------------------------------------------------|
| Cargo > vehicle capacity          | Trip creation rejected with 400                  |
| Driver license expired            | Trip creation rejected with 400                  |
| Trip → "Dispatched"               | Vehicle & driver status → "On Trip"              |
| Trip → "Completed"                | Vehicle → "Available", driver → "On Duty"        |
| Maintenance log created           | Vehicle → "In Shop"                              |
| `?available=true` on vehicles     | Excludes "In Shop" vehicles                      |

## 🤖 AI / Rule-Based Features

- **Predictive Maintenance**: Vehicles with `odometer > 5000` are flagged `"Service Due Soon"` in API responses
- **Fleet Health Score**: `100 - (maintenance_count × 5) - (cancelled_trips × 3)`, clamped 0–100

## 🧪 Testing with cURL

```bash
# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@fleetflow.io","password":"your-password"}'

# Create vehicle (use token from login)
curl -X POST http://localhost:5000/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Truck","plate":"NT-0001","model":"Model X","capacity":20000}'

# Get KPIs
curl http://localhost:5000/dashboard/kpis \
  -H "Authorization: Bearer YOUR_TOKEN"
```
