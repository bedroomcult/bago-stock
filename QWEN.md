# Bago Stock Management System - Project Context

## Project Overview
Bago Stock is a QR code-based inventory management system designed for furniture products. The system enables real-time tracking of products across multiple locations (TOKO, GUDANG KEPATHIAN, GUDANG NGUNUT) with QR code scanning functionality. It includes features like product registration, location tracking, analytics dashboard, template management for product categories, low stock notifications, and comprehensive audit trails.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Session-based with 12-hour session timeout
- **QR Generation**: Built-in functionality for creating unique QR codes
- **API**: RESTful API with role-based access control (admin/staff)

## Key Components

### Frontend Structure (src/)
- **Components**: Reusable React components
- **Pages**: Main application pages (Dashboard, Product Management, Template Management, etc.)
- **Utils**: Helper functions and utilities
- **Contexts**: React context for state management

### Backend Structure (server/)
- **Routes**: API route handlers (auth, products, qr, scan, templates, bulk, users, settings, analytics)
- **Config**: Configuration files (Supabase client initialization)
- **Middleware**: Authentication and authorization middleware
- **Package.json**: Backend dependencies (Supabase client, Express, session management)

### Database Schema (PostgreSQL via Supabase)
- **users**: User authentication and role management (admin/staff)
- **products**: Product records with QR codes, categories, names, and status/location
- **product_templates**: Predefined product categories and names
- **activity_logs**: Comprehensive audit trail of all user actions
- **system_settings**: Configurable system parameters
- **low_stock_alerts**: Automatic alerts for low stock items
- **sessions**: User session management

## Key Features
1. **QR Code Management**: Generate and scan unique QR codes for each product
2. **Multi-location Tracking**: Monitor products across different warehouses
3. **Analytics Dashboard**: Visualize registration trends, stock distribution, and user metrics
4. **Template Management**: Predefined product categories to maintain consistency
5. **Activity Logging**: Complete audit trail of all system operations
6. **User Roles**: Different permissions for admin and staff users

## Development Setup & Commands

### Installation
```
npm install                    # Install frontend dependencies
cd server && npm install      # Install backend dependencies
```

### Environment Configuration
Create `server/.env` with:
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SESSION_SECRET=your-session-secret
```

### Running the Application
- **Frontend only**: `npm run dev`
- **Backend only**: `npm run server:dev`
- **Both simultaneously**: `npm run dev:full`
- **Production build**: `npm run build` (frontend), then `npm run server`

### Default Users
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Manager | manager | manager123 |
| Staff | staff1 | staff123 |
| Staff | staff2 | staff123 |

## API Endpoints
- `POST /api/auth` - Login/logout
- `GET /api/products` - Get product list
- `POST /api/products` - Register new product
- `PUT /api/products` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET/POST /api/qr` - Generate QR codes
- `POST /api/scan` - Scan QR codes
- `GET/POST/PUT/DELETE /api/templates` - Template management

## Development Conventions
- All user activities are logged in the activity_logs table
- Products must be registered with predefined templates
- Session timeout is set to 12 hours (43200 seconds)
- Low stock notifications trigger when stock ≤ threshold

## Technical Notes
- The Supabase client has a fallback mechanism for development without proper environment variables
- Backend includes comprehensive error handling and logging
- Frontend uses React Router for navigation
- Uses UUID for unique product identification
- Database includes proper indexing for performance optimization