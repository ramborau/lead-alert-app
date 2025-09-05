# Lead Alert App 🚀

A modern, real-time lead capture application that automatically captures Facebook leads with instant notifications and comprehensive management features. Built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui components.

![Lead Alert App](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- **🔐 Secure Authentication** - User registration and login with NextAuth.js
- **📱 Facebook Integration** - Seamless OAuth connection to Facebook pages
- **⚡ Real-time Lead Capture** - Automatic webhook-based lead collection
- **📊 Beautiful Dashboard** - Analytics and statistics with interactive charts
- **📋 Lead Management** - Comprehensive lead tracking and status management
- **🔔 Smart Notifications** - In-app, email, and browser notifications
- **🎨 Modern UI** - Built with shadcn/ui components and Tailwind CSS
- **📱 Responsive Design** - Works perfectly on all devices
- **🌙 Dark Mode Support** - Toggle between light and dark themes

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible React components
- **Recharts** - Interactive charts and analytics
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Zustand** - State management
- **Lucide React** - Beautiful icons

### Backend
- **NextAuth.js** - Authentication for Next.js
- **Prisma** - Type-safe database ORM
- **SQLite** - Local database (can be switched to PostgreSQL)
- **Facebook Graph API v18.0** - Facebook integration
- **Webhooks** - Real-time lead capture

## 🛠️ Installation

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm, yarn, or pnpm
- Facebook Developer Account

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-secret-key-here"

# Facebook App (from Facebook Developers Console)
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
FACEBOOK_REDIRECT_URI="http://localhost:3000/api/auth/facebook/callback"
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

### 4. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Facebook App Setup

### 1. Create Facebook App
1. Go to [Facebook Developers Console](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. Configure OAuth redirect URLs

### 2. Configure OAuth Settings
**Valid OAuth Redirect URIs:**
```
http://localhost:3000/api/auth/facebook/callback
https://yourdomain.com/api/auth/facebook/callback
```

### 3. Required Permissions
- `public_profile`
- `email`
- `pages_manage_metadata`

### 4. Webhook Configuration
The app automatically registers webhooks programmatically. No manual Facebook App configuration needed!

## 🎯 Usage

### 1. Create Account
- Visit the application
- Click "Get Started"
- Fill in your registration details

### 2. Connect Facebook
- Go to Settings page
- Click "Connect Facebook"
- Authorize the application
- Select your Facebook pages

### 3. Start Capturing Leads
- Leads will automatically appear in your dashboard
- Receive real-time notifications
- Manage lead status and add notes

## 📁 Project Structure

```
lead-alert-app/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API routes
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── auth/                # Authentication components
│   ├── dashboard/           # Dashboard components
│   └── leads/               # Lead management components
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── db.ts                # Database connection
│   └── facebook.ts          # Facebook API utilities
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
└── types/                   # TypeScript type definitions
```

## 🔒 Security Features

- **JWT-based authentication** with secure session management
- **Webhook signature verification** for Facebook requests
- **Input validation** with Zod schemas
- **CSRF protection** via NextAuth
- **SQL injection prevention** with Prisma ORM

## 📊 Key Features

### Dashboard
- Real-time lead statistics
- Interactive charts with Recharts
- Recent leads overview
- Facebook page status

### Lead Management
- Comprehensive lead table
- Advanced filtering and search
- Status management (new, contacted, qualified, converted)
- Export functionality

### Settings
- Facebook account connection
- Notification preferences
- Webhook configuration
- Account management

## 🚀 Deployment

Deploy on Vercel (recommended):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables
4. Deploy!

The app is also compatible with Netlify, Railway, and other platforms.

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ using Next.js 14 and shadcn/ui**
