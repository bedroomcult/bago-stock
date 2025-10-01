Manajemen Stok Bago - Complete Application Specification

📋 Project Overview

Application Name: Manajemen Stok Bago
Purpose: QR-code based inventory management system for furniture products
Core Concept: Track products through unique QR codes across multiple locations with real-time stock monitoring

🛠 Technology Stack

· Frontend: React + Vite + Tailwind CSS + shadcn/ui
· Backend: PHP
· Database: PostgreSQL
· Authentication: Session-based
· QR Generation: qrcode library

🔐 Authentication & Security

Session Management

· Session Duration: 12 hours inactivity timeout
· Auto-logout after expiration
· Session validation on every API request
· Automatic redirect to login when session expires

Predefined Users

Admin Accounts:

· admin / admin123
· manager / manager123

Staff Accounts:

· staff1 / staff123
· staff2 / staff123

👥 User Roles & Permissions

Feature Staff Admin
Single Scan ✅ ✅
Quick Scan ✅ ✅
Product Registration ✅ ✅
Product Editing ✅ ✅
View Analytics ❌ ✅
Generate QR Codes ❌ ✅
Bulk Operations ❌ ✅
User Management ❌ ✅
Product Templates ❌ ✅
System Settings ❌ ✅

📊 Database Structure

Core Tables

· users - User accounts, roles, and activity tracking
· products - Product data with UUID, categories, status, timestamps
· product_templates - Predefined categories and product names
· activity_logs - Complete audit trail of all actions
· system_settings - Configurable application settings
· low_stock_alerts - Stock notification tracking
· sessions - User session management

🎯 Core Features

A. QR Code System

QR Code Generation (Admin Only)

· Generate unique UUID QR codes in bulk
· Batch management and tracking
· PDF/PNG export formats
· Reprint functionality for lost/damaged codes

QR Code Workflow

· Each QR contains unique UUID
· Before registration: No product data (just identifier)
· After registration: Linked to product information
· Physical printing and attachment to products

B. Product Management

Product Categories (Predefined)

· Sofa, Kursi, Meja, Sungkai, Nakas, Buffet

Status Options

· TOKO, GUDANG KEPATHIAN, GUDANG NGUNUT, TERJUAL

Product Registration Form

```
Fields:
- Kategori Produk: [Dropdown from templates]
- Nama Produk: [Dropdown populated based on category selection]
- Status: [Dropdown - TOKO, GUDANG KEPATHIAN, GUDANG NGUNUT]

Validation:
- Product name must be from predefined templates
- Automatic user and timestamp tracking
```

C. Scanning Interfaces

1. Single Scan

· Camera-based QR scanner
· Manual QR code input option
· Automatic redirect to registration/edit based on scan result
· Simple, focused interface for daily operations

2. Quick Scan (Bulk Operations)

· Continuous scanning mode
· Scanned items list with status indicators
· Bulk status updates for registered products
· Popup registration for unregistered QR codes
· Export functionality for scanned lists

D. Stock Management

Low Stock Alerts

· Configurable thresholds (low/critical stock)
· Real-time dashboard notifications
· Visual indicators in product tables
· Alert resolution tracking
· Automatic checks on product changes

Stock Status Badges

· NORMAL: Standard indicator (stock above threshold)
· RENDAH: Orange warning (stock ≤ low threshold)
· KRITIS: Red critical (stock ≤ critical threshold)

E. Admin-Only Features

1. Product Templates Management

· Add/edit/delete product categories
· Manage product names per category
· Activation/deactivation of templates
· Bulk import/export via CSV
· Usage statistics per template

2. User Management

· Create/edit user accounts
· Role assignment (admin/staff)
· Activation/deactivation
· User performance metrics tracking

3. Bulk Operations

· Mass status updates
· Bulk category changes
· Data export with filters
· Batch product modifications

4. Analytics Dashboard

· Stock distribution charts
· Registration trends (daily/weekly/monthly)
· Sales analytics
· User performance metrics
· Low stock alerts summary

🚀 Workflows

1. Authentication Flow

```
User accesses app → Check existing session
    ↓
If valid session → Redirect to role-appropriate dashboard
    ↓
If no session → Show login page
    ↓
User enters credentials → Validate → Create 12-hour session
    ↓
Redirect to dashboard
```

2. Single Scan Workflow

