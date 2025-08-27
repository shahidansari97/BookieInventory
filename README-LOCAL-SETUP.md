# Bookie Inventory Management System - Local Setup

A comprehensive full-stack web application for digitizing and automating bookie inventory management operations.

## 🚀 Quick Start

1. **Extract the backup file:**
   ```bash
   tar -xzf bookie-system-backup.tar.gz
   cd bookie-inventory-system
   ```

2. **Run the setup script:**
   ```bash
   chmod +x setup-local.sh
   ./setup-local.sh
   ```

3. **Start the application:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5000`

5. **Login with demo credentials:**
   - **Bookie:** `admin` / `admin123` (full access)
   - **Assistant:** `assistant` / `assistant123` (limited access)

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL** (optional, for production setup)

## 🏗️ Project Structure

```
bookie-inventory-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage interface
│   └── index.ts            # Server entry point
├── shared/                 # Shared TypeScript types
│   └── schema.ts           # Database schemas and types
├── package.json            # Dependencies and scripts
└── vite.config.ts          # Build configuration
```

## 🎯 Key Features

- **Dashboard:** Real-time metrics and recent transactions
- **Profile Management:** Uplink and downline contact management
- **Transaction Tracking:** Automated calculations with commission handling
- **Ledger System:** Weekly balance calculations and profit/loss reports
- **Settlement Integration:** WhatsApp message simulation for settlements
- **Custom Reports:** Date range filtering and detailed analytics
- **User Management:** Role-based access control (Bookie/Assistant)
- **Audit Trail:** Complete activity tracking for compliance

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server (frontend + backend)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🗄️ Database Setup (Optional)

The system uses in-memory storage by default. For production with PostgreSQL:

1. **Install PostgreSQL:**
   - [Windows](https://www.postgresql.org/download/windows/)
   - [macOS](https://www.postgresql.org/download/macosx/)
   - [Linux](https://www.postgresql.org/download/linux/)

2. **Create database:**
   ```sql
   CREATE DATABASE bookie_db;
   ```

3. **Update .env file:**
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/bookie_db
   ```

4. **Tables will be created automatically** when the app starts.

## 🔧 Configuration

### Environment Variables (.env)

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://localhost:5432/bookie_db
```

### Application Settings

- **Default Port:** 5000
- **Storage:** In-memory (development) / PostgreSQL (production)
- **Session Management:** Memory store (can be upgraded to PostgreSQL sessions)

## 🎭 Demo Accounts

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Bookie | admin | admin123 | Full system access |
| Assistant | assistant | assistant123 | Limited access |

## 📱 Responsive Design

- **Desktop:** Full sidebar navigation with all features
- **Tablet:** Responsive layout with collapsible sidebar
- **Mobile:** Touch-friendly interface with mobile header

## 🔒 Security Features

- **Authentication:** Session-based login system
- **Role-based Access:** Different permissions for Bookie and Assistant roles
- **Audit Logging:** Complete tracking of all user activities
- **Input Validation:** Form validation using Zod schemas
- **XSS Protection:** Sanitized inputs and secure rendering

## 🚀 Deployment Options

### Local Development
- Run `npm run dev` for hot-reload development
- Access at `http://localhost:5000`

### Production Deployment
1. Build the application: `npm run build`
2. Set `NODE_ENV=production` in .env
3. Start with: `npm start`
4. Configure reverse proxy (nginx) for production domains

### Cloud Deployment
- **Vercel:** Frontend deployment with serverless functions
- **Railway:** Full-stack deployment with PostgreSQL
- **Heroku:** Container-based deployment
- **DigitalOcean:** VPS deployment with managed databases

## 📊 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for routing
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Shadcn/ui** component library
- **Tailwind CSS** for styling
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Zod** for runtime validation
- **RESTful API** design

### Database
- **PostgreSQL** (production)
- **In-memory storage** (development)
- **Drizzle Kit** for migrations

## 🔄 Data Flow

1. **User Authentication:** Login with role-based access
2. **Profile Management:** Create/manage uplinks and downlines
3. **Transaction Entry:** Record inventory movements with automatic calculations
4. **Ledger Processing:** Weekly balance calculations and profit/loss tracking
5. **Settlement Generation:** WhatsApp message creation for weekly settlements
6. **Reporting:** Custom date range reports with detailed analytics
7. **Audit Tracking:** Complete activity logging for compliance

## 🆘 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 5000
npx kill-port 5000
```

**Permission issues on setup script:**
```bash
chmod +x setup-local.sh
```

**Node.js version issues:**
- Install Node.js 18+ from [nodejs.org](https://nodejs.org/)
- Use nvm to manage multiple Node.js versions

**Database connection errors:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database exists and is accessible

### Development Tips

- Use browser dev tools for debugging
- Check browser console for JavaScript errors
- Monitor network tab for API request/response issues
- Use React Developer Tools for component debugging

## 📞 Support

For technical support or questions about the system:
1. Check this README for common solutions
2. Review browser console for error messages
3. Verify all prerequisites are installed correctly
4. Contact your system administrator for deployment-specific issues

## 📄 License

This project is proprietary software designed for bookie inventory management operations.