# Vastra - AI-Powered Fashion E-Commerce Platform

A modern, full-stack fashion e-commerce application with AI-powered features including virtual try-on, smart size recommendations, and advanced admin analytics.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen)
![React](https://img.shields.io/badge/react-19.2-blue)
![MongoDB](https://img.shields.io/badge/mongodb-latest-green)

---

<img width="1888" height="911" alt="v1" src="https://github.com/user-attachments/assets/2b7c3bee-33c6-4853-9bc5-37ded1b77ab9" />

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Database Models](#database-models)
- [API Documentation](#api-documentation)
- [Admin Dashboard](#admin-dashboard)
- [Key Features Explained](#key-features-explained)
- [Folder Structure Details](#folder-structure-details)

---

## 🎯 Project Overview

**Vastra** is a cutting-edge fashion e-commerce platform that combines modern web technologies with AI-powered features. The platform offers:

- **Customer-facing store** for browsing and purchasing fashion items
- **Virtual try-on** using AI image processing
- **Smart size recommendations** based on user profiles and history
- **Mobile image upload** for try-on in real clothes
- **Complete admin dashboard** with analytics, product management, and order tracking
- **Real-time order management** with email notifications
- **Category-based shopping** with gender-specific filtering (Men, Women, Children)

The application is built with a **React frontend**, **Node.js/Express backend**, and **MongoDB database**.

---

## 🛠 Tech Stack

### Frontend (Customer Store)
- **React 19.2** - UI framework
- **Vite 7.3** - Build tool and dev server
- **TailwindCSS 4.2** - Utility-first CSS framework
- **React Router 7.13** - Client-side routing
- **Axios 1.13** - HTTP client for API calls
- **Zustand 5.0** - State management
- **Framer Motion 12.38** - Animation library
- **React Icons 5.5** - Icon library
- **React Hot Toast 2.6** - Notifications
- **QRCode.React 4.2** - QR code generation
- **React Dropzone 15.0** - File upload

### Backend (API Server)
- **Node.js** - JavaScript runtime
- **Express 5.2** - Web framework
- **MongoDB 9.3** - NoSQL database
- **Mongoose 9.3** - MongoDB ODM
- **JWT** - Authentication token
- **Bcryptjs 3.0** - Password hashing
- **Multer 2.0** - File upload middleware
- **Cloudinary** - Image storage and CDN
- **Nodemailer 8.0** - Email service
- **Axios 1.13** - HTTP requests
- **Morgan 1.10** - HTTP logging
- **CORS 2.8** - Cross-origin resource sharing
- **Dotenv 17.3** - Environment variables
- **Google GenAI 1.42** - AI model integration
-**Strip** - Payment Gateway

### Admin Dashboard
- **React 19.2** - UI framework
- **Vite 8.0** - Build tool
- **TailwindCSS 3.4** - Styling
- **React Router 7.13** - Navigation
- **Recharts 3.8** - Data visualization & charts
- **Lucide React 1.7** - Icons
- **Axios 1.13** - API communication

### Development Tools
- **Nodemon** - Auto-restart server
- **ESLint** - Code linting
- **Git** - Version control
- **Postman** (optional) - API testing

---

## 📁 Project Structure

```
projects/
├── fashion_store/                 # Customer-facing frontend
│   ├── src/
│   │   ├── pages/                 # Page components
│   │   ├── components/            # Reusable components
│   │   ├── context/               # React Context (Auth, Cart)
│   │   ├── api/                   # API client configuration
│   │   ├── assets/                # Images, icons, static files
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Global styles
│   ├── public/                    # Static files
│   ├── package.json
│   ├── vite.config.js            # Vite configuration
│   └── tailwind.config.js        # TailwindCSS config
│
├── fashion_store_backend/         # Backend API server
│   ├── config/                    # Database and external service configs
│   │   ├── db.js                 # MongoDB connection
│   │   └── cloudinary.js         # Image storage config
│   ├── models/                    # MongoDB schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   ├── Profile.js
│   │   ├── TryOnHistory.js
│   │   └── visitModel.js
│   ├── controllers/               # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── cartController.js
│   │   ├── profileController.js
│   │   ├── aiController.js
|   |   ├── paymentController.js
│   │   ├── adminPanelController.js
│   │   └── qrUploadController.js
│   ├── routes/                    # API endpoints
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── adminPanelRoutes.js
|   |   |── paymentRoutes.js   
│   │   └── qrUploadRoutes.js
│   ├── middleware/                # Express middleware
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── errorMiddleware.js    # Error handling
│   ├── services/                  # Utility services
│   │   ├── huggingfaceService.js
│   │   ├── recommendationService.js
│   │   └── sizeService.js
│   ├── utils/                     # Helper utilities
│       ├── seeder.js             # Sample data generation
│       ├── orderSeeder.js        # Order sample data
│       └── createAdmin.js        # Admin user creation
|
|
│── admin-frontend/            # Admin dashboard (React)
│   │   ├── src/
│   │   │   ├── ui/               # Admin UI components
│   │   │   │   ├── pages/        # Admin pages
│   │   │   │   │   ├── DashboardPage.jsx
│   │   │   │   │   ├── ProductsPage.jsx
│   │   │   │   │   ├── ProductCreatePage.jsx
│   │   │   │   │   ├── ProductEditPage.jsx
│   │   │   │   │   ├── CategoriesPage.jsx
│   │   │   │   │   ├── OrdersPage.jsx
│   │   │   │   │   ├── EmailsPage.jsx
│   │   │   │   │   └── LoginPage.jsx
│   │   │   │   ├── components/   # UI components (dark gold theme)
│   │   │   │   │   ├── Button.jsx
│   │   │   │   │   ├── Card.jsx
│   │   │   │   │   ├── Input.jsx
│   │   │   │   │   └── Label.jsx
│   │   │   │   └── layout/       # Layout components
│   │   │   │       └── AdminLayout.jsx
│   │   │   ├── lib/              # Utilities
│   │   │   │   └── api.js        # API client setup
│   │   │   ├── state/            # State management
│   │   │   │   └── auth.jsx      # Auth context
│   │   │   └── App.jsx           # Main admin app
│   │   ├── index.html            # HTML entry point
│   │   ├── package.json
│   │   └── vite.config.js        # Admin Vite config
│   ├── .env                       # Environment variables
│   ├── package.json
│   ├── server.js                  # Express server entry
│   └── README.md                  # Backend README   
|
└── README.md                      # This file
```

---

## ✨ Features

### Customer Features
#### User Authentication
- User registration and login
- JWT token-based authentication
- User profile management
- Password hashing with bcryptjs

#### Product Browsing
- Browse products by category
- Gender-based filtering (Men, Women, Children)
- Product search functionality
- Product detail page with images and reviews
- Product ratings and reviews system

#### Shopping Experience
- Shopping cart with add/remove items
- Cart persistence
- Order placement
- Multiple payment methods (COD, Online)

#### AI Features
- **Virtual Try-On**: Upload photo and see how clothes look on you
- **Size Recommendations**: Get personalized size suggestions based on past orders
- **Skin Tone Recommendations**: AI-based color recommendations
- **Try-On Gallery**: View history of virtual try-ons

#### User Profile
- Edit profile information
- View order history
- View try-on history
- Mobile image upload for try-on

### Admin Features
#### Dashboard Analytics
- **Revenue Chart**: Line chart showing revenue over last 30 days
- **Order Chart**: Order count visualization
- **Best-Selling Products**: Top 5 products by units sold with revenue
- **Key Metrics**: Total products, categories, and orders

#### Product Management
- Create new products with images
- Edit product details (name, price, category, etc.)
- Upload multiple product images (Cloudinary)
- Set product visibility (Active/Inactive)
- Featured products marking
- Manage product sizes and stock

#### Category Management
- Create, edit, delete categories
- Organize products by category
- Manage gender-specific categories

#### Order Management
- View all orders with pagination
- Filter orders by status and payment
- Update order status
- Send email notifications to customers
- View detailed order information

#### Email Management
- Send custom emails to customers
- Send promotional emails to user groups
- Email templates with order details

#### User Management
- View all users
- Filter users by registration date
- Manage user roles

---

## 🚀 Installation & Setup


### Step 1: Clone or Extract Project

```bash
cd projects
```

### Step 2: Setup Backend

```bash
cd fashion_store_backend

# Install dependencies
npm install

# Create .env file (see Environment Variables section)
cp .env.example .env  # or create manually

# Seed initial data
npm run seed
npm run create-admin  # Create admin user

# Start backend server
npm run dev  # Development mode (with nodemon)
# or
npm start    # Production mode
```

### Step 3: Setup Frontend (Customer Store)

```bash
cd ../fashion_store

# Install dependencies
npm install

# Create .env file if needed
# The frontend uses the backend API from http://localhost:5000

# Start development server
npm run dev
# Opens: http://localhost:5173
```

### Step 4: Setup Admin Dashboard

```bash
cd ../admin-frontend

# Install dependencies
npm install

# Start admin development server
npm run dev
# Opens: http://localhost:5174
```

---

## 🔐 Environment Variables

Create a `.env` file in `fashion_store_backend/` with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_monogodb_uri

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE_IN=7d

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=noreply@fashionai.com

# Google GenAI (for AI features)
GOOGLE_GENAI_API_KEY=your_google_genai_api_key

# Hugging Face (optional, for alternative AI)
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Gradio (optional, for ML models)
GRADIO_API_URL=your_gradio_url
```

**Important Notes:**
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password
- Keep `.env` file secure and never commit it to version control
- Update with your actual credentials from service providers

---

## ▶️ Running the Application

### Development Mode (All Services)

**Terminal 1 - Backend Server (Port 5000)**
```bash
cd fashion_store_backend
npm run dev
```

**Terminal 2 - Customer Frontend (Port 5173)**
```bash
cd fashion_store
npm run dev
```

**Terminal 3 - Admin Dashboard (Port 5174)**
```bash
cd fashion_store_backend/admin-frontend
npm run dev
```

### Production Build

```bash
# Backend (no build needed, use Node directly)
npm start

# Customer Frontend
npm run build
npm run preview

# Admin Dashboard
npm run build
npm run preview
```

---

Users can upload photos on mobile and create a gallery of virtual try-ons.

**Features:**
- Upload multiple photos
- Share try-on results
- Compare different sizes/colors
- Save favorites

---

## 📂 Folder Structure Details

### Backend Controllers
Each controller handles specific domain logic:

- **authController.js**: User registration, login, password reset
- **productController.js**: Product CRUD operations, search, filters
- **categoryController.js**: Category management
- **orderController.js**: Order placement, updates, tracking
- **cartController.js**: Shopping cart operations
- **profileController.js**: User profile management
- **adminPanelController.js**: Admin dashboard, analytics, email, user management
- **aiController.js**: AI features (try-on, recommendations)
- **qrUploadController.js**: QR code and image upload handling

### Backend Routes
Routes define API endpoints:

- **authRoutes.js**: `/api/auth/*`
- **productRoutes.js**: `/api/products/*`
- **categoryRoutes.js**: `/api/categories/*`
- **orderRoutes.js**: `/api/orders/*`
- **adminPanelRoutes.js**: `/api/admin/*` (protected)
- **aiRoutes.js**: `/api/ai/*` (AI features)

### Frontend Pages
Customer-facing pages:

- **Home.jsx**: Landing page with featured products
- **CategoryPage.jsx**: Products filtered by category
- **ProductDetail.jsx**: Detailed product view with try-on
- **Cart.jsx**: Shopping cart
- **Checkout.jsx**: Payment and shipping address
- **Orders.jsx**: Order history
- **Login.jsx / Register.jsx**: Authentication
- **Profile.jsx**: User profile management
- **MobileUpload.jsx**: Mobile image upload for try-on
- **SkinToneRecommendations.jsx**: Color recommendations
- **TryOnGallery.jsx**: History of try-ons

### Frontend Components

**Layout Components:**
- Navbar: Navigation bar with cart icon
- Footer: Footer with links

**Product Components:**
- ProductCard.jsx: Product card in grid
- ProductDetail.jsx: Full product page
- MatchingItems.jsx: Similar products
- SizeRecommendation.jsx: Size suggestion box

**Common Components:**
- LoadingSpinner.jsx: Loading indicator

---

## 📊 Database Indexes

For optimal performance, the following indexes are created:

```javascript
// Product indexes
productSchema.index({ gender: 1, subcategory: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Category indexes
categorySchema.index({ slug: 1 });

// Order indexes
orderSchema.index({ user: 1, createdAt: -1 });

// Default indexes
// _id (MongoDB automatic)
// timestamps (createdAt, updatedAt)
```

---

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds 12
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured CORS for cross-origin requests
- **Input Validation**: Express validator for request validation
- **Error Handling**: Centralized error middleware
- **Protected Routes**: Admin routes require admin role
- **Environment Variables**: Sensitive data in .env file

---

## 📈 Scalability Considerations

- **Database Indexing**: Optimized queries for large datasets
- **Pagination**: All list endpoints support pagination
- **Image CDN**: Cloudinary for image delivery and optimization
- **Stateless API**: Backend is stateless for horizontal scaling
- **Caching**: Implement Redis for frequently accessed data (future)
- **Database Replication**: MongoDB Atlas handles replication

---

## 🧪 Testing

### Manual Testing Endpoints
Use Postman or curl to test API:

```bash
# Health check
curl http://localhost:5000/api/health

# Get products
curl http://localhost:5000/api/products?page=1&limit=12

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Port 5000 (Backend)
lsof -i :5000
kill -9 <PID>

# Port 5173 (Frontend)
lsof -i :5173
kill -9 <PID>

# Port 5174 (Admin)
lsof -i :5174
kill -9 <PID>
```

### MongoDB Connection Issues
- Check MongoDB URI in .env
- Ensure IP is whitelisted in MongoDB Atlas
- Verify username and password

### Image Upload Not Working
- Check Cloudinary credentials
- Verify API key and secret
- Check file size limits (set to 10MB)

### Email Not Sending
- Verify SMTP credentials
- For Gmail, use App Password
- Check email service configuration
- Verify sender email is authorized

---

## 📞 Support & Contact

For issues or questions:
1. Check the API documentation above
2. Review error logs in terminal
3. Verify all environment variables are set correctly
4. Ensure all services are running

---

## 📜 License

This project is licensed under ISC License.

---

## 🚀 Future Enhancements

- [ ] Payment gateway integration (Stripe, Razorpay)
- [ ] Real-time notifications with WebSockets
- [ ] Advanced filtering and faceted search
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Social login (Google, Facebook)
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard improvements
- [ ] Inventory management system
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Performance optimization (caching, CDN)

---

## 📝 Version History

### v1.0.0 (Current)
- Initial release
- Core e-commerce functionality
- AI try-on and recommendations
- Admin dashboard with analytics
- Customer authentication
- Order management
- Email notifications

---

**Last Updated**: March 30, 2026

---

Made with ❤️ for fashion enthusiasts and AI technology lovers.
