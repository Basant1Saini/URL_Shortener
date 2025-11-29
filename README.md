# URL Shortener - MERN Stack

A full-stack URL shortening service built with MongoDB, Express.js, React, and Node.js.

## 🚀 Features
- Shorten long URLs
- Custom short URL aliases
- Click tracking and analytics
- URL expiration dates
- User authentication
- Dashboard for managing URLs

## 🛠️ Tech Stack

### Backend
- **Node.js** (v20+) - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **express-rate-limit** - Rate limiting
- **cors** - Cross-origin requests
- **helmet** - Security headers
- **express-validator** - Input validation
- **dotenv** - Environment variables

### Frontend
- **React** (v18+) - UI library with hooks
- **React Router DOM** (v6+) - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled accessible components
- **Chart.js** with **react-chartjs-2** - Analytics visualization
- **React Hook Form** - Form handling
- **React Query/TanStack Query** - Server state management

## 📁 Project Structure

```
URL_Shortener/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── urlController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Url.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── urls.js
│   ├── utils/
│   │   └── generateShortUrl.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── UrlShortener.jsx
│   │   │   └── Analytics.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🗄️ Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### URL Model
```javascript
{
  _id: ObjectId,
  originalUrl: String,
  shortUrl: String,
  urlCode: String,
  userId: ObjectId (ref: User),
  clicks: Number,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### URL Management
- `POST /api/urls/shorten` - Create short URL
- `GET /api/urls` - Get user's URLs
- `GET /api/urls/:id` - Get specific URL details
- `DELETE /api/urls/:id` - Delete URL
- `GET /:shortCode` - Redirect to original URL

### Analytics
- `GET /api/urls/:id/analytics` - Get URL analytics
- `GET /api/analytics/dashboard` - Get dashboard stats

## 🚀 Development Plan

### Phase 1: Backend Setup (Week 1)
1. Initialize Node.js project
2. Set up Express server
3. Configure MongoDB connection
4. Create User and URL models
5. Implement authentication middleware
6. Build auth routes (register/login)

### Phase 2: Core URL Functionality (Week 2)
1. Create URL shortening algorithm
2. Implement URL creation endpoint
3. Build redirect functionality
4. Add click tracking
5. Create URL management endpoints

### Phase 3: Frontend Foundation (Week 3)
1. Set up React application with Vite
2. Configure React Router v6
3. Create authentication context with useContext
4. Build login/register components with React Hook Form
5. Implement API service layer with Axios interceptors

### Phase 4: UI Components (Week 4)
1. Create URL shortener form with validation
2. Build dashboard with React Query for data fetching
3. Implement URL list with optimistic updates
4. Add analytics visualization with Chart.js
5. Style with Tailwind CSS and Headless UI

### Phase 5: Advanced Features (Week 5)
1. Add custom alias functionality
2. Implement URL expiration
3. Build comprehensive analytics
4. Add rate limiting
5. Implement error handling

### Phase 6: Testing & Deployment (Week 6)
1. Write unit tests
2. Add integration tests
3. Set up CI/CD pipeline
4. Deploy to cloud platform
5. Configure domain and SSL

## 🔒 Security Features
- JWT-based authentication with secure tokens
- Password hashing with bcrypt (salt rounds: 12)
- Rate limiting for API endpoints
- Input validation with express-validator
- CORS configuration with specific origins
- Helmet.js for security headers
- Environment variable protection
- MongoDB injection prevention
- XSS protection
- CSRF protection

## 📊 Analytics Features
- Click tracking
- Geographic data
- Referrer information
- Time-based analytics
- Top performing URLs
- User dashboard metrics

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+) - Latest LTS
- MongoDB (v7+)
- npm (v10+) or yarn (v4+)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd URL_Shortener
```

2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Environment Variables

### Backend (.env)
```
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/urlshortener
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d
PORT=5000
BASE_URL=http://localhost:5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_BASE_URL=http://localhost:3000
```

## 📝 Future Enhancements
- QR code generation
- Bulk URL shortening
- API key management
- Advanced analytics dashboard
- Social media integration
- Mobile application
- URL preview functionality
- Team collaboration features

## 🤝 Contributing
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License
MIT License