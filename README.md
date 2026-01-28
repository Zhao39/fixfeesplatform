# FixFeesPlatform

<div align="center">

**A comprehensive multi-tenant SaaS platform for merchant payment processing fee management**

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.17.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-4.9.5-blue.svg)](https://www.typescriptlang.org/)

[Live Partner Portal](https://partners.fixmyfees.com/) • [Live Merchant Portal](https://merchants.fixmyfees.com/)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Company Information](#company-information)
- [Platform Overview](#platform-overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Security](#security)
- [Improvement Suggestions](#improvement-suggestions)
- [Contributing](#contributing)
- [License](#license)

---

## 🏢 About

**Fix My Fees LLC** is a payment processing company focused on providing transparent, low-cost merchant processing services. The platform helps businesses reduce their payment processing fees through comprehensive statement audits and integration with wholesale-rate processors.

### Key Value Propositions

- **Transparent Pricing**: No "bait and switch" pricing - rates are guaranteed for the lifetime of your account
- **Wholesale Rates**: Interchange Plus pricing model with no long-term contracts
- **Proven Track Record**: Over 10,000 businesses onboarded
- **Month-to-Month Agreements**: Flexible merchant agreements with no long-term commitments
- **PCI Compliance Support**: $250,000 breach protection included

---

## 🏛️ Company Information

- **Company Name**: Fix My Fees LLC
- **Partner Portal**: [https://partners.fixmyfees.com/](https://partners.fixmyfees.com/)
- **Merchant Portal**: [https://merchants.fixmyfees.com/](https://merchants.fixmyfees.com/)

---

## 🎯 Platform Overview

FixFeesPlatform is a multi-tenant SaaS platform consisting of three main applications:

1. **Partner Portal** (`partner/`) - Affiliate/referral management system for brand partners
2. **Merchant Portal** (`business/`) - Merchant onboarding and management system
3. **Backend API** (`backend/`) - RESTful API and real-time services

### How It Works

1. **Submit & Save**: Merchants submit their application and 3 months of merchant statements
2. **Comprehensive Audit**: System analyzes statements to identify potential savings
3. **Savings Call**: Account representatives present analysis and answer questions
4. **Integration**: Seamless transition to FixFeesPlatform processors (24-48 hours)
5. **Ongoing Management**: Fixed fees with no rate increases

---

## 🏗️ Architecture

### Backend Architecture

```
┌─────────────────────────────────────────┐
│         Express.js Server               │
│  (HTTP/HTTPS with Socket.IO)            │
├─────────────────────────────────────────┤
│  Controllers → Services → Database      │
│  (MVC Pattern)                          │
├─────────────────────────────────────────┤
│  • RESTful API Endpoints                │
│  • Real-time Socket.IO Events          │
│  • Background Cron Jobs                  │
│  • File Upload (AWS S3)                 │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         MySQL Database                   │
│  (Connection Pooling)                   │
└─────────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────┐
│      React 18 Applications               │
│  (Material-UI + Redux Toolkit)          │
├─────────────────────────────────────────┤
│  • Component-Based Architecture         │
│  • State Management (Redux)             │
│  • Real-time Updates (Socket.IO)        │
│  • Form Validation (Formik + Yup)       │
└─────────────────────────────────────────┘
```

---

## ✨ Features

### 🔐 Authentication & Security

- JWT-based authentication
- Two-factor authentication (2FA)
- Email verification system
- Password reset functionality
- KYC document verification
- PCI compliance support
- Token expiration (15 minutes)

### 👥 User Management

- **Partner Users**: Affiliate/referral partners with commission tracking
- **Merchant Users**: Business owners managing their payment processing
- **Admin Users**: Platform administrators
- **Business Admins**: Business-specific administrators

### 💰 Financial Features

- **Transaction Management**: Complete transaction history and reporting
- **Payment Processing**: NMI (Network Merchants Inc.) integration
- **Membership Subscriptions**: 
  - Monthly: $19.97/month
  - Yearly: $200/year
- **License Management**: Trial licenses ($1 for 7 days)
- **Coupon System**: Discount codes and promotional offers
- **Invoice Generation**: Automated invoice creation and download
- **Withdrawal Management**: Minimum $20 withdrawal requests

### 🤝 Partner/Affiliate System

- **Referral Tracking**: Track merchant and partner referrals
- **Commission Management**: 
  - Referral fees (10% default)
  - Reward funds
  - Residual income tracking
- **Rank System**: Silver, Gold, Platinum tiers
- **Tier System**: Tier 1-4 classification
- **Performance Dashboards**: Real-time analytics and reporting
- **Lead Management**: 
  - Merchant prospects
  - Partner prospects
  - Daily limit: 1000 prospects
- **Wallet System**: Track earnings and request withdrawals

### 🏪 Merchant Management

- **Onboarding Workflow**: 
  - Prospects → Onboarding → Underwriting → Install → Active → Closed
- **Residual Reports**: Detailed merchant residual profit analysis
- **Document Management**: Upload and manage business documents
- **Processor Integration**: Multiple processor support
- **Statement Analysis**: Automated fee analysis

### 💬 Communication & Support

- **Ticket System**: Real-time support tickets with Socket.IO
- **Email Notifications**: Automated email queue system
- **In-App Notifications**: Real-time notification system
- **Training Videos**: Educational content management
- **Announcements**: Platform-wide announcements

### 📅 Additional Features

- **Google Calendar Integration**: OAuth2 calendar sync
- **Funnel Types Management**: Customizable funnel configurations
- **Prospect Management**: Lead tracking and management
- **Residual Data Processing**: Automated residual calculations
- **Rewards Plan Automation**: Automated reward distribution
- **Email Queue System**: Reliable email delivery
- **Comprehensive Logging**: Winston-based logging system

---

## 🛠️ Technology Stack

### Backend

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js 14.17.0+ |
| **Framework** | Express.js 4.18.2 |
| **Language** | TypeScript 4.9.5 |
| **Database** | MySQL 8.0+ (mysql2) |
| **Real-time** | Socket.IO 4.7.2 |
| **Authentication** | JWT (jsonwebtoken) |
| **File Storage** | AWS S3 (aws-sdk) |
| **Email** | Nodemailer 6.9.1 |
| **Payment** | NMI (Network Merchants Inc.) |
| **PDF Generation** | PDFKit, pdf-lib |
| **Logging** | Winston 3.8.2 |
| **Scheduling** | Cron 2.2.0 |
| **Calendar** | Google APIs (googleapis) |

### Frontend

| Category | Technology |
|----------|-----------|
| **Framework** | React 18.2.0 |
| **UI Library** | Material-UI (MUI) 5.10.9 |
| **State Management** | Redux Toolkit 1.8.6 |
| **Routing** | React Router 6.4.2 |
| **Forms** | Formik 2.2.9 + Yup 0.32.11 |
| **HTTP Client** | Axios 1.1.2 |
| **Real-time** | Socket.IO Client 4.7.2 |
| **Charts** | ApexCharts 3.36.0 |
| **Calendar** | FullCalendar 5.11.3 |
| **Editor** | React Quill 2.0.0 |
| **Build Tool** | Create React App (react-scripts) |

### DevOps & Infrastructure

- **Containerization**: Docker + Docker Compose
- **Process Management**: PM2 (cluster mode)
- **Version Control**: Git
- **Cloud Storage**: AWS S3
- **SSL/HTTPS**: Certificate-based encryption

---

## 📁 Project Structure

```
fixfeesplatform/
├── backend/                    # Node.js/Express Backend API
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   │   ├── admin/         # Admin controllers
│   │   │   ├── business/      # Business controllers
│   │   │   ├── user/          # User controllers
│   │   │   └── webhook/       # Webhook handlers
│   │   ├── services/          # Business logic layer
│   │   ├── routes/            # API route definitions
│   │   ├── database/          # Database connection & queries
│   │   ├── socket/            # Socket.IO real-time handlers
│   │   ├── cronjob/           # Scheduled tasks
│   │   ├── library/           # Third-party integrations
│   │   ├── helpers/           # Utility functions
│   │   ├── var/               # Configuration & constants
│   │   └── views/             # Pug templates
│   ├── assets/                # Static assets
│   ├── Dockerfile             # Docker configuration
│   ├── docker-compose.yaml    # Docker Compose setup
│   └── package.json
│
├── business/                   # React Merchant Portal
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── layout/            # Layout components
│   │   ├── sections/          # Page sections
│   │   ├── store/             # Redux store
│   │   ├── services/          # API services
│   │   ├── routes/            # Route definitions
│   │   └── config/            # Configuration
│   ├── public/                # Static files
│   └── package.json
│
├── partner/                    # React Partner Portal
│   ├── src/                   # (Similar structure to business/)
│   └── package.json
│
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 14.17.0 or higher
- **MySQL**: 8.0 or higher
- **npm** or **yarn**: Package manager
- **AWS Account**: For S3 file storage (optional for development)
- **Docker**: For containerized deployment (optional)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd fixfeesplatform
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

#### 3. Frontend Setup

**Business Portal:**
```bash
cd ../business
npm install
```

**Partner Portal:**
```bash
cd ../partner
npm install
```

### Development

#### Backend Development

```bash
cd backend
npm run dev          # Development mode with hot reload
npm run build        # Build TypeScript
npm run start        # Start production server
npm run debug        # Debug mode with inspector
```

#### Frontend Development

```bash
# Business Portal
cd business
npm start            # Start dev server (default: http://localhost:3000)

# Partner Portal
cd partner
npm start            # Start dev server (default: http://localhost:3000)
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory based on `env.demo`:

```env
# Server Configuration
PORT=8090
BASE_URL=http://localhost:8090
BASE_FRONT_URL=http://localhost:3000/
BASE_APP_URL=http://localhost:3000/
BASE_BUSINESS_URL=http://localhost:3001/
BASE_PARTNER_URL=http://localhost:3002/
BACKEND_LOCATION=localhost
ENVIRONMENT=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PWD=your_password
DB_NAME=fixfeesplatform_db
DB_PORT=3306
DB_CONNECTION_LIMIT=100

# Security
JWT_SECRET=your_jwt_secret_key
ENCRYPT_HASH_KEY=your_encryption_key

# Payment Processing (NMI)
NMI_IS_LIVE=false
NMI_TEST_SECRET_KEY=your_test_key
NMI_LIVE_SECRET_KEY=your_live_key
NMI_SIGN_KEY=your_sign_key

# Email Configuration
MAILER_TYPE=GMAIL
GMAIL_SMTP_USERNAME=your_email@gmail.com
GMAIL_SMTP_PASSWORD=your_app_password
SENDER_EMAIL=support@fixmyfees.com

# AWS S3 Configuration
AWS_REGION=us-west-2
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Google Calendar
GOOGLE_CLIENT_SECRET_JSON=path/to/credentials.json
GOOGLE_OAUTH_USER_REDIRECT_URL=http://localhost:3000/calendar/callback
GOOGLE_OAUTH_ADMIN_REDIRECT_URL=http://localhost:3000/admin/calendar/callback

# Feature Flags
EMAIL_FUNC=enabled
CRON_FUNC=enabled
SMS_FUNC=disabled
TICKET_IS_LIMITED=false
AUTO_EMAIL_VERIFICATION=enabled
```

### Frontend Configuration

Update API endpoints in frontend configuration files:
- `business/src/config/config.js`
- `partner/src/config/config.js`

---

## 📚 API Documentation

### Authentication Endpoints

```
POST   /login                          # User login
POST   /login-two-fact-auth           # 2FA verification
POST   /logout                         # User logout
POST   /send-forgot-password-email    # Password reset request
POST   /reset-password                 # Reset password
```

### User Endpoints

```
GET    /user/profile/get-page-detail           # Get user profile
POST   /user/profile/update-detail             # Update profile
POST   /user/profile/update-password          # Change password
GET    /user/dashboard/get-page-detail         # Dashboard data
GET    /user/wallet/get-page-detail           # Wallet information
POST   /user/wallet/request-withdrawal        # Request withdrawal
```

### Partner Endpoints

```
GET    /user/lead/get-merchant-data-list       # Merchant leads
GET    /user/lead/get-partner-data-list       # Partner leads
POST   /user/lead/add-merchant-prospects       # Add merchant prospect
GET    /user/rank-stats/get-page-detail       # Rank statistics
GET    /user/residuals/get-page-detail        # Residual reports
```

### Business Endpoints

```
POST   /business/register                     # Business registration
POST   /business/login                        # Business login
GET    /business/get-business-detail          # Business information
GET    /business/dashboard/get-page-detail   # Business dashboard
```

### Admin Endpoints

```
GET    /admin/users/get-data-list             # User management
PUT    /admin/user/:id                        # Update user
POST   /admin/user/update-status              # Update user status
GET    /admin/ticket/get-data-list            # Ticket management
GET    /admin/transaction/get-data-list       # Transaction management
```

### Webhook Endpoints

```
POST   /webhook/nmi/hook-received             # NMI payment webhook
```

---

## 🐳 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
cd backend
docker-compose up -d

# Or build individual containers
docker build -t fixfeesplatform/fixfeesplatform-backend .
docker run -p 8090:8090 fixfeesplatform-backend
```

### PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Start backend in cluster mode
cd backend
pm2 start dist/index.js -i max --name fixfeesplatform-backend

# Or use provided script
./run_cluster_mode.sh
```

### Production Build

```bash
# Backend
cd backend
npm run build
npm run start

# Frontend - Business Portal
cd business
npm run build
# Serve dist/ folder with nginx or similar

# Frontend - Partner Portal
cd partner
npm run build
# Serve dist/ folder with nginx or similar
```

---

## 🔒 Security

### Security Features

- ✅ JWT token-based authentication
- ✅ Two-factor authentication (2FA)
- ✅ Password encryption (crypto-js)
- ✅ HTTPS/SSL support
- ✅ CORS configuration
- ✅ SQL injection prevention (parameterized queries)
- ✅ Token expiration (15 minutes)
- ✅ Email verification
- ✅ KYC document verification

### Security Best Practices

⚠️ **Important**: Before deploying to production:

1. Change all default secrets in `backend/src/var/config.ts`
2. Use environment variables for sensitive data
3. Enable HTTPS in production
4. Configure proper CORS origins
5. Set up rate limiting
6. Enable database connection encryption
7. Regularly update dependencies
8. Implement proper error handling (avoid exposing stack traces)

📋 **See [SUGGESTIONS.md](./SUGGESTIONS.md) for detailed security recommendations and improvement suggestions.**

---

## 💡 Improvement Suggestions

We've compiled a comprehensive list of improvement suggestions covering:

- 🔴 **Critical Security Issues** - Immediate fixes needed
- 🟡 **High Priority Improvements** - Important enhancements
- 🟢 **Medium Priority Improvements** - Quality of life improvements
- 🔵 **Low Priority / Nice to Have** - Future considerations

**📋 See [SUGGESTIONS.md](./SUGGESTIONS.md) for detailed recommendations, code examples, and implementation guides.**

### Quick Summary

**Critical Issues to Address Immediately:**
1. ⚠️ Hardcoded secrets in `backend/src/var/config.ts` - Move to environment variables
2. ⚠️ Exposed credentials in `backend/env.demo` - Rotate all credentials immediately
3. ⚠️ CORS configuration too permissive - Restrict to specific origins
4. ⚠️ No rate limiting - Vulnerable to DDoS and brute force attacks

**High Priority Improvements:**
- Implement proper error handling middleware
- Add input validation to all endpoints
- Upgrade password hashing (use bcrypt instead of crypto-js)
- Add database SSL/TLS encryption
- Implement rate limiting

**Medium Priority:**
- Add comprehensive test suite
- Implement API documentation (Swagger/OpenAPI)
- Add monitoring and observability
- Performance optimizations

---

## 🤝 Contributing

### Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Write/update tests if applicable
4. Ensure code follows project style guidelines
5. Submit a pull request

### Code Style

- **Backend**: TypeScript with TSLint
- **Frontend**: ESLint + Prettier
- Use meaningful commit messages
- Follow existing code patterns

---

## 📄 License

This project is proprietary software owned by **Fix My Fees LLC**. All rights reserved.

---

## 📞 Support

For support and inquiries:

- **Website**: [https://partners.fixmyfees.com/](https://partners.fixmyfees.com/)
- **Merchant Portal**: [https://merchants.fixmyfees.com/](https://merchants.fixmyfees.com/)
- **Email**: support@fixmyfees.com

---

## 📊 Platform Statistics

- **Merchants Onboarded**: 10,000+
- **Processing Model**: Interchange Plus Pricing
- **Contract Terms**: Month-to-month (no long-term contracts)
- **Rate Guarantee**: Lifetime rate guarantee
- **PCI Compliance**: Included with $250,000 breach protection

---

## 🎯 Roadmap

- [ ] Enhanced analytics and reporting
- [ ] Mobile applications (iOS/Android)
- [ ] Additional payment processor integrations
- [ ] Advanced fraud detection
- [ ] Multi-language support
- [ ] API rate limiting improvements
- [ ] Enhanced testing coverage

---

<div align="center">

**Built with ❤️ by Fix My Fees LLC**

© 2024 Fix My Fees LLC. All rights reserved.

</div>