```
User scans QR code → System checks UUID in database
    ↓
If UUID NOT EXISTS:
    - Show registration form with template-based dropdowns
    - User selects category → product name → status
    - Save with user tracking and timestamps
    ↓
If UUID EXISTS:
    - Display current product information
    - Show edit form (ID field disabled)
    - Allow updates with user tracking
```

3. Quick Scan Workflow

```
User enters Quick Scan mode → Continuous scanning active
    ↓
For each scan:
    If UUID exists → Add to list with product info
    If UUID doesn't exist → Show registration popup
    ↓
User selects target status from dropdown
    ↓
Apply status to all registered items in list
    ↓
Handle unregistered items via quick registration popup
```

4. Product Registration Workflow

```
Scan QR → UUID not found → Show registration form
    ↓
User selects category → Product name dropdown populates
    ↓
User selects from predefined product names
    ↓
User selects initial status
    ↓
Save → Return to scanning interface
```

5. Low Stock Alert Workflow

```
Product stock changes → System checks against thresholds
    ↓
If stock ≤ critical threshold → Create critical alert
    ↓
If stock ≤ low threshold → Create low stock alert
    ↓
Admin sees alerts on dashboard
    ↓
Admin takes action (restock, etc.)
    ↓
Alert resolved when stock increases above threshold
```

🖥 User Interface Layouts

Staff Navigation

```
[Logo] Manajemen Stok Bago
- 🏠 Dashboard (Scan Interface)
- 🎯 Quick Scan (Bulk scanning)
- 📱 Single Scan (Traditional scan)
- 📋 Aktivitas Saya (Personal activity)
- ⚙️ Profil (User settings)
```

Admin Navigation

```
[Logo] Manajemen Stok Bago
- 🏠 Dashboard (Analytics + Quick Actions)
- 🎯 Quick Scan (Bulk scanning)
- 📱 Single Scan (Traditional scan)
- 📦 Detail Stok (Product table)
- 🎯 Generasi QR (QR generation)
- 📋 Template Produk (Product templates)
- 🔄 Operasi Massal (Bulk operations)
- 👥 Manajemen User (User management)
- 📋 Log Aktivitas (Activity logs)
- ⚙️ Pengaturan (System settings)
```

Staff Dashboard

```
[Header: Selamat Datang, [Nama User]]

MAIN OPTIONS:
[ 🎯 Quick Scan ] [ 📱 Single Scan ]

QUICK STATS:
- Scan Hari Ini: [count]
- Produk Didaftarkan: [count]
- Produk Diupdate: [count]

RECENT ACTIVITY (Last 5 actions)
```

Admin Dashboard

```
QUICK ACTIONS:
[ 🎯 Quick Scan ] [ 📦 Detail Stok ] [ 🎯 Generasi QR ] [ 👥 Manage User ]

ANALYTICS CARDS:
- Total Produk, Di Toko, Stok Rendah, Stok Kritis, Terjual, Total User

CHARTS:
- Stock Distribution, Registration Trends

TABLES:
- User Performance, Low Stock Alerts
```

⚙️ System Configuration

Settings Management

· Stock Alert Thresholds: Configurable low/critical levels
· Notification Methods: Dashboard, email, or both
· Session Configuration: 12-hour duration
· Template Management: Product categories and names

Data Validation Rules

· Product names must come from predefined templates
· Unique UUID enforcement
· Required field validation
· User activity logging for all actions

📈 Reporting & Analytics

Available Reports

· Stock summary reports
· Sales performance by period
· User activity reports
· Registration trend analysis
· Low stock alerts history

Export Capabilities

· Excel/CSV export for data analysis
· PDF reports for formal documentation
· Custom date range exports
· Filtered data exports

🔄 API Structure

Authentication Endpoints

· Login, logout, session validation

Product Endpoints

· CRUD operations, detailed listings, exports

Scan Endpoints

· Single scan, quick scan sessions, bulk operations

Admin Endpoints

· QR generation, user management, templates, analytics

Settings Endpoints

· Stock alerts, system configuration

🎯 Key Benefits

Operational Efficiency

· Quick product registration and updates
· Bulk operations for inventory management
· Reduced data entry errors with template-based system
· Real-time stock monitoring

Data Accuracy

· Consistent product naming through templates
· Complete audit trail of all actions
· User activity tracking
· Automated stock alerts

Business Intelligence

· Comprehensive analytics dashboard
· Sales and registration trends
· User performance metrics
· Stock movement patterns

This specification provides a complete overview of the Manajemen Stok Bago application for inventory management using QR codes, with clear separation between staff and admin functionalities, comprehensive tracking, and efficient workflow design.