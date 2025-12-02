# FlexiBook Salon - Appointment Booking System

## Project Overview
FlexiBook Salon is a comprehensive appointment booking system designed for salons and service businesses. It features role-based access for administrators and customers, real-time availability checking, and a user-friendly calendar interface.

## Key Features

### Admin Features
- **Dashboard Analytics**: Real-time booking statistics and revenue tracking
- **User Management**: Complete user administration and role management
- **Service Management**: Full CRUD operations for salon services (Hair, Nails, Skin, Massage)
- **Booking Management**: View, confirm, and cancel all appointments
- **Reports & Insights**: Generate detailed reports and view business analytics
- **Role-Based Access**: Exclusive admin-only functionality

### Customer Features
- **Easy Booking**: Intuitive booking form with service selection
- **Calendar View**: Visual calendar with real-time availability
- **Service Browser**: Filter and search services by category and price
- **My Bookings**: View and manage personal appointments
- **Notifications**: Booking confirmations
- **Multi-Currency**: Philippine Peso (₱) support

### System Features
- **Secure Authentication**: JWT-based login/register system
- **Responsive Design**: Fully mobile-friendly interface
- **Real-time Updates**: Live availability and booking status
- **Input Validation**: Comprehensive form validation
- **Email Notifications**: Automated booking confirmations
- **Data Analytics**: Business insights and reporting

## Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **CSS3** - Custom styling with responsive design
- **React Hooks** - State management (useState, useEffect)
- **Axios** - HTTP client for API communication
- **Date-fns** - Date manipulation utilities
- **JWT Authentication** - Secure user sessions

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - Authentication tokens
- **Nodemailer** - Email notifications
- **Chart.js** - Data visualization for reports

## API Documentation

### User Management APIs
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/bookings` - Get user's bookings
- `PUT /api/users/password` - Change password
- `GET /api/users/booking-stats` - Get booking statistics

[View API Documentation](https://drive.google.com/file/d/1FwUIKVNXxyeZ1bKTvvubeUnLBDXaeBx8/view?usp=sharing)

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create service (Admin only)
- `PUT /api/services/:id` - Update service (Admin only)
- `DELETE /api/services/:id` - Delete service (Admin only)

[View API Documentation](https://drive.google.com/file/d/1IRMK11LDqcpfBs5jy4Gjebv1cokYDSW1/view?usp=sharing)

### Bookings
- `GET /api/bookings/available-slots` - Get available time slots
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

[View API Documentation](https://drive.google.com/file/d/187EUsEyeMFats_nG7F85GLDTyZmYMzwe/view?usp=sharing)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/reports` - Generate reports

[View API Documentation](https://drive.google.com/file/d/1StDehOHtdiyT79wbwjgB6GqeVILnujtU/view?usp=sharing)

## UI Components

### Main Components
- **Login/Register** - User authentication
- **ServiceList** - Browse and filter services
- **BookingForm** - Create new appointments
- **CalendarView** - Visual calendar with availability
- **MyBookings** - Manage personal appointments
- **AdminDashboard** - Admin management interface

### Design Features
- Clean, modern interface with intuitive navigation
- Fully responsive design for all devices
- Consistent color scheme with visual hierarchy
- Smooth animations and transitions
- Fast loading with optimized components

## Security Features
- JWT-based authentication with token expiration
- Password hashing using bcrypt
- Role-based access control (Admin/User)
- Input validation on all forms
- SQL injection prevention with parameterized queries