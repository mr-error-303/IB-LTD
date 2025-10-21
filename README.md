# International Bank Limited (IB LTD) - Customer Portal

A modern, secure banking application built with React and deployed on Netlify.

## 🚀 Features

- **User Dashboard**: Complete banking dashboard with account overview
- **Admin Panel**: Comprehensive admin interface for user and loan management
- **Security**: Enhanced security headers and CORS configuration
- **Performance**: Optimized build process and caching strategies
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router DOM

### Backend (Netlify Functions)
- **API**: Serverless functions with Express.js
- **Security**: Helmet, CORS, Rate limiting
- **Authentication**: JWT-based authentication
- **Admin API**: Separate admin endpoints

## 📦 Project Structure

```
IB LTD/
├── customer-portal/          # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── build/               # Production build
├── netlify/
│   └── functions/           # Serverless functions
│       ├── api.js           # Main API endpoints
│       └── admin-api.js     # Admin API endpoints
├── netlify.toml             # Netlify configuration
└── README.md
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "IB LTD"
```

2. Install frontend dependencies:
```bash
cd customer-portal
npm install
```

3. Install function dependencies:
```bash
npm install
```

### Running Locally

1. Start the development server:
```bash
cd customer-portal
npm start
```

2. The application will be available at `http://localhost:3000`

### Building for Production

```bash
cd customer-portal
npm run build
```

## 🚀 Deployment

### Netlify Configuration

The application is configured for deployment on Netlify with:

- **Build Command**: `cd customer-portal && npm ci && npm run build`
- **Publish Directory**: `customer-portal/build`
- **Functions Directory**: `netlify/functions`

### Environment Variables

Set the following environment variables in Netlify:

```
REACT_APP_API_URL=https://your-site.netlify.app/api
GENERATE_SOURCEMAP=false
NODE_VERSION=18
NPM_VERSION=9
```

### Security Features

- **CSP Headers**: Content Security Policy for XSS protection
- **HSTS**: HTTP Strict Transport Security
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Properly configured cross-origin requests

## 📊 API Endpoints

### Main API (`/api/*`)
- `GET /health` - Health check
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /profile` - User profile

### Admin API (`/admin-api/*`)
- `POST /admin/auth/login` - Admin authentication
- `GET /admin/dashboard/stats` - Dashboard statistics
- `GET /admin/users` - User management
- `GET /admin/loans` - Loan management
- `GET /admin/loans/reports` - Loan reports

## 🔐 Authentication

### User Authentication
- Email and password based
- JWT tokens for session management

### Admin Authentication
- Email, password, and admin key required
- Enhanced permissions system

## 🎨 UI Components

### Dashboard Services
- Loan Services
- Add Money
- Fund Transfer
- Mobile Top Up
- Buy Ticket
- Cash Withdraw
- Bill Payment
- Receive Remittance
- More Services
- Bank A/C
- Cards
- Open A/C
- Statement
- Quick Pay
- Location
- Insurance

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Performance Optimizations

- **Code Splitting**: Automatic code splitting with React.lazy
- **Image Optimization**: Compressed images and lazy loading
- **Caching**: Aggressive caching for static assets
- **Minification**: CSS and JS minification
- **Bundle Analysis**: Optimized bundle sizes

## 🛡️ Security Best Practices

- **Input Validation**: All inputs are validated
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: CSRF tokens
- **Rate Limiting**: API rate limiting
- **Secure Headers**: Security headers implementation

## 📈 Monitoring

- **Error Logging**: Comprehensive error logging
- **Performance Monitoring**: Build-time performance metrics
- **Security Monitoring**: Security header validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please contact the development team.

---

**Version**: 13.0.0  
**Last Updated**: January 2024  
**Platform**: Netlify Functions