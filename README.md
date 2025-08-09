# TalentAlign - Personal AI Assistant for Job Applications

A comprehensive AI-powered platform that centralizes job opportunities, analyzes skill matching, and generates personalized cover letters to streamline your job application process.

## 🚀 Features

### Core Functionality
- **Job Aggregation**: Centralizes jobs scraped from Telegram channels and web portals
- **Smart Matching**: Shows matching percentage based on your skills and experience
- **Personalized Dashboard**: Track your application progress and manage your profile
- **AI Cover Letter Generation**: Dynamic cover letter creation using Google's Gemini AI
- **Resume Analysis**: CV parsing and skill extraction capabilities
- **Dark Mode Support**: Modern UI with light/dark theme toggle

### Key Components
- **Landing Page**: Modern, responsive design with hero section, features overview, and contact form
- **User Authentication**: Secure registration and login system with JWT tokens
- **Dashboard**: Comprehensive job management and application tracking
- **Profile Management**: Skills, experience, and professional information management
- **Application System**: Streamlined job application process with AI assistance

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4 with React 18
- **Styling**: Tailwind CSS 4 with custom lime-green and black theme
- **Animations**: Framer Motion for smooth transitions
- **State Management**: Redux Toolkit
- **Icons**: Lucide React & React Icons
- **Notifications**: React Hot Toast & React Toastify

### Backend
- **Runtime**: Node.js with Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs for password hashing
- **File Upload**: Multer with ImageKit integration
- **AI Integration**: Google Generative AI (Gemini)
- **PDF Processing**: PDF-parse for resume analysis
- **Web Scraping**: Puppeteer for job data collection
- **Email**: Nodemailer for contact form functionality

### Additional Tools
- **Job Scraping**: Python scripts for Telegram and web portal scraping
- **CV Parser**: Dedicated CV parsing module
- **Development**: Nodemon for hot reloading, Concurrently for parallel processes

## 📁 Project Structure

```
Personal-AI-Assistant/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   │   ├── dashboard/   # Dashboard pages (main, apply, profile)
│   │   │   ├── login/       # Authentication pages
│   │   │   ├── register/
│   │   │   └── page.js      # Landing page
│   │   └── components/      # Reusable React components
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Express.js API server
│   ├── config/              # Database configuration
│   ├── controllers/         # Route controllers
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── middlewares/         # Custom middleware
│   ├── scripts/             # Utility scripts
│   ├── cvHandler.js         # CV processing logic
│   └── index.js             # Main server file
├── python-scraping/         # Job scraping scripts
│   ├── job_scraper.py       # Web portal scraper
│   ├── job_tele.py          # Telegram scraper
│   └── mongoConnection.py   # Database connection
├── dummyCV-parser/          # CV parsing utilities
└── package.json             # Root package configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Python 3.x (for scraping scripts)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kishan-25/Ai-powered-Job-Listing-and-matching-portal.git
   cd Ai-powered-Job-Listing-and-matching-portal
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Development Mode (Recommended)**
   ```bash
   # From root directory - runs both frontend and backend concurrently
   npm run dev
   ```

2. **Manual Setup**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔧 Configuration

### Required API Keys
- **Google Gemini AI**: For cover letter generation
- **ImageKit**: For file upload and management
- **MongoDB**: Database connection string
- **Gmail App Password**: For contact form emails

### Optional Setup
- **Python Environment**: For job scraping functionality
  ```bash
  cd python-scraping
  pip install -r requirements.txt  # If requirements.txt exists
  ```

## 📱 Usage

### For Job Seekers
1. **Register/Login**: Create your account or sign in
2. **Complete Profile**: Add your skills, experience, and upload resume
3. **Browse Jobs**: View aggregated job listings with match percentages
4. **Apply with AI**: Generate personalized cover letters using AI
5. **Track Progress**: Monitor your applications in the dashboard

### For Developers
- **API Endpoints**: Backend provides RESTful APIs for all functionality
- **Component Library**: Reusable React components with consistent theming
- **Database Models**: Well-structured MongoDB schemas for users, jobs, and applications

## 🎨 Design System

### Color Scheme
- **Primary**: Lime Green (#84cc16)
- **Secondary**: Black (#000000)
- **Background**: White/Gray (#ffffff/#f8f9fa)
- **Text**: Black/White (theme-dependent)

### Components
- Modern, responsive design
- Consistent spacing and typography
- Smooth animations with Framer Motion
- Mobile-first approach

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Jobs
- `GET /api/jobs` - Fetch job listings
- `GET /api/jobs/:id` - Get specific job details

### Applications
- `POST /api/applications` - Submit job application
- `GET /api/applications` - Get user applications

### AI Features
- `POST /api/generate-cover-letter` - Generate AI cover letter
- `POST /api/resume/upload` - Upload and parse resume

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🔮 Future Enhancements

- [ ] Advanced job filtering and search
- [ ] Interview scheduling integration
- [ ] Salary negotiation assistant
- [ ] Company research automation
- [ ] Application status tracking from employer portals
- [ ] Mobile application development

---

**Built with ❤️ for job seekers everywhere**
