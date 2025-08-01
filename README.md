# Issue Tracker 

A full-stack web application for managing and tracking issues with comprehensive CRUD operations, user authentication, and real-time filtering capabilities.

## Live Demo

- **Frontend**: [https://issue-tracker-smoky-beta.vercel.app/](https://issue-tracker-smoky-beta.vercel.app/)
- **Backend API**: [https://issue-tracker-production-7131.up.railway.app/](https://issue-tracker-production-7131.up.railway.app/)

## Features

### Core Functionality
- **Complete CRUD Operations** - Create, Read, Update, Delete issues
- **User Authentication** - Login/Register with JWT tokens
- **Google OAuth Integration** - Sign in with Google using Firebase
- **Advanced Filtering** - Search by title, description, status, priority, and severity
- **Real-time Validation** - Form validation with error handling
- **Responsive Design** - Mobile-first design approach
-  **Loading States** - Smooth loading animations and transitions

### Issue Management
- **Issue Creation** with title, description, severity, priority, and status
- **Status Tracking**: Open, In Progress, Testing, Resolved, Closed
- **Priority Levels**: Low, Normal, High
- **Severity Levels**: Low, Medium, High
- **View/Edit/Delete** operations for each issue
- **Search Functionality** across title and description

### UI/UX Features
-  **Modern Design** with Tailwind CSS
- **Color-coded Status** - Blue gradient system for intuitive status understanding
-  **Unified Severity Colors** - Red gradient system for severity levels
-  **Smooth Animations** using Framer Motion
- **Mobile Responsive** design
-  **Password Visibility Toggle** with auto-hide after 2 seconds

## Technology Stack

### Frontend
- **React 19.1.0** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **React Icons** - Icon library
- **SweetAlert2** - Beautiful alerts and modals
- **Firebase** - Google OAuth authentication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/oshadha2k01/Issue-Tracker.git
cd Issue-Tracker
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

### Environment Configuration

#### Backend (.env)
Create a `.env` file in the `backend` directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

#### Frontend (.env)
Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
npm start
# Server will run on http://localhost:5000
```

2. **Start the Frontend Development Server**
```bash
cd frontend
npm run dev
# Application will run on http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login

### Issues
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Create new issue (Auth required)
- `GET /api/issues/:id` - Get issue by ID
- `PUT /api/issues/:id` - Update issue (Auth required)
- `DELETE /api/issues/:id` - Delete issue (Auth required)

##  Authentication

The application supports two authentication methods:

1. **Traditional Login** - Username/password with JWT tokens
2. **Google OAuth** - Firebase-powered Google sign-in

All CRUD operations require user authentication except viewing issues.

##  Design System

### Color Scheme
- **Status Colors**: Blue gradient system (dark to light based on urgency)
- **Severity Colors**: Red gradient system (dark to light based on severity)
- **Primary Colors**: Blue (#1e3a8a) for buttons and accents
- **Neutral Colors**: Gray shades for backgrounds and text

### Typography
- **Font Family**: Inter (system font fallback)
- **Headings**: Bold weights for hierarchy
- **Body Text**: Regular weight for readability

## Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Configure environment variables in Railway dashboard
3. Deploy automatically on push to main branch


## Author

**Oshadha Pathiraja**
- GitHub: [@oshadha2k01](https://github.com/oshadha2k01)
