# Portfolio Website - Next.js Fullstack

A modern, professional portfolio website built with **Next.js 15**, **TypeScript**, **MongoDB**, and **Tailwind CSS**. Features a comprehensive admin panel for real-time content management with secure authentication and beautiful animations.

> **✨ Migration Complete:** Successfully migrated from vanilla JavaScript/Express.js to Next.js fullstack architecture with improved performance, SEO, and developer experience. Now integrated with existing portfolio data structure.

## 📸 **Live Demo**

🌐 **Running at:** [http://localhost:3002](http://localhost:3002)  
🔐 **Admin Login:** `admin` / `admin123`  
👤 **Current Portfolio:** Tanakit Phentun (tumrabert)

## 🌟 Key Features

### 🎨 **Frontend Excellence**
- **Next.js 15** with App Router and Server Components
- **TypeScript** for type safety and better DX
- **Tailwind CSS** with custom animations and responsive design
- **Sticky horizontal navigation** with dynamic background and smooth scrolling
- **Mobile-first responsive design** with hamburger menu and full-width layout
- **Custom animations** including fade-ins, backdrop blur, and micro-interactions

### 🔒 **Secure Admin System**
- **JWT Authentication** with configurable token expiry (1hr default)
- **Floating login modal** with backdrop blur effect (as requested)
- **Secure password hashing** with bcrypt
- **Admin credentials** configurable via environment variables
- **Auto-logout** on token expiration
- **Session persistence** with "Remember Me" option

### 📝 **Content Management**
- **Real-time inline editing** for all portfolio sections
- **CRUD operations** for experiences, education, skills, and projects
- **Rich content editing** with forms and validation
- **Featured projects** system with filtering
- **Skills proficiency levels** with visual progress bars
- **Timeline-based** experience and education display
- **Advanced avatar management** with real-time positioning and cropping
- **Website screenshot generation** for project previews using thumbnail.ws API
- **Drag-and-drop project reordering** for custom portfolio layout

### 🧭 **Modern Navigation System**
- **Sticky horizontal navbar** that stays at top during scrolling
- **Dynamic background** - transparent initially, solid with blur when scrolled
- **Active section highlighting** with smooth visual feedback
- **Mobile-responsive hamburger menu** with slide-down navigation
- **Social media integration** with direct links to GitHub, LinkedIn, and email
- **Smooth scrolling** to sections with offset for sticky navbar
- **Full-width layout** optimized for modern screen sizes

### 🏗️ **Portfolio Sections**
- **Hero Section**: Dynamic introduction with customizable avatar positioning and quick facts
- **About Me**: Professional summary with contact information and interests
- **Work Experience**: Timeline view with technologies and achievements
- **Education**: Academic background with honors and achievements
- **Skills & Technologies**: Categorized skills with proficiency levels and custom tech logos
- **Featured Projects**: Advanced project showcase with website screenshot previews, live demos, and GitHub links
- **Responsive Footer**: Clean footer without fallback logos, social links and contact information

### ✨ **Advanced Features (Latest Updates)**
- **🖼️ Website Screenshot Generation**: Automated thumbnail creation for projects using thumbnail.ws API with fallback services
- **👤 Advanced Avatar System**: Real-time avatar positioning with circular preview, drag-and-drop positioning, and zoom controls  
- **🎯 Smart Image Handling**: Separate upload modes for direct images vs website screenshots with intelligent URL detection
- **📱 Enhanced Mobile UX**: Improved textarea handling with proper newline support and mobile-optimized controls
- **🔧 Clean UI Design**: Removed fallback `</>` logos from navbar, skills, and footer for cleaner appearance
- **🔗 Smart URL Processing**: Automatic protocol handling for GitHub links and external URLs to prevent localhost redirects
- **⚡ Real-time Preview**: Instant visual feedback for avatar positioning without requiring save operations

### 🚀 **Performance & Deployment**
- **MongoDB integration** with Mongoose ODM
- **Docker containerization** with docker-compose
- **Production-ready** build configuration
- **SEO optimized** with proper meta tags
- **Font optimization** with Inter font family
- **Environment-based API keys** for external services integration

## 🚀 Quick Start

### 🐳 **Option A: Docker Development (Recommended - with Hot Reload!)**

```bash
# Clone the repository
git clone https://github.com/tumrabert/ProfilePage.git
cd ProfilePage

# Option 1: Quick start with script
./start-dev.sh

# Option 2: Manual start
npm run dev:docker

# Option 3: Direct Docker command
docker-compose -f docker-compose.dev.yml up --build -d
```

**✨ Features:**
- 🔥 **Hot reloading** - Code changes appear instantly!
- 🐳 **Full Docker setup** with MongoDB
- 🎯 **Development optimized** with turbo mode

**🎉 That's it!** Visit [http://localhost:3002](http://localhost:3002)

**Default Admin Credentials:** `admin` / `admin123`

### 🏗️ **Option B: Docker Production (No Hot Reload)**

```bash
# Production mode (builds and runs optimized version)
docker-compose up -d

# View logs
docker-compose logs -f portfolio-app
```

### 💻 **Development Setup (Local)**

#### Prerequisites
- Node.js 18+
- MongoDB (local installation)
- npm or yarn

#### Steps

1. **Install Dependencies**
   ```bash
   git clone <repository-url>
   cd portfolio-nextjs
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```
   
   Edit `.env` with your settings:
   ```env
   # 🔴 REQUIRED: Database Configuration
   MONGODB_URI=mongodb://localhost:27017/portfolio
   
   # 🔴 REQUIRED: JWT Authentication (CHANGE IN PRODUCTION!)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-REQUIRED
   JWT_EXPIRES_IN=1h
   
   # 🔴 REQUIRED: Admin Configuration
   DEFAULT_ADMIN_USERNAME=admin
   DEFAULT_ADMIN_PASSWORD=admin123
   DEFAULT_ADMIN_EMAIL=admin@portfolio.com
   
   # 🔴 REQUIRED: Next.js App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3002
   NEXT_PUBLIC_API_URL=http://localhost:3002/api
   
   # 🟡 OPTIONAL: GitHub Integration (pre-configured)
   GITHUB_USERNAME=tumrabert
   GITHUB_TOKEN=your-github-token-here
   
   # 🟡 OPTIONAL: Website Thumbnail Generation
   THUMBNAIL_API=your-thumbnail-ws-api-key-here
   ```
   
   > **💡 Tip:** The `.env.example` file includes detailed documentation with 🔴 REQUIRED and 🟡 OPTIONAL variables clearly marked.

3. **Start Database**
   ```bash
   # Start local MongoDB
   mongod
   
   # OR use Docker for MongoDB only
   docker run -d -p 27017:27017 --name portfolio-mongodb mongo:7.0
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Initialize Sample Data (Optional)**
   ```bash
   # Import sample data to MongoDB
   mongoimport --db portfolio --collection portfolios --file sample-data.json
   ```

**🌟 Visit [http://localhost:3002](http://localhost:3002) to see your portfolio!**

> **📝 Note:** If you're following this guide and the server starts on a different port (like 3002), use that URL instead. The application will show the correct URL in the terminal.

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Development (with hot reload)
docker-compose up -d

# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This starts:
- **MongoDB** with replica set and authentication
- **Next.js app** with health checks
- **Nginx** reverse proxy with SSL support
- **Redis** for caching (production)
- **Default admin credentials**: `admin` / `admin123`

### Manual Docker Build

```bash
# Build the image
docker build -t portfolio-nextjs .

# Run with environment variables
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/portfolio \
  -e JWT_SECRET=your-secret-key \
  portfolio-nextjs
```

## 🔐 Admin Panel Guide

### 🎯 **How to Access & Use Admin Features**

#### **Step 1: Login**
1. Click the **"Admin Login"** button in the top-right corner
2. Enter credentials (default: `admin` / `admin123`)
3. Optionally check "Remember me" for 7-day persistence
4. Click **"Login"** - you'll see the floating login modal with backdrop blur

#### **Step 2: Admin Controls**
After successful login, you'll see:
- ✅ **Green gear icon** in top-right (Admin Controls)
- ✅ **Edit buttons** appear on each portfolio section
- ✅ **Admin panel** with quick navigation

#### **Step 3: Content Management**

| Section | What You Can Edit |
|---------|-------------------|
| **🏠 Hero** | Name, title, description, quick facts, avatar with real-time positioning |
| **👤 About** | Professional summary, contact info, interests |
| **💼 Experience** | Add/edit/remove jobs, technologies, achievements |
| **🎓 Education** | Academic background, degrees, honors |
| **⚡ Skills** | Technologies with categories and proficiency (1-5) |
| **📁 Projects** | Add/edit projects, website screenshot generation, set featured status, links |

#### **Step 4: Real-time Editing**
- Click any **"Edit"** button (blue pencil icon) on sections
- Edit content in **inline forms** with validation
- Click **"Save"** - changes reflect immediately
- Click **"Cancel"** to discard changes
- All changes auto-save to MongoDB

#### **Step 5: Advanced Features**
- **Featured Projects**: Toggle projects to show in main showcase
- **Skills Categories**: Organize technologies (Frontend, Backend, etc.)
- **Proficiency Levels**: Visual progress bars for skills
- **Timeline View**: Chronological work experience display

#### **🔒 Security Features**
- JWT tokens with 1-hour expiry (configurable)
- Secure password hashing (bcrypt)
- Auto-logout on token expiration
- Environment-based credential configuration

## 🏗️ Project Structure

```
portfolio-nextjs/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── Admin/         # Admin components
│   │   ├── Layout/        # Layout components
│   │   └── Portfolio/     # Portfolio sections
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities
│   └── models/            # MongoDB models
├── public/                # Static files
├── docker-compose.yml     # Docker setup
├── Dockerfile            # Container config
├── mongo-init.js         # MongoDB initialization
└── .env.local           # Environment variables
```

## 🔧 API Architecture

### 📡 **REST API Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/login` | Admin authentication with JWT | ❌ |
| `POST` | `/api/auth/verify` | Verify JWT token validity | ✅ |
| `GET` | `/api/auth/default-credentials` | Get default login credentials | ❌ |
| `GET` | `/api/portfolio` | Fetch complete portfolio data | ❌ |
| `PUT` | `/api/portfolio` | Update portfolio content | ✅ |
| `POST` | `/api/fetch-website-image` | Generate website screenshot thumbnails | ❌ |

### 🔑 **Authentication Flow**
1. **Login**: POST to `/api/auth/login` with credentials
2. **Receive**: JWT token + user data
3. **Store**: Token in localStorage/sessionStorage
4. **Use**: Include `Authorization: Bearer <token>` in requests
5. **Verify**: Auto-verification on page load
6. **Logout**: Clear tokens + redirect

### 📝 **Data Models**

#### User Model
```typescript
interface User {
  username: string;
  email: string;
  password: string; // bcrypt hashed
  role: 'admin' | 'user';
  isActive: boolean;
}
```

#### Portfolio Model
```typescript
interface Portfolio {
  intro: {
    name: string;           // Full name
    nickname?: string;      // Display nickname
    email: string;          // Contact email
    phone: string;          // Phone number
    location: string;       // Geographic location
    avatar?: string;        // Avatar image URL
    avatarPositioning?: {   // Avatar positioning data
      x: number;            // Horizontal position (0-100)
      y: number;            // Vertical position (0-100)
      scale: number;        // Zoom scale (0.8-2.5)
    };
    github?: string;        // GitHub username
    linkedin?: string;      // LinkedIn profile
    website?: string;       // Personal website
  };
  summary: string;          // Professional summary
  workExperiences: [{
    position: string;       // Job title
    company: string;        // Company name
    url?: string;           // Company website
    start: string;          // Start date
    end: string;            // End date (or "Present")
    details: string[];      // Job responsibilities
  }];
  educations: [{
    degree: string;         // Degree type
    university: string;     // Institution name
    start_year: string;     // Start year
    end_year: string;       // End year
    GPAX?: string;          // Grade point average
    details: string[];      // Education details
  }];
  technologies: [{
    section: string;        // Technology category
    details: string[];      // List of technologies
  }];
  displayProjects: [{      // Featured projects
    name: string;           // Project name
    description: string;    // Project description
    github?: string;        // GitHub repository
    demo?: string;          // Live demo URL
    image?: string;         // Project image/screenshot URL
    technologies: string[]; // Tech stack used
    featured: boolean;      // Show on main page
    order: number;          // Display order
    hide: boolean;          // Hide from display
  }];
}
```

## 🎨 Customization

### Styling
- Modify `src/app/globals.css` for global styles
- Update Tailwind classes in components
- Customize animations and transitions

### Content
- Sample data in `mongo-init.js` 
- **Current data:** Integrated with Tanakit Phentun's existing portfolio
- Environment variables in `.env` (documented in `.env.example`)
- Admin credentials configurable via environment variables

### Features
- Add new portfolio sections in `src/components/Portfolio/`
- Extend API routes in `src/app/api/`
- Add new models in `src/models/`

## 🚀 Production Deployment

### 🎯 **www.tumrabert.com - Production Ready!**

**🌟 Full CI/CD Pipeline with Jenkins:**
- ✅ Automated Docker builds
- ✅ SSL/HTTPS with Let's Encrypt
- ✅ Nginx reverse proxy with security headers
- ✅ MongoDB with authentication and replica sets
- ✅ Health checks and monitoring
- ✅ Automated deployments from `main` branch

### 🚀 **Jenkins CI/CD Deployment**

#### Prerequisites Setup:
1. **Server Requirements:**
   ```bash
   # Ubuntu 20.04+ with Docker
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo apt install docker-compose-plugin
   ```

2. **Domain Configuration:**
   - Point `www.tumrabert.com` and `tumrabert.com` to your server IP
   - Configure DNS A records

3. **SSL Certificate Setup:**
   ```bash
   # Install Certbot
   sudo snap install --classic certbot
   
   # Generate certificates
   sudo certbot certonly --standalone -d www.tumrabert.com -d tumrabert.com
   
   # Setup auto-renewal
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

#### Jenkins Pipeline Features:
- 🔄 **Automated CI/CD** - Deploys on push to `main` branch
- 🐳 **Docker Integration** - Builds and deploys containerized applications
- 🔐 **Security Scanning** - npm audit and vulnerability checks
- 🏥 **Health Checks** - Comprehensive application monitoring
- 📊 **Build Notifications** - Success/failure alerts
- 🔄 **Rollback Support** - Automatic rollback on deployment failures

#### Deployment Process:
```bash
# 1. Push to main branch triggers Jenkins
git push origin main

# 2. Jenkins automatically:
#    - Installs dependencies
#    - Runs tests and linting
#    - Builds Docker image
#    - Deploys to production
#    - Runs health checks
```

**📖 Complete deployment guide:** See `DEPLOYMENT.md` for detailed setup instructions.

### 🌐 **Alternative Deployment Options**

#### **Vercel (Simple Next.js)**
```bash
# 1. Push to GitHub/GitLab
git push origin main

# 2. Connect repository to Vercel
# 3. Add environment variables in Vercel dashboard
# 4. Deploy automatically on push
```

#### **Docker Production (Manual)**
```bash
# 1. Build production image
docker build -t portfolio-nextjs:prod .

# 2. Run with production compose
docker-compose -f docker-compose.prod.yml up -d

# 3. Check logs and health
docker-compose logs -f
curl -f https://www.tumrabert.com/api/portfolio
```

#### **VPS/Server (Traditional)**
```bash
# 1. Server setup
sudo apt update && sudo apt install nodejs npm mongodb nginx

# 2. Clone and build
git clone <your-repo>
cd portfolio-nextjs
npm ci --production
npm run build

# 3. Process management with PM2
npm install -g pm2
pm2 start npm --name "portfolio" -- start
pm2 startup && pm2 save
```

### ☁️ **Database Options**

#### **MongoDB Atlas (Cloud - Recommended)**
1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Get connection string
3. Update `MONGODB_URI` in environment
4. Configure IP whitelist and authentication

#### **Self-Hosted MongoDB**
```bash
# Production MongoDB setup
docker run -d \
  --name mongodb-prod \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secure_password \
  mongo:7.0 --auth --replSet rs0
```

### 🔒 **Production Security Checklist**

- [ ] **SSL/HTTPS enabled** with valid certificates
- [ ] **Strong JWT secret** (256-bit random)
- [ ] **Secure admin credentials** (not defaults)
- [ ] **MongoDB authentication** enabled
- [ ] **Firewall configured** (ports 80, 443, 22 only)
- [ ] **Rate limiting** enabled for API endpoints
- [ ] **Security headers** configured in Nginx
- [ ] **CORS properly configured** for domain
- [ ] **Environment variables** secured (not in code)
- [ ] **Regular security updates** scheduled
- [ ] **Backup strategy** implemented
- [ ] **Monitoring and logging** configured

### 📊 **Production Monitoring**

#### **Health Check Endpoints:**
```bash
# Application health
curl -f https://www.tumrabert.com/api/portfolio

# Server health (custom endpoint)
curl -f https://www.tumrabert.com/health

# SSL certificate check
echo | openssl s_client -servername www.tumrabert.com -connect www.tumrabert.com:443 2>/dev/null | openssl x509 -noout -dates
```

#### **Log Monitoring:**
```bash
# Application logs
docker-compose logs -f portfolio-app

# Nginx access logs
docker-compose logs -f nginx

# MongoDB logs
docker-compose logs -f mongodb
```

## 🔒 Security Notes

- Change default JWT secret in production
- Update default admin credentials
- Use environment variables for sensitive data
- Enable HTTPS in production
- Regularly update dependencies

## 🛠️ Development & Customization

### 🎨 **Adding Custom Sections**
```bash
# 1. Create new component
src/components/Portfolio/CustomSection.tsx

# 2. Add to main portfolio page
src/components/PortfolioPage.tsx

# 3. Add API endpoint if needed
src/app/api/custom-data/route.ts

# 4. Update MongoDB models
src/models/Portfolio.ts
```

### 🧪 **Testing Setup**
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm run test

# Test coverage
npm run test:coverage
```

### 📱 **Mobile Responsiveness**
- Uses **mobile-first** approach
- **Tailwind breakpoints**: sm, md, lg, xl, 2xl
- **Responsive navigation** with hamburger menu
- **Touch-friendly** buttons and interactions

### 🎯 **Performance Optimization**
- **Next.js Image optimization** for photos
- **Font optimization** with Inter
- **Server-side rendering** for SEO
- **Static generation** where possible
- **Code splitting** with dynamic imports

### 🔧 **Available Scripts**
```bash
# Local Development
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checking

# Docker Development (with Hot Reload)
npm run dev:docker   # Start development containers
npm run dev:logs     # View container logs
npm run dev:docker:down # Stop development containers
./start-dev.sh       # Quick start script with status info
```

## 🌟 **Migration Success Story**

> **From Express.js to Next.js Fullstack - COMPLETE ✅**

✅ **Successfully migrated** from vanilla JavaScript/Express.js architecture  
✅ **Data integration complete** - Working with existing portfolio data structure  
✅ **All components functional** - Hero, Experience, Education, Skills, Projects  
✅ **Admin panel operational** - Full CRUD operations with JWT authentication  
✅ **Database connected** - MongoDB with existing portfolio data  
✅ **Modern navigation system** - Sticky horizontal navbar with mobile responsiveness  
✅ **Environment configured** - Comprehensive `.env` setup with documentation  
✅ **Production ready** - Docker, TypeScript, and deployment configurations  
✅ **Performance optimized** - SSR, code splitting, and modern React patterns  

**Current Status:** 🟢 **LIVE and FUNCTIONAL** at [http://localhost:3002](http://localhost:3002)

## 🔧 **Troubleshooting**

### Common Issues & Solutions

#### ❌ "Error Loading Portfolio - Failed to load portfolio data"
**Cause:** MongoDB not running or data not initialized  
**Solution:**
```bash
# Check if MongoDB is running
docker ps | grep mongo

# If not running, start MongoDB
docker run -d -p 27017:27017 --name portfolio-mongo mongo:7.0

# Initialize with sample data
docker exec -i portfolio-mongo mongosh portfolio --eval "
db.users.insertOne({
  username: 'admin',
  email: 'admin@portfolio.com', 
  password: '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdGhG/S7.aDlW.q',
  role: 'admin',
  isActive: true,
  createdAt: new Date()
});
print('Admin user created');
"
```

#### ❌ "Query data cannot be undefined"
**Cause:** API response structure mismatch  
**Solution:** Already fixed in current version - update `usePortfolio` hook to use `data.data`

#### ❌ "Port 3000 already in use"
**Cause:** Another application using the port  
**Solution:** 
```bash
# Kill process on port 3002
lsof -ti:3002 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

#### ❌ "Network error occurred when login"
**Cause:** Server not responding or CORS issues  
**Solution:**
```bash
# Restart the development server
pkill -f "next-server"
npm run dev

# Check API endpoint
curl http://localhost:3002/api/auth/default-credentials
```

### Environment File Issues

#### ❌ Missing environment variables
**Solution:** Copy and configure the environment file:
```bash
cp .env.example .env
# Edit .env with your specific values
```

#### ❌ MongoDB connection issues
**Solution:** Update `MONGODB_URI` in `.env`:
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/portfolio

# Docker MongoDB  
MONGODB_URI=mongodb://root:portfolio123@localhost:27017/portfolio?authSource=admin

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
```

## 🤝 **Contributing**

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### 📋 **Contribution Guidelines**
- Follow existing code style and TypeScript patterns
- Add tests for new features
- Update documentation for API changes
- Ensure responsive design for UI changes

## 📞 **Support & Community**

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-repo/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/your-repo/discussions)
- 📖 **Documentation**: This README + inline code comments
- 💬 **Questions**: Open an issue with the "question" label

## 📄 **License**

This project is **open source** and available under the [MIT License](LICENSE).

## 🙏 **Acknowledgments**

- **Next.js team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the flexible database solution
- **Vercel** for seamless deployment platform

---

## 📁 **Project Files Overview**

### 🚀 **Production Deployment Files**
- `Jenkinsfile` - Complete CI/CD pipeline for www.tumrabert.com
- `docker-compose.prod.yml` - Production Docker configuration
- `nginx/` - Nginx reverse proxy with SSL configuration
- `DEPLOYMENT.md` - Comprehensive production deployment guide
- `.env.production` - Production environment template

### 🐳 **Docker Configuration**
- `Dockerfile` - Multi-stage build for optimized images
- `docker-compose.yml` - Development environment
- `mongo-init.js` - MongoDB initialization script

### 🔧 **Configuration Files**
- `.env.example` - Environment variables documentation
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

---

## 🌟 **Ready for Production!**

**🎯 Your portfolio is production-ready with:**

✅ **Enterprise-grade CI/CD** with Jenkins
✅ **SSL/HTTPS security** with Let's Encrypt
✅ **Docker containerization** with health checks
✅ **Nginx reverse proxy** with rate limiting
✅ **MongoDB with authentication** and replica sets
✅ **Automated deployments** to www.tumrabert.com
✅ **Security headers** and vulnerability scanning
✅ **Performance optimization** and caching
✅ **Comprehensive monitoring** and logging

**🚀 Built with passion using:**
- ⚛️ **Next.js 15** - React Framework with App Router
- 🔷 **TypeScript** - Type Safety and Better DX
- 🍃 **MongoDB** - Flexible Document Database
- 🎨 **Tailwind CSS** - Utility-First Styling
- 🔐 **JWT** - Secure Authentication
- 🐳 **Docker** - Containerization and Deployment
- 🔄 **Jenkins** - CI/CD Pipeline Automation
- 🌐 **Nginx** - Reverse Proxy and Load Balancing
- 🔒 **Let's Encrypt** - Free SSL Certificates

---

**🌐 Deploy your portfolio to www.tumrabert.com today!**

**Made with ❤️ for developers who want beautiful, scalable, production-ready portfolios**
