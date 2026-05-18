## Live link: https://talentalign.vercel.app/

# TalentAlign - AI-Powered Job Listing and Matching Portal

A comprehensive platform with **role-based experiences** for Job Seekers, Recruiters, and Admins. Each user type gets a tailored interface with unique features and visual themes.

---

## 🎭 THREE DISTINCT USER EXPERIENCES

### 1. 👤 **Job Seeker Experience** (Lime-Green Theme)

**What You Get:**
- Browse jobs from multiple sources (Telegram, TimesOfJob, HireJobs, Instahyre, Recruiter posts)
- **AI-powered skill matching** with percentage-based recommendations
- Save jobs for later viewing
- Generate AI cover letters using Google Gemini
- Track application status in real-time
- View jobs even with 0% match (helpful prompt to add skills)

**Pages & Features:**
- 📊 Dashboard: Browse jobs with skill match percentages
- 📝 Apply Page: AI cover letter generation
- 💼 Applied Jobs: Track all your applications
- 🔖 Saved Jobs: Bookmarked opportunities
- ✏️ Profile Editor: Manage skills, experience, resume

**Visual Identity:** Lime-green accents (#c5f82a), job seeker focused navigation

---

### 2. 💼 **Recruiter Experience** (Blue Theme)

**What You Get:**
- Post and manage job openings
- View applications with applicant details
- Update application status (Pending → Shortlisted → Interview → Rejected)
- Dashboard with statistics (Total Jobs, Active Jobs, Applications, Pending Reviews)
- Filter jobs by status (Active, Draft, Closed)

**Pages & Features:**
- 📊 Dashboard: View stats and manage posted jobs
- ➕ Post New Job: Create job listings with detailed requirements
- 📄 Job Details: View applicant list for each job
- ✏️ Edit Job: Update job postings
- 👥 Applications Management: Review candidates, change status, add notes

**Visual Identity:** Blue theme (bg-blue-600), recruiter-focused navigation

---

### 3. 👨‍💼 **Admin Experience** (Purple/Blue Gradient Theme)

**What You Get:**
- System-wide analytics and insights
- User management (suspend, activate, delete, change roles)
- View all jobs across all sources
- Monitor all applications
- Full platform oversight

**Pages & Features:**
- 📊 Admin Dashboard: Comprehensive analytics
  - User statistics (total, by role, by status)
  - Job statistics (by source: recruiter, telegram, times, etc.)
  - Application statistics (by status)
- 👥 User Management: Search, filter, suspend, activate, delete users
- 💼 Jobs Management: View all jobs from all sources
- 📝 Applications Overview: Monitor all applications platform-wide

**Visual Identity:** Purple/blue gradient (purple-600 to blue-600), admin-focused navigation

---

## 🚀 Key Features

### **AI-Powered Capabilities**
- ✨ **Smart Job Matching**: NLP-based skill extraction with percentage matching
- 🤖 **AI Cover Letter Generation**: Personalized cover letters using Google Gemini 2.5 Flash
- 📄 **Resume Parsing**: Extract skills, experience, education from PDF resumes

### **Multi-Source Job Aggregation**
- 📱 Telegram job channels
- 🌐 TimesOfJob web scraping
- 🔍 HireJobs scraping
- 💼 Instahyre scraping
- 👔 Direct recruiter postings

### **Role-Based Access Control (RBAC)**
- 🔐 JWT authentication
- 🛡️ Middleware protection on all routes
- 🎨 Dynamic UI themes per role
- 🧭 Role-specific navigation

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15.2.4 (App Router) with React 18.2.0
- **Styling**: Tailwind CSS 4 with role-specific themes
- **State Management**: Redux Toolkit 2.6.1
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Animations**: Smooth transitions and hover effects

### **Backend**
- **Runtime**: Node.js with Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.13.1
- **Authentication**: JWT with bcryptjs
- **Validation**: express-validator 7.2.1
- **File Storage**: ImageKit for resume/CV storage
- **AI Integration**: Google Generative AI (Gemini 2.5 Flash)
- **PDF Processing**: pdf-parse for resume analysis

### **Web Scraping**
- **Python**: Selenium, Telethon for automated scraping
- **Job Sources**: Telegram channels, TimesOfJob, HireJobs, Instahyre

---

## 📁 Project Structure

```
TalentAlign/
├── frontend/                       # Next.js React application
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/         # Job Seeker pages (lime-green theme)
│   │   │   │   ├── page.js        # Browse jobs
│   │   │   │   ├── apply/         # Application page
│   │   │   │   ├── profile/       # Applied jobs & profile
│   │   │   │   └── saved/         # Saved jobs
│   │   │   ├── recruiter/         # Recruiter pages (blue theme)
│   │   │   │   ├── page.js        # Recruiter dashboard
│   │   │   │   └── jobs/          # Job management
│   │   │   ├── admin/             # Admin pages (purple theme)
│   │   │   │   ├── page.js        # Admin dashboard
│   │   │   │   ├── users/         # User management
│   │   │   │   └── jobs/          # All jobs view
│   │   │   ├── login/             # Authentication
│   │   │   ├── register/
│   │   │   └── page.js            # Landing page
│   │   ├── components/
│   │   │   ├── DashboardNav.js    # Role-based navigation
│   │   │   ├── RoleGuard.js       # RBAC protection
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── recruiterService.js
│   │   │   ├── adminService.js
│   │   │   └── ...
│   │   └── utils/
│   │       ├── jobMatching.js     # Skill matching algorithm
│   │       └── roleHelpers.js
│   └── package.json
├── backend/                        # Express.js API server
│   ├── config/                    # Database configuration
│   ├── controllers/
│   │   ├── authController.js      # Authentication
│   │   ├── recruiterController.js # Recruiter operations
│   │   ├── adminController.js     # Admin operations
│   │   └── jobController.js       # Job operations
│   ├── models/
│   │   ├── User.js                # User schema with roles
│   │   ├── Job.js                 # Job schema
│   │   └── Application.js         # Application schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── recruiterRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── jobRoutes.js
│   │   └── userRoutes.js
│   ├── middlewares/
│   │   ├── authMiddleware.js      # JWT verification
│   │   └── roleMiddleware.js      # Role-based protection
│   ├── validators/
│   │   ├── authValidator.js
│   │   └── jobValidator.js
│   └── index.js                   # Main server file
├── backend/scripts/websites/       # Python scrapers
│   ├── telegram_scraper.py
│   ├── timesOfJob_scraper.py
│   ├── hirejobs_scraper.py
│   └── instahyre_scraper.py
├── API_TESTING_GUIDE.md           # Comprehensive curl commands
├── TESTING_GUIDE.md               # Full testing instructions
└── README.md
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Python 3.x (for scrapers)
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/kishan-25/Ai-powered-Job-Listing-and-matching-portal.git
   cd Ai-powered-Job-Listing-and-matching-portal
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file with required variables
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables** (backend/.env)
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_google_gemini_api_key
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url
   ```

### **Running the Application**

1. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   # Runs on http://localhost:5000
   ```

2. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   # Runs on http://localhost:3000
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Swagger Docs: http://localhost:5000/api-docs

---

## 🧪 Testing

### **Quick Start Testing**

#### **Test Accounts**
```bash
# Job Seeker
Email: jobseeker@test.com
Password: Test@1234

# Recruiter
Email: recruiter@test.com
Password: Test@1234

# Admin
Email: admin@test.com
Password: Test@1234
```

#### **Create Test Accounts with CURL**
```bash
# Job Seeker
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Seeker", "email": "jobseeker@test.com", "password": "Test@1234", "userRole": "job_seeker"}'

# Recruiter
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Recruiter", "email": "recruiter@test.com", "password": "Test@1234", "userRole": "recruiter"}'

# Admin
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin User", "email": "admin@test.com", "password": "Test@1234", "userRole": "admin"}'
```

### **Complete Testing Guides**
- 📘 [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) - All curl commands for API testing
- 📗 [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Frontend and backend testing workflows

---

## 🎨 Visual Identity by Role

| Role | Theme Color | Header | Navigation | Primary Actions |
|------|------------|--------|------------|----------------|
| **Job Seeker** | Lime-Green `#c5f82a` | Lime-green | Browse Jobs, Applied, Saved, Profile | Apply Now |
| **Recruiter** | Blue `#2563eb` | Blue | My Jobs, Post Job, Profile | Post New Job |
| **Admin** | Purple/Blue Gradient | Purple-to-blue gradient | Dashboard, Users, Jobs | Manage Users |

---

## 📱 Usage Workflows

### **Job Seeker Workflow**
1. Register/Login → Dashboard
2. Browse jobs with match percentages
3. Save interesting jobs
4. Apply with AI-generated cover letter
5. Track application status

### **Recruiter Workflow**
1. Register/Login → Recruiter Dashboard
2. View statistics (jobs, applications)
3. Post new job
4. Receive applications
5. Review candidates → Shortlist → Schedule Interview

### **Admin Workflow**
1. Login → Admin Dashboard
2. View system analytics
3. Manage users (suspend, activate, change roles)
4. Monitor all jobs and applications
5. Oversee platform health

---

## 🔌 API Endpoints Summary

### **Authentication** (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get profile
- `PUT /profile` - Update profile

### **Recruiter** (`/api/v1/recruiter`)
- `POST /jobs` - Create job
- `GET /jobs` - Get recruiter jobs
- `PUT /jobs/:id` - Update job
- `GET /jobs/:id/applications` - View applications
- `PUT /applications/:id/status` - Update application status
- `GET /stats` - Get recruiter statistics

### **Admin** (`/api/v1/admin`)
- `GET /analytics` - System analytics
- `GET /users` - Get all users
- `PUT /users/:id/suspend` - Suspend user
- `PUT /users/:id/activate` - Activate user
- `PUT /users/:id/role` - Change user role
- `GET /jobs` - Get all jobs
- `GET /applications` - Get all applications

### **Job Seeker** (`/api/v1`)
- `GET /jobs/all` - Get all jobs
- `POST /users/saved-jobs/:id` - Save job
- `GET /users/saved-jobs` - Get saved jobs
- `POST /applications` - Submit application
- `GET /applications` - Get my applications

---

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Input validation with express-validator
- ✅ Role-based access control (RBAC)
- ✅ Protected routes with middleware
- ✅ CORS enabled
- ✅ Environment variable protection

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 🔮 Future Enhancements

- [ ] Email notifications for application status updates
- [ ] Interview scheduling integration
- [ ] Salary insights and negotiation tools
- [ ] Company research automation
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Real-time chat between recruiters and applicants

---

## 📞 Support

- 📧 Email: support@talentalign.com
- 🐛 Issues: [GitHub Issues](https://github.com/kishan-25/Ai-powered-Job-Listing-and-matching-portal/issues)
- 📚 Docs: See [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)

---

**Built with ❤️ for job seekers, recruiters, and admins everywhere**
