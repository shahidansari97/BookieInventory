# Bookie Inventory Management System

## Overview

This is a full-stack web application designed to digitize and automate the inventory management process for bookies who trade cricket IDs and other betting inventory. The system replaces manual Excel-based tracking with a centralized digital ledger, automates balance calculations, and provides WhatsApp integration for settlement communications.

The application manages the flow where bookies take inventory from uplinks (suppliers) at negotiated rates and distribute it to downlines (agents) with their own commission structures. It tracks points, rates, commissions, and automatically calculates weekly settlements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation schemas
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with centralized route registration
- **Error Handling**: Global error middleware with structured error responses
- **Request Logging**: Custom middleware for API request/response logging
- **Development**: Hot module replacement via Vite integration

### Data Storage Architecture
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema updates
- **Connection**: Neon Database serverless PostgreSQL
- **Data Validation**: Shared Zod schemas between frontend and backend
- **Storage Interface**: Comprehensive IStorage interface abstracting all database operations

### Database Schema Design
The system uses five core entities:
- **Users**: Authentication and role-based access (bookie/assistant roles)
- **Profiles**: Uplink and downline contact and rate information
- **Transactions**: Individual inventory movements with points, rates, and commissions
- **Ledger Entries**: Calculated weekly balances per profile and period
- **Settlements**: WhatsApp message tracking and settlement records
- **Audit Logs**: Complete activity tracking for compliance and debugging

### Component Architecture
- **Layout Components**: Responsive sidebar navigation with mobile support
- **Modal System**: Reusable modal components for CRUD operations
- **Data Tables**: Generic table component with pagination and sorting
- **Form Components**: Type-safe forms with validation and error handling
- **UI Components**: Consistent design system with accessibility features

### Business Logic Design
- **Rate Management**: Flexible rate per point system for different profiles
- **Commission Calculation**: Percentage-based commission on downline transactions
- **Settlement Processing**: Automated weekly balance calculation and message generation
- **Audit Trail**: Comprehensive logging of all system activities with user attribution

## External Dependencies

### Database & ORM
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations and migrations
- **Drizzle Kit**: Schema management and migration tools

### UI & Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Shadcn/ui**: Pre-built component library with consistent theming
- **Lucide React**: Icon library for UI elements

### State & Data Management
- **TanStack React Query**: Server state management with caching and synchronization
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation and schema definition

### Development Tools
- **Vite**: Fast build tool with HMR and development server
- **TypeScript**: Static typing for both frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds

### Future Integrations
- **WhatsApp Business API**: For automated settlement message delivery
- **Session Management**: connect-pg-simple for PostgreSQL-backed sessions
- **Authentication**: JWT or session-based authentication system