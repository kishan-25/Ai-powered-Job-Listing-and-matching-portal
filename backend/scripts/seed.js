/**
 * TalentAlign — Comprehensive Seed Script
 * Wipes & repopulates MongoDB Atlas with showcase-quality demo data:
 *   - 12 recruiters across top Indian & global tech companies
 *   - 8 job seekers with varied profiles
 *   - 50 recruiter-posted jobs (rich descriptions, salary ranges, skills)
 *   - 80 TimesJobs scraped jobs
 *   - 70 Telegram scraped jobs
 *   - 35 applications with mixed statuses
 *
 * Run:  node scripts/seed.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const crypto   = require("crypto");

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error("❌  MONGO_URI not set in .env"); process.exit(1); }

/* ── Schemas ─────────────────────────────────────────────────────────────── */
const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  userRole: { type: String, default: "job_seeker" },
  accountStatus: { type: String, default: "active" },
  skills: [String], experience: String, jobTitle: String,
  education: String, location: String, aboutMe: String, projects: [String],
  linkedin: String, github: String, portfolio: String,
  companyName: String, companyWebsite: String, phone: String, position: String,
  savedJobs: [mongoose.Schema.Types.ObjectId],
}, { timestamps: true });

const JobSchema = new mongoose.Schema({
  title: String, company: String, description: String,
  keySkills: [String], location: String, experience: String,
  salary: String, jobType: String, workMode: String,
  source: { type: String, default: "recruiter" },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "active" },
  applicationsCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  expiresAt: Date,
}, { timestamps: true });

const ApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  jobId: String, title: String, company: String, location: String,
  applied: { type: Boolean, default: true },
  source: String,
  status: { type: String, default: "pending" },
  applicationDate: { type: Date, default: Date.now },
  statusHistory: [{ status: String, changedAt: Date, changedBy: mongoose.Schema.Types.ObjectId }],
}, { timestamps: true });

const User        = mongoose.models.User        || mongoose.model("User",        UserSchema);
const Job         = mongoose.models.Job         || mongoose.model("Job",         JobSchema);
const Application = mongoose.models.Application || mongoose.model("Application", ApplicationSchema);

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const hash      = (pw) => bcrypt.hash(pw, 10);
const daysAgo   = (n)  => new Date(Date.now() - n * 86_400_000);
const weeksAhead= (n)  => new Date(Date.now() + n * 7 * 86_400_000);
const md5       = (s)  => crypto.createHash("md5").update(s).digest("hex");
const rand      = (n)  => Math.floor(Math.random() * n);

/* ══════════════════════════════════════════════════════════════════════════
   1. RECRUITERS
   ══════════════════════════════════════════════════════════════════════════ */
const RECRUITERS = [
  { name:"Priya Sharma",    email:"priya@razorpay.com",     company:"Razorpay",       website:"https://razorpay.com",        position:"Senior TA Lead",           phone:"+91 98100 11111", location:"Bangalore, India",   about:"Building teams that power India's largest payment gateway." },
  { name:"Arjun Mehta",     email:"arjun@cred.club",        company:"CRED",            website:"https://cred.club",           position:"Head of Engineering Hiring",phone:"+91 98100 22222", location:"Bangalore, India",   about:"Hiring exceptional engineers for CRED's premium product." },
  { name:"Sneha Iyer",      email:"sneha@zeptonow.com",     company:"Zepto",           website:"https://zeptonow.com",        position:"Talent Partner",            phone:"+91 98100 33333", location:"Mumbai, India",      about:"Scaling Zepto as we redefine 10-minute delivery." },
  { name:"Vikram Nair",     email:"vikram@groww.in",        company:"Groww",           website:"https://groww.in",            position:"Engineering Recruiter",     phone:"+91 98100 44444", location:"Bangalore, India",   about:"Helping 10M+ investors — and the team that makes it possible." },
  { name:"Divya Krishnan",  email:"divya@phonepe.com",      company:"PhonePe",         website:"https://phonepe.com",         position:"Talent Acquisition Manager",phone:"+91 98100 55555", location:"Bangalore, India",   about:"PhonePe processes $1T+ in payments. Join us." },
  { name:"Rajan Patel",     email:"rajan@swiggy.in",        company:"Swiggy",          website:"https://swiggy.com",          position:"Senior Recruiter",          phone:"+91 98100 66666", location:"Bangalore, India",   about:"Delivering happiness to 100M+ customers — join the team." },
  { name:"Meera Joshi",     email:"meera@meesho.com",       company:"Meesho",          website:"https://meesho.com",          position:"Technical Recruiter",       phone:"+91 98100 77777", location:"Bangalore, India",   about:"Democratising e-commerce for the next 500M Indians." },
  { name:"Aditya Kumar",    email:"aditya@postman.com",     company:"Postman",         website:"https://postman.com",         position:"Engineering Recruiter",     phone:"+91 98100 88888", location:"Bangalore, India",   about:"The world's leading API platform — 30M+ developers." },
  { name:"Nisha Reddy",     email:"nisha@freshworks.com",   company:"Freshworks",      website:"https://freshworks.com",      position:"Global Talent Partner",     phone:"+91 98100 99999", location:"Chennai, India",     about:"SaaS for business teams — 60,000+ customers worldwide." },
  { name:"Karan Malhotra",  email:"karan@browserstack.com", company:"BrowserStack",    website:"https://browserstack.com",    position:"Technical Recruiter",       phone:"+91 98101 11111", location:"Mumbai, India",      about:"The testing platform trusted by 50,000+ companies." },
  { name:"Pooja Sharma",    email:"pooja@juspay.in",        company:"Juspay",          website:"https://juspay.in",           position:"Talent Acquisition Lead",   phone:"+91 98101 22222", location:"Bangalore, India",   about:"Powering payments for Amazon, Swiggy, and 200+ clients." },
  { name:"Saurabh Gupta",   email:"saurabh@urbancompany.com",company:"Urban Company", website:"https://urbancompany.com",    position:"Hiring Manager",            phone:"+91 98101 33333", location:"Gurgaon, India",     about:"India's largest home services platform — 50,000+ professionals." },
];

/* ══════════════════════════════════════════════════════════════════════════
   2. JOB SEEKERS
   ══════════════════════════════════════════════════════════════════════════ */
const SEEKERS = [
  { name:"Rohit Verma",      email:"rohit.verma@gmail.com",     skills:["React","TypeScript","Node.js","PostgreSQL","Docker","AWS","GraphQL"],          exp:"3",  title:"Full Stack Developer",    loc:"Bangalore, India", edu:"B.Tech CS, IIT Delhi",        about:"Full stack dev with 3 yrs building scalable B2B SaaS. Love React and clean architecture.",  github:"https://github.com/rohitverma",  linkedin:"https://linkedin.com/in/rohitverma",   portfolio:"https://rohitverma.dev",    projects:["Multi-tenant SaaS platform","Real-time chat with WebSockets","OSS contribution to Next.js"] },
  { name:"Ananya Singh",     email:"ananya.singh@gmail.com",     skills:["Python","Machine Learning","TensorFlow","PyTorch","SQL","Pandas","FastAPI","NLP"], exp:"2", title:"Backend Developer",       loc:"Hyderabad, India", edu:"M.Tech AI, NIT Warangal",     about:"ML engineer focused on NLP and recommendation systems. Kaggle Expert.",                    github:"https://github.com/ananyasingh", linkedin:"https://linkedin.com/in/ananyasingh",  portfolio:"",                         projects:["Sentiment analysis at scale","Personalised news recommender","ML pipeline on GCP"] },
  { name:"Karan Gupta",      email:"karan.gupta@gmail.com",      skills:["React","Next.js","Tailwind CSS","JavaScript","Figma","CSS","Framer Motion"],   exp:"1",  title:"Frontend Developer",      loc:"Delhi, India",      edu:"BCA, Delhi University",       about:"Frontend dev with strong eye for design. I bridge the gap between design and engineering.", github:"https://github.com/karangupta",  linkedin:"https://linkedin.com/in/karangupta",   portfolio:"https://karangupta.in",    projects:["Portfolio site (10K+ visitors)","Design system for a startup","NFT marketplace UI"] },
  { name:"Preethi Menon",    email:"preethi.menon@gmail.com",    skills:["Java","Spring Boot","Kafka","Kubernetes","AWS","PostgreSQL","Redis","Microservices"], exp:"5", title:"Backend Developer",  loc:"Chennai, India",    edu:"B.Tech IT, Anna University",  about:"Senior backend engineer specialising in distributed systems and payments infrastructure.",   github:"https://github.com/preethimenon",linkedin:"https://linkedin.com/in/preethimenon",  portfolio:"",                         projects:["Payment gateway microservices","Event-driven order system","Redis-based rate limiter"] },
  { name:"Aakash Sharma",    email:"aakash.sharma@gmail.com",    skills:["Go","Python","Kubernetes","Terraform","AWS","CI/CD","Linux","Docker","Prometheus"], exp:"4", title:"Software Engineer",     loc:"Bangalore, India",  edu:"B.Tech ECE, BITS Pilani",     about:"DevOps / platform engineer who loves automation and reliability engineering.",              github:"https://github.com/aakash-sharma",linkedin:"https://linkedin.com/in/aakash-sharma",portfolio:"",                         projects:["Zero-downtime deployment pipeline","Self-healing Kubernetes setup","Cost optimisation saving $40K/yr"] },
  { name:"Shreya Kapoor",    email:"shreya.kapoor@gmail.com",    skills:["Swift","iOS","SwiftUI","UIKit","Objective-C","MVVM","CoreData","Combine"],     exp:"3",  title:"Software Engineer",       loc:"Mumbai, India",     edu:"B.Tech CS, VJTI Mumbai",      about:"iOS engineer passionate about delightful user experiences. Published 3 apps on App Store.", github:"https://github.com/shreyakapoor", linkedin:"https://linkedin.com/in/shreyakapoor",  portfolio:"",                         projects:["Meditation app (50K+ downloads)","B2B field-sales iOS app","SwiftUI component library"] },
  { name:"Nikhil Agarwal",   email:"nikhil.agarwal@gmail.com",   skills:["Kotlin","Android","Jetpack Compose","MVVM","Hilt","Coroutines","Retrofit","Room"], exp:"2", title:"Software Engineer",     loc:"Noida, India",      edu:"MCA, Amity University",       about:"Android dev building feature-rich apps with clean architecture and Material Design 3.",     github:"https://github.com/nikhilagarwal",linkedin:"https://linkedin.com/in/nikhil-agarwal",portfolio:"",                         projects:["Food delivery Android app","Fintech wallet app","Open-source Compose UI kit"] },
  { name:"Divya Nair",       email:"divya.nair@gmail.com",       skills:["Python","SQL","Tableau","Power BI","Spark","dbt","Snowflake","Airflow"],        exp:"3",  title:"Software Engineer",       loc:"Bangalore, India",  edu:"B.Stat, ISI Kolkata",         about:"Data analyst turned data engineer. I turn messy data into clean insights.",                 github:"https://github.com/divyanair",   linkedin:"https://linkedin.com/in/divyanair",    portfolio:"",                         projects:["Real-time analytics dashboard","Data lake migration to Snowflake","Churn prediction model"] },
];

/* ══════════════════════════════════════════════════════════════════════════
   3. RECRUITER-POSTED JOBS
   ══════════════════════════════════════════════════════════════════════════ */
const jobs = (R) => [
  /* ─── RAZORPAY (R[0]) ──────────────────────────────────────────── */
  { title:"Senior Software Engineer — Payments Core", company:"Razorpay", postedBy:R[0], salary:"₹35–55 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Bangalore, India", experience:"4–7 years", apps:51, views:1020, daysOld:8, expires:6,
    skills:["Go","Java","Distributed Systems","Kafka","Redis","PostgreSQL","Microservices","AWS"],
    desc:`We're hiring a Senior SWE to join Razorpay's Payments Core — the backbone processing 5M+ transactions/day.\n\n**What you'll do:**\n- Design and build high-availability payment processing systems\n- Architect solutions for UPI 2.0, BNPL, and international cards\n- Lead technical decisions on our payments routing engine\n- On-call for production incidents affecting payment success rates\n\n**Requirements:**\n- 4–7 yrs of backend engineering\n- Deep expertise in distributed systems and microservices\n- Proficiency in Go (primary) or Java\n- Experience with Kafka, Redis, and high-throughput databases\n- Strong understanding of PCI DSS and payment tokenisation\n\n**Why Razorpay:**\n- Process 50% of India's internet transactions\n- Work at massive scale with direct business impact\n- Competitive ESOPs + ₹1L annual learning budget` },

  { title:"Frontend Engineer — Merchant Dashboard", company:"Razorpay", postedBy:R[0], salary:"₹22–38 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Bangalore, India", experience:"2–5 years", apps:67, views:1340, daysOld:5, expires:8,
    skills:["React","TypeScript","JavaScript","Vite","CSS","Storybook","Performance Optimisation","Web Accessibility"],
    desc:`Build the Razorpay merchant dashboard used by 8M+ businesses to manage payments, analytics, and settlements.\n\n**Your stack:** React 18, TypeScript, Vite, React Query, Recharts, Storybook\n\n**Responsibilities:**\n- Ship fast, accessible UIs for complex financial data visualisations\n- Architect a reusable component library shared across Razorpay products\n- Improve Core Web Vitals and Time-to-Interactive scores\n- Run A/B tests that improve merchant activation and retention\n\n**Requirements:**\n- 2–5 yrs of frontend engineering\n- Strong TypeScript and React skills\n- Experience with performance optimisation (code-splitting, lazy loading, memoization)\n- You genuinely care about pixels and UX` },

  { title:"Backend Engineer — Razorpay Capital (Lending)", company:"Razorpay", postedBy:R[0], salary:"₹28–45 LPA", jobType:"Full-time", workMode:"On-site", location:"Bangalore, India", experience:"3–6 years", apps:34, views:620, daysOld:12, expires:10,
    skills:["Node.js","Python","PostgreSQL","gRPC","REST APIs","Redis","Docker","RBI Compliance"],
    desc:`Razorpay Capital is building India's future of business lending — processing thousands of loan applications daily.\n\n**Responsibilities:**\n- Build APIs for loan origination, underwriting, and disbursement flows\n- Integrate with CIBIL, Experian, and partner NBFCs\n- Design fraud detection pipelines and risk scoring models\n- Ensure compliance with RBI's digital lending guidelines\n\n**Requirements:**\n- 3–6 yrs backend experience (Node.js, Python, or Java)\n- Strong SQL skills with financial data experience\n- Knowledge of lending lifecycle is a strong plus\n- Familiarity with RBI regulations a bonus` },

  { title:"Product Security Engineer", company:"Razorpay", postedBy:R[0], salary:"₹32–52 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Bangalore, India", experience:"3–6 years", apps:9, views:340, daysOld:18, expires:6,
    skills:["Application Security","OWASP","Penetration Testing","SAST/DAST","PCI DSS","Python","Burp Suite","Threat Modelling"],
    desc:`Secure Razorpay's payment infrastructure and protect 8M+ merchants and their customers.\n\n**Responsibilities:**\n- Conduct security design reviews and threat modelling for new products\n- Build automated security testing into CI/CD pipelines (SAST/DAST)\n- Lead penetration testing engagements and bug bounty triage\n- Ensure PCI DSS compliance across all payment systems\n- Incident response for security events\n\n**Requirements:**\n- 3–6 yrs application security experience\n- Strong knowledge of OWASP Top 10, web vulnerabilities, API security\n- Experience with Burp Suite, semgrep, trivy\n- PCI DSS knowledge is a strong plus` },

  { title:"Technical Writer — Developer APIs", company:"Razorpay", postedBy:R[0], salary:"₹15–25 LPA", jobType:"Full-time", workMode:"Remote", location:"Remote, India", experience:"2–4 years", apps:26, views:480, daysOld:16, expires:9,
    skills:["Technical Writing","REST APIs","OpenAPI","JavaScript","Developer Experience","Docs-as-Code"],
    desc:`Create world-class developer docs for Razorpay's APIs used by 8M+ developers.\n\n**Responsibilities:**\n- Write and maintain API reference docs, integration guides, and tutorials\n- Create code samples in Node.js, Python, PHP, Ruby, and Java\n- Partner with engineering teams to document new products pre-launch\n- Own developer portal content strategy\n\n**Requirements:**\n- 2–4 yrs of technical writing experience\n- Ability to understand and explain complex technical concepts simply\n- Experience documenting REST APIs\n- Familiarity with OpenAPI/Swagger\n- Coding ability in at least one programming language` },

  /* ─── CRED (R[1]) ──────────────────────────────────────────────── */
  { title:"Software Engineer II — iOS", company:"CRED", postedBy:R[1], salary:"₹30–50 LPA", jobType:"Full-time", workMode:"On-site", location:"Bangalore, India", experience:"2–5 years", apps:92, views:2340, daysOld:3, expires:5,
    skills:["Swift","iOS","SwiftUI","UIKit","Objective-C","MVVM","Combine","Core Data","Instruments"],
    desc:`CRED is a members-only financial club for India's most creditworthy individuals. Our iOS app is used by 12M+ premium users who expect flawless, beautiful experiences.\n\n**What you'll build:**\n- Feature-rich iOS experiences using SwiftUI and UIKit\n- High-performance animations that define CRED's distinct aesthetic\n- Offline-first architecture with robust sync\n- Complex financial flows — credit score, rewards, P2P payments\n\n**Requirements:**\n- 2–5 yrs of iOS development\n- Proficiency in Swift; Objective-C for legacy code\n- Experience with SwiftUI, Combine, async/await\n- Passion for design — CRED has extremely high design standards\n\n**Perks:**\n- ESOP in a pre-IPO company\n- Annual wellness allowance ₹1L\n- Work with India's best designers and engineers` },

  { title:"Staff Engineer — Backend Platform", company:"CRED", postedBy:R[1], salary:"₹60–90 LPA", jobType:"Full-time", workMode:"On-site", location:"Bangalore, India", experience:"7+ years", apps:13, views:456, daysOld:6, expires:12,
    skills:["System Design","Distributed Systems","Go","Java","Kubernetes","AWS","gRPC","Technical Leadership"],
    desc:`Drive technical direction for CRED's core backend platform used by 200+ engineers.\n\n**Responsibilities:**\n- Define architectural direction for CRED's microservices platform\n- Lead cross-cutting concerns: observability, reliability, developer velocity\n- Technical leadership on high-impact engineering initiatives\n- Mentor and grow senior engineers across 8 teams\n\n**Requirements:**\n- 7+ yrs of engineering, including staff-level experience\n- Deep expertise in distributed systems and large-scale system design\n- Experience influencing architecture in high-growth environments\n- Exceptional communication — ability to align 50+ stakeholders` },

  { title:"Data Engineer — Rewards & Personalisation", company:"CRED", postedBy:R[1], salary:"₹32–50 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Bangalore, India", experience:"3–6 years", apps:32, views:710, daysOld:14, expires:7,
    skills:["Python","Apache Spark","Kafka","Airflow","Snowflake","dbt","SQL","AWS EMR","Feature Store"],
    desc:`Build the data infrastructure powering CRED's personalised rewards engine for 12M+ members.\n\n**What you'll do:**\n- Design and maintain real-time and batch data pipelines (Spark, Kafka)\n- Build feature stores for ML models powering personalisation\n- Optimise our Snowflake data warehouse for analytical queries\n- Work closely with ML engineers on model deployment\n\n**Stack:** Python, Apache Spark, Kafka, Airflow, Snowflake, dbt, AWS EMR\n\n**Requirements:**\n- 3–6 yrs of data engineering\n- Proficiency in PySpark and advanced SQL\n- Experience building production ETL pipelines\n- Familiarity with ML model serving` },

  { title:"Engineering Manager — Consumer Platform", company:"CRED", postedBy:R[1], salary:"₹55–80 LPA", jobType:"Full-time", workMode:"On-site", location:"Bangalore, India", experience:"7+ years", apps:7, views:298, daysOld:20, expires:10,
    skills:["Engineering Management","System Design","Backend Development","Team Leadership","Agile","Hiring"],
    desc:`Lead a team of 8–12 engineers building CRED's consumer-facing product experiences.\n\n**Responsibilities:**\n- Build and grow a high-performing team — hiring, mentoring, career paths\n- Drive technical direction and architectural decisions for your area\n- Partner with product managers and designers on roadmap execution\n- Own engineering KPIs: velocity, quality, reliability\n\n**Requirements:**\n- 7+ yrs engineering, 2+ yrs in management\n- Track record building and scaling engineering teams\n- Strong technical background — you can read and review code\n- Experience at a consumer tech company with high design standards` },

  /* ─── ZEPTO (R[2]) ──────────────────────────────────────────────── */
  { title:"Software Engineer — Inventory & Fulfilment", company:"Zepto", postedBy:R[2], salary:"₹18–35 LPA", jobType:"Full-time", workMode:"On-site", location:"Mumbai, India", experience:"1–4 years", apps:78, views:1680, daysOld:2, expires:6,
    skills:["Python","Go","Kafka","Redis","PostgreSQL","Event-Driven Architecture","AWS","Geospatial"],
    desc:`Zepto delivers groceries in 10 minutes to 4M+ customers across 10 cities. Join the Inventory team and solve some of the hardest real-time logistics problems in India.\n\n**Your role:**\n- Build real-time inventory tracking for 400+ dark stores\n- Design demand forecasting pipelines that auto-replenish stock\n- Build "Out of Stock" prediction with <2% unavailability target\n- Optimise fulfilment routing for sub-10-minute delivery\n\n**Why Zepto:**\n- Series F startup, $1.4B raised\n- Solve real-time, massive-scale logistics problems\n- Fast-paced culture with huge ownership and zero bureaucracy` },

  { title:"Android Engineer — Customer App", company:"Zepto", postedBy:R[2], salary:"₹22–40 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Mumbai, India", experience:"2–5 years", apps:58, views:1020, daysOld:9, expires:8,
    skills:["Kotlin","Android","Jetpack Compose","MVVM","Coroutines","Hilt","Retrofit","Exoplayer"],
    desc:`Build the Android app for 4M+ daily active customers who rely on Zepto for 10-minute grocery delivery.\n\n**What you'll work on:**\n- Highly performant home feed with personalised product recommendations\n- Checkout flow optimised for sub-30-second ordering\n- Real-time order tracking with live delivery ETA\n- Offline graceful degradation for low-connectivity scenarios\n\n**Stack:** Kotlin, Jetpack Compose, Coroutines, Hilt, Retrofit, Room, ExoPlayer\n\n**Requirements:**\n- 2–5 yrs Android development\n- Strong Kotlin skills; Compose experience preferred\n- MVVM and Clean Architecture experience\n- Experience with performance profiling` },

  { title:"Senior ML Engineer — Demand Forecasting", company:"Zepto", postedBy:R[2], salary:"₹35–55 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Mumbai, India", experience:"3–6 years", apps:24, views:730, daysOld:11, expires:9,
    skills:["Python","Machine Learning","PyTorch","TensorFlow","MLOps","Apache Flink","SQL","Time-Series Forecasting"],
    desc:`Build ML models that predict what 4M+ customers will buy tomorrow — and ensure it's already stocked at the dark store.\n\n**Responsibilities:**\n- Develop and deploy demand forecasting models for 50,000+ SKUs\n- Build real-time feature pipelines using Flink and Spark\n- Collaborate with supply chain and ops teams\n- Design A/B testing infrastructure for model evaluation\n- Reduce food wastage through accurate perishables forecasting\n\n**Requirements:**\n- 3–6 yrs ML engineering experience\n- Strong Python; PyTorch or TensorFlow\n- Experience deploying models at scale (model serving, monitoring)\n- Time-series forecasting knowledge` },

  /* ─── GROWW (R[3]) ──────────────────────────────────────────────── */
  { title:"Software Engineer — Trading Platform", company:"Groww", postedBy:R[3], salary:"₹25–42 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Bangalore, India", experience:"2–5 years", apps:71, views:1980, daysOld:4, expires:7,
    skills:["Java","Go","Kafka","Redis","CockroachDB","Kubernetes","AWS","Low Latency Systems","FIX Protocol"],
    desc:`Groww is India's largest investment platform with 10M+ active investors. Join the Trading team to build the engine executing millions of orders daily.\n\n**What you'll build:**\n- Low-latency order management system connecting to NSE/BSE\n- Real-time market data processing and display\n- Portfolio analytics and P&L calculation engine\n- Tax harvesting and reporting tools for retail investors\n\n**Stack:** Java (primary), Go, Redis, Kafka, CockroachDB, Kubernetes on AWS\n\n**Requirements:**\n- 2–5 yrs backend experience\n- Strong Java skills; Go is a plus\n- Experience with high-throughput, low-latency systems\n- FIX protocol experience is a strong plus` },

  { title:"Full Stack Engineer — Mutual Funds", company:"Groww", postedBy:R[3], salary:"₹22–38 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Bangalore, India", experience:"2–4 years", apps:44, views:1180, daysOld:7, expires:10,
    skills:["React","Node.js","Java","MySQL","Redis","AWS","TypeScript","REST APIs","A/B Testing"],
    desc:`Work on the core Mutual Funds product used by 8M+ investors to manage SIPs, redemptions, and portfolio tracking.\n\n**Responsibilities:**\n- Build end-to-end features for SIP management, NFO subscriptions, and redemptions\n- Design APIs consumed by both web and mobile clients\n- Improve SIP conversion funnel through A/B testing\n- Build investor education features for first-time investors\n\n**Stack:** React (frontend), Node.js + Java (backend), MySQL + Redis, AWS\n\n**Requirements:**\n- 2–4 yrs full stack development\n- Strong React and Node.js skills\n- Understanding of investment products (MF, SIP) is a big plus` },

  { title:"DevOps Engineer — Platform & Infrastructure", company:"Groww", postedBy:R[3], salary:"₹28–48 LPA", jobType:"Full-time", workMode:"Remote", location:"Remote, India", experience:"3–6 years", apps:21, views:560, daysOld:15, expires:8,
    skills:["Kubernetes","AWS","Terraform","CI/CD","Docker","Prometheus","Grafana","Python","SRE"],
    desc:`Build and operate infrastructure serving 10M+ investors with 99.99% uptime — especially during market opening at 9:15 AM.\n\n**What you'll do:**\n- Manage Kubernetes clusters across multi-AZ AWS setup\n- Build CI/CD pipelines for 100+ microservices\n- Implement observability: Prometheus, Grafana, ELK stack\n- Chaos engineering to harden infrastructure\n- On-call rotation for production incidents\n\n**Requirements:**\n- 3–6 yrs DevOps / SRE experience\n- Strong Kubernetes and AWS expertise\n- Terraform for infrastructure as code\n- Python or Go scripting` },

  { title:"SDE Intern — Summer 2025", company:"Groww", postedBy:R[3], salary:"₹60,000–80,000/month", jobType:"Internship", workMode:"On-site", location:"Bangalore, India", experience:"Fresher / 0–1 year", apps:147, views:3800, daysOld:1, expires:4,
    skills:["Java","Python","JavaScript","Data Structures","Algorithms","REST APIs","Git"],
    desc:`Join Groww as an SDE Intern and work on real products used by 10M+ investors — not toy projects.\n\n**What you'll get:**\n- Work on production features from day 1\n- Mentorship from senior engineers\n- Potential full-time offer based on performance\n- Competitive stipend + housing allowance ₹20,000/month\n\n**Requirements:**\n- Pursuing B.Tech/M.Tech CS (3rd/4th year preferred)\n- Proficiency in Java, Python, JavaScript, or Go\n- Strong DSA fundamentals\n- Prior project experience is a plus` },

  /* ─── PHONEPE (R[4]) ─────────────────────────────────────────────── */
  { title:"Backend Engineer — UPI Payments", company:"PhonePe", postedBy:R[4], salary:"₹28–48 LPA", jobType:"Full-time", workMode:"On-site", location:"Bangalore, India", experience:"2–6 years", apps:63, views:1420, daysOld:6, expires:8,
    skills:["Java","Go","Kafka","Redis","MySQL","Microservices","AWS","UPI Integration","NPCI"],
    desc:`PhonePe processes 1B+ UPI transactions monthly, making it India's largest payments platform. Join the UPI Core team.\n\n**Responsibilities:**\n- Build and maintain the UPI payment processing system at massive scale\n- Integrate with NPCI for new UPI features (UPI Lite, One World, Credit on UPI)\n- Design systems for fraud detection and transaction reconciliation\n- Ensure 99.99% success rate and <200ms p99 latency\n\n**Requirements:**\n- 2–6 yrs backend engineering experience\n- Strong Java or Go skills\n- Experience with high-scale distributed systems\n- Knowledge of the payments and UPI ecosystem is a plus` },

  { title:"Data Scientist — Risk & Fraud", company:"PhonePe", postedBy:R[4], salary:"₹25–45 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Bangalore, India", experience:"2–5 years", apps:28, views:680, daysOld:11, expires:9,
    skills:["Python","Machine Learning","XGBoost","SQL","Spark","Feature Engineering","Risk Modelling","Fraud Detection"],
    desc:`Build ML models that protect 500M+ PhonePe users from fraud while ensuring genuine transactions succeed.\n\n**Responsibilities:**\n- Develop and productionise fraud detection models\n- Build real-time feature pipelines for risk scoring at transaction time\n- Monitor model drift and perform regular retraining\n- A/B test model updates on live traffic\n\n**Requirements:**\n- 2–5 yrs data science experience\n- Strong Python and ML skills (XGBoost, LightGBM, Neural Networks)\n- Experience with real-time model serving\n- Payments or fraud domain experience is a strong plus` },

  { title:"Analytics Engineer — Growth", company:"PhonePe", postedBy:R[4], salary:"₹18–30 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Bangalore, India", experience:"2–4 years", apps:19, views:432, daysOld:17, expires:7,
    skills:["SQL","dbt","Python","Snowflake","Airflow","Data Modelling","Looker","Growth Analytics"],
    desc:`Build the analytics infrastructure that helps PhonePe's 500M users discover more ways to pay and save.\n\n**Responsibilities:**\n- Design and maintain dbt models for Growth, Marketing, and Finance teams\n- Build self-serve dashboards in Looker\n- Partner with product managers on instrumentation and metric definitions\n- Automate growth experiment reporting\n\n**Stack:** Python, dbt, Snowflake, Airflow, Looker\n\n**Requirements:**\n- 2–4 yrs analytics engineering or data engineering experience\n- Expert SQL; dbt experience preferred\n- Familiarity with growth metrics (activation, retention, cohort analysis)` },

  /* ─── SWIGGY (R[5]) ──────────────────────────────────────────────── */
  { title:"Backend Engineer — Order Management System", company:"Swiggy", postedBy:R[5], salary:"₹20–35 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Bangalore, India", experience:"2–5 years", apps:54, views:1100, daysOld:5, expires:7,
    skills:["Python","Django","Go","Kafka","Redis","PostgreSQL","Microservices","AWS","gRPC"],
    desc:`Swiggy delivers 3M+ orders daily across 500+ cities. Join the Order Management team and build the backbone of food delivery in India.\n\n**What you'll do:**\n- Build and scale the order lifecycle system from cart to delivery\n- Design real-time order tracking and restaurant communication protocols\n- Architect systems for order batching and delivery partner assignment\n- Handle peak load during IPL finals (5x normal traffic)\n\n**Requirements:**\n- 2–5 yrs backend engineering experience\n- Python (Django/FastAPI) or Go\n- Experience with event-driven architectures\n- Passion for systems that operate at scale` },

  { title:"Machine Learning Engineer — Personalisation", company:"Swiggy", postedBy:R[5], salary:"₹30–50 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Bangalore, India", experience:"3–6 years", apps:31, views:810, daysOld:9, expires:8,
    skills:["Python","Recommendation Systems","Deep Learning","PyTorch","Spark","MLflow","Real-time Serving","A/B Testing"],
    desc:`Build personalised experiences for 100M+ Swiggy users — the right restaurants, dishes, and offers at the right time.\n\n**Responsibilities:**\n- Design and deploy recommendation systems (collaborative filtering, two-tower models)\n- Build real-time ranking for the Swiggy home feed\n- Run online experiments — you own the A/B testing framework\n- Optimise for multiple objectives: user satisfaction, restaurant revenue, delivery efficiency\n\n**Requirements:**\n- 3–6 yrs ML engineering experience\n- Experience building production recommendation systems\n- PyTorch / TensorFlow proficiency\n- Experience with real-time feature stores` },

  { title:"SDE II — Swiggy Instamart", company:"Swiggy", postedBy:R[5], salary:"₹22–38 LPA", jobType:"Full-time", workMode:"On-site", location:"Bangalore, India", experience:"2–5 years", apps:42, views:930, daysOld:13, expires:6,
    skills:["Java","Spring Boot","MySQL","Redis","Kafka","Kubernetes","AWS","REST APIs"],
    desc:`Swiggy Instamart is the fastest-growing quick commerce business in India. Join us and build the tech that delivers groceries in 10 minutes.\n\n**Responsibilities:**\n- Build inventory management and dark store operations systems\n- Design catalogue APIs serving millions of product listings\n- Build the checkout and payment integration for Instamart\n- Improve on-shelf availability prediction models\n\n**Requirements:**\n- 2–5 yrs backend engineering\n- Strong Java and Spring Boot skills\n- Experience with high-traffic e-commerce systems\n- Familiarity with quick-commerce operations is a plus` },

  /* ─── MEESHO (R[6]) ──────────────────────────────────────────────── */
  { title:"Staff Software Engineer — Logistics Platform", company:"Meesho", postedBy:R[6], salary:"₹55–85 LPA", jobType:"Full-time", workMode:"On-site", location:"Bangalore, India", experience:"7+ years", apps:8, views:312, daysOld:19, expires:11,
    skills:["Java","System Design","Distributed Systems","Kafka","AWS","Kubernetes","Technical Leadership","Logistics"],
    desc:`Meesho ships 30M+ packages monthly to 50,000+ pincodes across India — more than any other e-commerce platform. Join the Logistics Platform team.\n\n**Responsibilities:**\n- Architect the next-generation logistics platform handling 1M+ packages/day\n- Design the courier selection algorithm optimising for cost, speed, and reliability\n- Lead technical direction for 3 squads across the logistics domain\n- Drive engineering excellence through design reviews, RFCs, and mentorship\n\n**Requirements:**\n- 7+ yrs engineering, including staff-level scope\n- Deep understanding of distributed systems\n- Logistics or supply chain domain experience is a strong plus\n- Track record of technical leadership in high-growth environments` },

  { title:"Frontend Engineer — Seller Platform", company:"Meesho", postedBy:R[6], salary:"₹20–35 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Bangalore, India", experience:"2–5 years", apps:36, views:820, daysOld:8, expires:8,
    skills:["React","TypeScript","Micro-frontends","Performance Optimisation","CSS","REST APIs","Webpack"],
    desc:`Build the Meesho Supplier Hub used by 1.5M+ sellers to list products, manage orders, and grow their business.\n\n**Responsibilities:**\n- Build fast, accessible React UIs for sellers across diverse devices and network conditions\n- Architect micro-frontends for a large seller panel with 50+ features\n- Optimise for low-end Android devices and 2G/3G networks\n- Run experiments to improve seller onboarding and retention\n\n**Requirements:**\n- 2–5 yrs frontend engineering\n- Strong React and TypeScript skills\n- Experience with micro-frontend architectures\n- Sensitivity to performance on low-end devices` },

  { title:"SDE I — New Graduate", company:"Meesho", postedBy:R[6], salary:"₹14–22 LPA", jobType:"Full-time", workMode:"On-site", location:"Bangalore, India", experience:"0–1 year", apps:189, views:4200, daysOld:3, expires:5,
    skills:["Java","Python","Data Structures","Algorithms","SQL","System Design Basics","Git"],
    desc:`Meesho hires the best new graduates from top engineering colleges across India. This is your opportunity to build for 100M+ users from day 1.\n\n**What you'll do:**\n- Work on production systems with real business impact in your first month\n- Ship features under mentorship from senior engineers\n- Participate in design reviews and learn system design at scale\n- Rotate across teams to find your best fit\n\n**Requirements:**\n- B.Tech / M.Tech CS or related (2024/2025 batch)\n- Strong DSA and problem-solving skills\n- Proficiency in Java, Python, or C++\n- CGPA 7.5+ from a recognised engineering institute` },

  /* ─── POSTMAN (R[7]) ──────────────────────────────────────────────── */
  { title:"Senior Backend Engineer — API Platform", company:"Postman", postedBy:R[7], salary:"₹40–65 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Bangalore, India", experience:"4–8 years", apps:17, views:580, daysOld:7, expires:9,
    skills:["Node.js","Go","PostgreSQL","Redis","AWS","Microservices","API Design","System Design"],
    desc:`Postman is the world's leading API platform used by 30M+ developers across 500,000+ organisations. Join the API Platform team.\n\n**What you'll build:**\n- Core API execution engine handling billions of API calls monthly\n- Collaboration features enabling teams to design and test APIs together\n- Scalable infrastructure for real-time collaboration\n- Integrations with GitHub, Jira, AWS, and more\n\n**Requirements:**\n- 4–8 yrs backend engineering experience\n- Strong Node.js or Go skills\n- Deep understanding of API design and HTTP internals\n- Experience building highly scalable SaaS products\n- Passion for developer tools and developer experience` },

  { title:"Frontend Engineer — Postman App", company:"Postman", postedBy:R[7], salary:"₹30–50 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Bangalore, India", experience:"3–6 years", apps:23, views:640, daysOld:12, expires:7,
    skills:["React","TypeScript","Electron","Redux","JavaScript","CSS","Testing","Performance"],
    desc:`Build the Postman desktop app used by 30M+ developers to design, test, and document APIs.\n\n**Responsibilities:**\n- Own and improve core Postman features: request builder, test runner, collection runner\n- Optimise Electron app performance for startup time and memory usage\n- Build real-time collaboration features — multiple developers on the same collection\n- Improve accessibility for the global developer community\n\n**Stack:** React, TypeScript, Electron, Redux Toolkit\n\n**Requirements:**\n- 3–6 yrs frontend engineering\n- Experience with Electron or complex desktop applications is a plus\n- Strong TypeScript and React skills\n- A developer who uses Postman and cares deeply about the product` },

  /* ─── FRESHWORKS (R[8]) ──────────────────────────────────────────── */
  { title:"Product Engineer — CRM Platform", company:"Freshworks", postedBy:R[8], salary:"₹18–32 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Chennai, India", experience:"1–4 years", apps:47, views:980, daysOld:10, expires:8,
    skills:["Ruby on Rails","React","PostgreSQL","Redis","AWS","REST APIs","SaaS","Sidekiq"],
    desc:`Freshworks builds simple, delightful business software for 60,000+ customers worldwide. Join the CRM team building Freshsales.\n\n**What you'll work on:**\n- Build CRM features: sales pipeline, email sync, meeting scheduler, AI insights\n- Design APIs for Freshworks marketplace — 1,200+ app integrations\n- Build multi-tenancy infrastructure serving customers from SMBs to enterprises\n- Improve Freshsales onboarding — from signup to first sale in <1 hour\n\n**Requirements:**\n- 1–4 yrs backend or full stack development\n- Ruby on Rails or Node.js experience\n- Strong SQL and database design skills\n- SaaS product development experience` },

  { title:"Senior Data Scientist — AI Features", company:"Freshworks", postedBy:R[8], salary:"₹28–45 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Chennai, India", experience:"3–6 years", apps:14, views:420, daysOld:22, expires:10,
    skills:["Python","NLP","LLMs","OpenAI API","RAG","MLOps","SQL","FastAPI"],
    desc:`Build Freddy AI — Freshworks' AI copilot used by 60,000+ businesses to automate customer support and sales.\n\n**Responsibilities:**\n- Fine-tune and deploy LLMs for customer support automation\n- Build Retrieval-Augmented Generation (RAG) systems for enterprise knowledge bases\n- Design ML pipelines for email classification, intent detection, and CSAT prediction\n- Own model evaluation frameworks and safety guardrails\n\n**Requirements:**\n- 3–6 yrs data science experience\n- Experience with LLMs, prompt engineering, and fine-tuning\n- RAG implementation experience preferred\n- Strong Python and MLOps skills` },

  /* ─── BROWSERSTACK (R[9]) ─────────────────────────────────────────── */
  { title:"Infrastructure Engineer — Cloud Testing Platform", company:"BrowserStack", postedBy:R[9], salary:"₹25–42 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Mumbai, India", experience:"3–6 years", apps:12, views:380, daysOld:14, expires:9,
    skills:["AWS","GCP","Kubernetes","Terraform","CI/CD","Python","Linux","Networking","Security"],
    desc:`BrowserStack is trusted by 50,000+ companies to test software on real devices. Build the cloud infrastructure that powers it all.\n\n**Responsibilities:**\n- Manage a hybrid cloud infrastructure (AWS + GCP + on-prem) of 10,000+ devices\n- Build auto-scaling systems for test execution demand\n- Implement zero-trust network security across the platform\n- Reduce infrastructure cost through resource optimisation\n\n**Requirements:**\n- 3–6 yrs infrastructure engineering experience\n- Strong AWS and Kubernetes skills\n- Terraform for infrastructure as code\n- Experience with large-scale distributed systems` },

  { title:"Software Engineer — Test Platform SDK", company:"BrowserStack", postedBy:R[9], salary:"₹20–35 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Mumbai, India", experience:"2–5 years", apps:19, views:510, daysOld:17, expires:8,
    skills:["Java","Python","JavaScript","SDK Development","WebDriver","Selenium","CI/CD","REST APIs"],
    desc:`Build the SDKs and integrations that let 50,000+ companies test on BrowserStack with zero friction.\n\n**Responsibilities:**\n- Build and maintain official SDKs in Java, Python, Node.js, Ruby, C#\n- Create seamless integrations with CI/CD tools (GitHub Actions, Jenkins, CircleCI)\n- Improve WebDriver protocol implementation for real-device testing\n- Build developer docs and code samples\n\n**Requirements:**\n- 2–5 yrs software engineering experience\n- Proficiency in multiple programming languages\n- Experience with testing frameworks and CI/CD\n- Strong API design skills` },

  /* ─── JUSPAY (R[10]) ──────────────────────────────────────────────── */
  { title:"Software Engineer — Haskell (Payments Backend)", company:"Juspay", postedBy:R[10], salary:"₹22–40 LPA", jobType:"Full-time", workMode:"On-site", location:"Bangalore, India", experience:"2–5 years", apps:6, views:245, daysOld:15, expires:10,
    skills:["Haskell","PureScript","Functional Programming","PostgreSQL","Redis","Kafka","Payments","Type Safety"],
    desc:`Juspay powers payments for Amazon, Swiggy, Ola, and 200+ companies. We use Haskell and PureScript to build correct-by-construction payment systems.\n\n**Why Haskell at Juspay:**\nPayments require correctness above all. Haskell's type system eliminates entire classes of bugs, giving us confidence in code that moves billions of rupees.\n\n**What you'll do:**\n- Build payment orchestration logic in Haskell\n- Design APIs used by Amazon India and Swiggy for checkout\n- Implement new payment methods: UPI, net banking, wallets\n- Contribute to our open-source libraries\n\n**Requirements:**\n- 2–5 yrs software engineering experience\n- Prior Haskell or functional programming experience (OCaml, Erlang, Scala) strongly preferred\n- Strong theoretical CS background — type theory, category theory is a plus\n- Willingness to learn Haskell if you haven't — we mentor well` },

  { title:"DevOps Engineer — Payments Infrastructure", company:"Juspay", postedBy:R[10], salary:"₹18–32 LPA", jobType:"Full-time", workMode:"On-site", location:"Bangalore, India", experience:"2–5 years", apps:11, views:310, daysOld:21, expires:9,
    skills:["AWS","Kubernetes","Terraform","CI/CD","Prometheus","Grafana","Python","Linux","Security"],
    desc:`Build and operate the payment infrastructure processing transactions for Amazon India and 200+ clients.\n\n**Responsibilities:**\n- Manage Kubernetes clusters across multiple AWS regions\n- Build CI/CD pipelines for our Haskell microservices\n- Implement PCI DSS-compliant security controls\n- Design disaster recovery and business continuity plans\n\n**Requirements:**\n- 2–5 yrs DevOps / infrastructure experience\n- Strong AWS and Kubernetes skills\n- Experience with security-hardened infrastructure\n- PCI DSS familiarity is a strong plus` },

  /* ─── URBAN COMPANY (R[11]) ──────────────────────────────────────── */
  { title:"Senior Software Engineer — Marketplace", company:"Urban Company", postedBy:R[11], salary:"₹25–42 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Gurgaon, India", experience:"3–6 years", apps:28, views:620, daysOld:10, expires:8,
    skills:["Node.js","React","PostgreSQL","Redis","Kafka","AWS","Microservices","Marketplace Systems"],
    desc:`Urban Company connects 50,000+ service professionals with customers for beauty, wellness, home repairs, and more. Join the Marketplace team.\n\n**What you'll build:**\n- Dynamic pricing algorithms considering demand, supply, and professional ratings\n- Real-time matching engine pairing customers with the best-available professional\n- Reviews and trust systems used by 10M+ customers\n- Professional earnings optimisation and payouts\n\n**Requirements:**\n- 3–6 yrs software engineering experience\n- Strong Node.js and React (or equivalent) skills\n- Experience with marketplace or gig-economy platforms is a plus\n- Passion for building products that improve livelihoods` },

  { title:"Android Engineer — Pro App", company:"Urban Company", postedBy:R[11], salary:"₹18–32 LPA", jobType:"Full-time", workMode:"Hybrid", location:"Gurgaon, India", experience:"2–5 years", apps:22, views:480, daysOld:16, expires:7,
    skills:["Kotlin","Android","Jetpack Compose","MVVM","Maps SDK","Push Notifications","Offline-First"],
    desc:`Build the Urban Company Pro app — used by 50,000+ service professionals across 35 cities to manage their work, earnings, and customer relationships.\n\n**Responsibilities:**\n- Build job management features: accept/reject, schedule, navigate to customer\n- Integrate Google Maps for real-time navigation and ETA\n- Design offline-first features for professionals with poor connectivity\n- Build earnings dashboard with real-time payout tracking\n\n**Requirements:**\n- 2–5 yrs Android development\n- Strong Kotlin and Jetpack Compose skills\n- Experience with maps and location services\n- Empathy for users who may not be tech-savvy` },
];

/* ══════════════════════════════════════════════════════════════════════════
   4. TIMESJOBS SCRAPED (80 entries)
   ══════════════════════════════════════════════════════════════════════════ */
const TIMES_JOBS = [
  ["React Developer","Infosys","Bangalore","2–4 yrs","₹8–14 LPA","React, JavaScript, HTML, CSS, Redux","Hybrid"],
  ["Senior Java Engineer","Wipro","Pune","4–7 yrs","₹18–28 LPA","Java, Spring Boot, Microservices, MySQL","On-site"],
  ["Data Analyst","TCS","Mumbai","1–3 yrs","₹6–12 LPA","SQL, Python, Tableau, Excel, Power BI","Hybrid"],
  ["DevOps Engineer","HCL Technologies","Chennai","3–5 yrs","₹14–22 LPA","Jenkins, Docker, Kubernetes, AWS, Terraform","On-site"],
  ["Full Stack Developer","Cognizant","Hyderabad","2–5 yrs","₹10–18 LPA","React, Node.js, MongoDB, Express","Hybrid"],
  ["Python Developer","Accenture","Gurgaon","2–4 yrs","₹9–16 LPA","Python, Django, Flask, PostgreSQL, Redis","Hybrid"],
  ["iOS Developer","Capgemini","Bangalore","3–6 yrs","₹20–32 LPA","Swift, UIKit, SwiftUI, Xcode, MVVM","On-site"],
  ["Machine Learning Engineer","Tech Mahindra","Bangalore","2–5 yrs","₹15–28 LPA","Python, TensorFlow, PyTorch, NLP, MLOps","Remote"],
  ["Backend Developer (Node.js)","Mphasis","Bangalore","2–4 yrs","₹10–18 LPA","Node.js, Express, MongoDB, Redis, AWS","Hybrid"],
  ["Cloud Architect","L&T Tech Services","Mumbai","8–12 yrs","₹40–65 LPA","AWS, Azure, Terraform, Kubernetes","Hybrid"],
  ["QA Automation Engineer","Mindtree","Bangalore","2–5 yrs","₹8–14 LPA","Selenium, Java, TestNG, API Testing, Postman","On-site"],
  ["Golang Developer","NIIT Technologies","Delhi","3–6 yrs","₹18–30 LPA","Go, gRPC, Kubernetes, PostgreSQL, Redis","Remote"],
  ["Angular Developer","Hexaware Technologies","Mumbai","2–5 yrs","₹10–18 LPA","Angular, TypeScript, RxJS, CSS","Hybrid"],
  ["Data Engineer","Persistent Systems","Pune","3–6 yrs","₹14–24 LPA","Python, Spark, Hadoop, Kafka, Airflow, SQL","Hybrid"],
  ["Android Developer","Mastech Holdings","Bangalore","2–5 yrs","₹12–22 LPA","Kotlin, Jetpack Compose, MVVM, Retrofit","On-site"],
  ["Product Manager (B2B SaaS)","Freshworks","Chennai","3–6 yrs","₹25–40 LPA","Product Management, SQL, Agile, B2B SaaS","Hybrid"],
  ["SRE — Site Reliability","Zoho Corporation","Chennai","3–6 yrs","₹18–32 LPA","Linux, Python, Kubernetes, Prometheus","On-site"],
  ["Frontend Dev (React Native)","Byju's","Bangalore","2–4 yrs","₹12–22 LPA","React Native, JavaScript, TypeScript, Redux","Hybrid"],
  ["Blockchain Developer","Poly9","Mumbai","2–5 yrs","₹20–38 LPA","Solidity, Ethereum, Web3.js, Smart Contracts","Remote"],
  ["Security Engineer","Paytm","Noida","3–6 yrs","₹22–38 LPA","Application Security, OWASP, Penetration Testing","On-site"],
  ["Data Scientist (NLP)","Juspay","Bangalore","2–5 yrs","₹18–35 LPA","Python, NLP, BERT, Transformers, PyTorch","Hybrid"],
  ["Kotlin Multiplatform Dev","Postman","Bangalore","3–6 yrs","₹28–48 LPA","Kotlin, KMM, Android, iOS, Swift","Hybrid"],
  ["Infrastructure Engineer","BrowserStack","Mumbai","3–5 yrs","₹22–38 LPA","AWS, GCP, Kubernetes, Terraform, CI/CD","Hybrid"],
  ["Staff Software Engineer","Meesho","Bangalore","7+ yrs","₹55–85 LPA","Java, Distributed Systems, Kafka, Kubernetes","On-site"],
  ["Frontend Eng (Design Systems)","Urban Company","Gurgaon","3–6 yrs","₹22–38 LPA","React, TypeScript, Storybook, Accessibility","Hybrid"],
  ["Analytics Engineer","PhonePe","Bangalore","2–5 yrs","₹18–32 LPA","SQL, dbt, Python, Snowflake, Airflow","Hybrid"],
  ["SWE — Fintech","Slice","Bangalore","1–4 yrs","₹15–28 LPA","Java, Spring Boot, MySQL, Redis","On-site"],
  ["AI/ML Product Manager","Nykaa","Mumbai","4–7 yrs","₹30–48 LPA","Product Management, SQL, ML, Analytics","Hybrid"],
  ["Backend Engineer (Golang)","Khatabook","Bangalore","2–5 yrs","₹20–35 LPA","Go, gRPC, PostgreSQL, Redis","On-site"],
  ["Computer Vision Engineer","Lenskart","Delhi","2–5 yrs","₹22–40 LPA","Python, OpenCV, TensorFlow, Deep Learning","Hybrid"],
  ["Engineering Lead (Payments)","Fi Money","Bangalore","6–10 yrs","₹50–80 LPA","Java, Distributed Systems, Payments","Hybrid"],
  ["React Native Developer","MediBuddy","Bangalore","2–5 yrs","₹14–26 LPA","React Native, JavaScript, Redux","Remote"],
  ["Data Science Lead","EarlySalary","Pune","5–8 yrs","₹35–55 LPA","Python, ML, Credit Scoring, XGBoost","Hybrid"],
  ["Backend Eng (Python/Django)","Swiggy","Bangalore","2–5 yrs","₹18–32 LPA","Python, Django, PostgreSQL, Redis, Kafka","Hybrid"],
  ["UX Engineer","Flipkart","Bangalore","2–5 yrs","₹20–36 LPA","React, CSS, Figma, Accessibility, Animation","Hybrid"],
  ["Solution Architect","Deloitte USI","Hyderabad","8–12 yrs","₹45–70 LPA","AWS, Microservices, Solution Architecture","Hybrid"],
  ["SWE Trainee","GlobalLogic","Bangalore","Fresher","₹4–6 LPA","Java, C++, Data Structures, Algorithms","On-site"],
  ["Network Engineer","Jio Platforms","Mumbai","3–6 yrs","₹15–25 LPA","Networking, CCNA, BGP, OSPF, Python","On-site"],
  ["Technical Program Manager","Ola Cabs","Bangalore","5–8 yrs","₹35–55 LPA","Program Management, Agile, SQL, Risk Mgmt","On-site"],
  ["Embedded Systems Engineer","Bosch India","Hyderabad","2–5 yrs","₹14–24 LPA","C, C++, RTOS, CAN, Linux, Automotive","On-site"],
  ["Cybersecurity Analyst","Wipro Cybersec","Bangalore","2–5 yrs","₹15–25 LPA","SIEM, SOC, OWASP, Splunk, Incident Response","Hybrid"],
  ["Game Developer (Unity)","Nazara Games","Mumbai","2–5 yrs","₹14–24 LPA","Unity, C#, Game Physics, AR/VR, Shader","Hybrid"],
  ["NLP Research Engineer","Samsung R&D","Bangalore","3–6 yrs","₹28–45 LPA","Python, NLP, BERT, Research, PyTorch","On-site"],
  ["iOS Developer","Zomato","Gurgaon","2–5 yrs","₹20–35 LPA","Swift, SwiftUI, UIKit, MVVM, Core Location","Hybrid"],
  ["Site Reliability Engineer","Ola Electric","Bangalore","3–6 yrs","₹22–38 LPA","Kubernetes, AWS, Prometheus, Terraform, Go","Hybrid"],
  ["SDET — Test Automation","Razorpay","Bangalore","2–5 yrs","₹15–28 LPA","Java, Selenium, API Testing, CI/CD, JIRA","Hybrid"],
  ["Platform Engineer","Curefit","Bangalore","2–5 yrs","₹16–28 LPA","Node.js, Kubernetes, AWS, PostgreSQL, Redis","Hybrid"],
  ["Database Administrator","ICICI Bank Tech","Mumbai","4–7 yrs","₹18–28 LPA","MySQL, Oracle, Performance Tuning, RMAN","On-site"],
  ["AR/VR Developer","Wipro","Bangalore","2–5 yrs","₹18–30 LPA","Unity, Unreal Engine, C++, WebXR, AR Foundation","Hybrid"],
  ["Quantitative Developer","Smallcase","Bangalore","2–5 yrs","₹20–38 LPA","Python, C++, Quant Finance, Backtesting, SQL","On-site"],
  ["Technical Lead — React","WazirX","Mumbai","5–8 yrs","₹35–55 LPA","React, TypeScript, Leadership, System Design","Remote"],
  ["SDE II — Search Platform","Amazon","Hyderabad","3–6 yrs","₹45–70 LPA","Java, Distributed Systems, Search, ElasticSearch","On-site"],
  ["ML Platform Engineer","Uber India","Bangalore","3–6 yrs","₹40–65 LPA","Python, Spark, Kubernetes, MLOps, Airflow","Hybrid"],
  ["Software Architect","SAP Labs","Bangalore","8–12 yrs","₹55–80 LPA","Java, Enterprise Architecture, Cloud, SAP BTP","On-site"],
  ["Frontend Dev (Vue.js)","Zoho","Chennai","2–4 yrs","₹10–18 LPA","Vue.js, JavaScript, CSS, REST APIs","On-site"],
  ["SWE — Core Infrastructure","Dunzo","Bangalore","3–6 yrs","₹22–38 LPA","Go, Kubernetes, AWS, PostgreSQL, Kafka","On-site"],
  ["iOS Lead","Paytm Money","Noida","5–8 yrs","₹35–55 LPA","Swift, SwiftUI, MVVM, Financial Apps, Leadership","Hybrid"],
  ["Senior React Developer","MakeMyTrip","Gurgaon","3–6 yrs","₹22–38 LPA","React, TypeScript, SSR, Next.js, Performance","Hybrid"],
  ["Embedded Linux Engineer","Texas Instruments","Bangalore","3–6 yrs","₹20–35 LPA","Linux Kernel, C, Device Drivers, RTOS","On-site"],
  ["Data Platform Engineer","Ola Financial","Bangalore","2–5 yrs","₹18–32 LPA","Python, Spark, dbt, Snowflake, Kafka","Hybrid"],
  ["SWE — Compiler Engineer","NVIDIA India","Pune","3–6 yrs","₹35–60 LPA","C++, Compilers, LLVM, GPU Programming, CUDA","On-site"],
  ["Product Engineer","Razorpay X","Bangalore","1–3 yrs","₹15–25 LPA","Node.js, React, PostgreSQL, Redis, Fintech","Hybrid"],
  ["Backend Eng — Healthcare","Practo","Bangalore","2–5 yrs","₹16–28 LPA","Python, Django, PostgreSQL, Redis, AWS","Hybrid"],
  ["Android Lead","ShareChat","Bangalore","5–8 yrs","₹38–60 LPA","Kotlin, Android, MVVM, Technical Leadership","On-site"],
  ["SDE 1 — Fresher Hire","Juspay","Bangalore","0–1 yr","₹12–16 LPA","Java, Haskell, Functional Programming, DSA","On-site"],
  ["Reliability Engineer","CRED","Bangalore","3–6 yrs","₹28–48 LPA","Go, Kubernetes, AWS, SRE, Observability","On-site"],
  ["Data Scientist — Lending","Lendingkart","Ahmedabad","2–5 yrs","₹18–30 LPA","Python, ML, Credit Risk, XGBoost, SQL","Hybrid"],
  ["SWE — Distributed Storage","Nutanix India","Bangalore","3–6 yrs","₹35–55 LPA","C++, Distributed Storage, Linux, Networking","On-site"],
  ["Developer Advocate","Postman","Bangalore","2–5 yrs","₹20–35 LPA","Node.js, REST APIs, Public Speaking, Technical Writing","Remote"],
  ["Blockchain Analyst","WazirX","Mumbai","1–3 yrs","₹15–25 LPA","Blockchain, Crypto, Python, SQL, Compliance","Remote"],
  ["SWE — Video Platform","JioSaavn","Mumbai","3–6 yrs","₹22–38 LPA","Python, Go, Video Streaming, CDN, HLS","Hybrid"],
  ["Senior Android Dev","Nykaa","Mumbai","3–6 yrs","₹22–38 LPA","Kotlin, Android, Compose, MVVM, E-commerce","Hybrid"],
  ["Frontend Intern","Razorpay","Bangalore","Fresher","₹50,000/month","React, JavaScript, HTML, CSS, Git","On-site"],
  ["Security Researcher","Bug Crowd Partner","Remote","2–5 yrs","₹20–40 LPA","Penetration Testing, Bug Bounty, Python, Burp Suite","Remote"],
  ["SWE — Ad Platform","Google India","Hyderabad","3–6 yrs","₹50–80 LPA","C++, Java, Distributed Systems, Ads Systems","On-site"],
  ["SDE II — AWS India","Amazon","Bangalore","3–6 yrs","₹50–80 LPA","Java, Distributed Systems, Cloud, Kubernetes","On-site"],
  ["Software Engineer (New Grad)","Microsoft India","Hyderabad","0–1 yr","₹20–28 LPA","C#, Java, Python, DSA, Cloud","On-site"],
].map(([title, company, loc, exp, sal, skills, mode]) => ({
  title, company,
  location: `${loc}, India`,
  experience: exp, salary: sal,
  keySkills: skills,
  workMode: mode,
  source: "TimesJobs",
  description: `${company} is looking for a ${title}.\n\nRequired skills: ${skills}\n\nExperience: ${exp} | Location: ${loc} | Salary: ${sal}`,
  createdAt: daysAgo(rand(45) + 1),
  jobHash: md5(`${title}${company}${loc}`),
}));

/* ══════════════════════════════════════════════════════════════════════════
   5. TELEGRAM SCRAPED (70 entries)
   ══════════════════════════════════════════════════════════════════════════ */
const TEL_JOBS = [
  ["🔥 Stripe India Hiring — SWE","Stripe","Software Engineer","3–5 yrs","Bangalore","https://stripe.com/jobs"],
  ["Atlassian Hiring! Frontend Engineer","Atlassian","Frontend Engineer","2–5 yrs","Bangalore","https://atlassian.com/careers"],
  ["Adobe India — Senior UX Engineer","Adobe","UX Engineer","4–7 yrs","Noida","https://adobe.com/careers"],
  ["Microsoft SWE Role Open","Microsoft","Software Engineer","2–6 yrs","Hyderabad","https://careers.microsoft.com"],
  ["Google SWE III — India","Google","SWE III","3–5 yrs","Hyderabad","https://careers.google.com"],
  ["Amazon SDE 2 — APPLY NOW","Amazon","SDE 2","3–6 yrs","Bangalore","https://amazon.jobs"],
  ["TCS Freshers 2024/25 Drive","TCS","System Engineer","Fresher","Pan India","https://tcs.com/careers"],
  ["Infosys InStep Internship 2025","Infosys","Intern","Fresher","Multiple","https://infosys.com/careers"],
  ["Postman Engineering — Backend","Postman","Backend Engineer","2–5 yrs","Bangalore","https://postman.com/careers"],
  ["Notion Engineering — REMOTE","Notion","Software Engineer","3–6 yrs","Remote","https://notion.so/careers"],
  ["PhonePe SDE Opening","PhonePe","SDE","2–5 yrs","Bangalore","https://phonepe.com/careers"],
  ["Swiggy Backend — Multiple Roles","Swiggy","Backend Engineer","2–5 yrs","Bangalore","https://careers.swiggy.com"],
  ["Zomato SDE | Delhi/Gurgaon","Zomato","Software Engineer","1–4 yrs","Gurgaon","https://zomato.com/careers"],
  ["Unacademy Full Stack Hiring","Unacademy","Full Stack Engineer","2–4 yrs","Bangalore","https://unacademy.com/careers"],
  ["BrowserStack — QA Automation","BrowserStack","QA Automation Engineer","2–5 yrs","Mumbai","https://browserstack.com/careers"],
  ["Wipro NLTH 2025 Freshers Drive","Wipro","Project Engineer","Fresher","Pan India","https://careers.wipro.com"],
  ["Meesho SDE II — Backend","Meesho","SDE II — Backend","3–6 yrs","Bangalore","https://meesho.io/careers"],
  ["Juspay Haskell Developer","Juspay","Software Engineer","2–5 yrs","Bangalore","https://juspay.in/careers"],
  ["Zerodha Python Dev — Apply","Zerodha","Python Developer","2–5 yrs","Bangalore","https://zerodha.com/jobs"],
  ["Accenture Freshers — 2024 Batch","Accenture","ASE","Fresher","Multiple","https://accenture.com/careers"],
  ["Razorpay SDE Hiring","Razorpay","SDE","2–6 yrs","Bangalore","https://razorpay.com/jobs"],
  ["Upstox React Dev | Bangalore","Upstox","React Developer","2–4 yrs","Bangalore","https://upstox.com/careers"],
  ["Groww Data Scientist Opening","Groww","Data Scientist","2–5 yrs","Bangalore","https://groww.in/careers"],
  ["CRED iOS Engineer — Premium","CRED","iOS Engineer","2–5 yrs","Bangalore","https://cred.club/careers"],
  ["HCL Hiring Drive 2025 Freshers","HCL Tech","Graduate Engineer","Fresher","Multiple","https://hcltech.com/careers"],
  ["Dunzo Backend Engineer","Dunzo","Backend Engineer","1–3 yrs","Bangalore","https://dunzo.com/careers"],
  ["Zepto SDE 1 — Mumbai/Remote","Zepto","SDE 1","0–2 yrs","Mumbai","https://zeptonow.com/careers"],
  ["Freshworks Product Engineer","Freshworks","Product Engineer","1–3 yrs","Chennai","https://freshworks.com/careers"],
  ["Nykaa React Native Dev","Nykaa","React Native Developer","2–4 yrs","Mumbai","https://nykaa.com/careers"],
  ["Lenskart Computer Vision Eng","Lenskart","CV Engineer","2–5 yrs","Delhi","https://lenskart.com/careers"],
  ["🚀 Flipkart SDE III Opening","Flipkart","SDE III","5–8 yrs","Bangalore","https://flipkart.com/careers"],
  ["OYO Tech Backend Engineer","OYO Rooms","Backend Engineer","2–5 yrs","Gurgaon","https://careers.oyorooms.com"],
  ["ShareChat Android Lead","ShareChat","Android Lead","5–8 yrs","Bangalore","https://sharechat.com/careers"],
  ["PayU Backend Engineer","PayU India","Backend Engineer","3–6 yrs","Bangalore","https://careers.payu.com"],
  ["Ola Electric SWE — EV Tech","Ola Electric","Software Engineer","2–5 yrs","Bangalore","https://olaelectric.com/careers"],
  ["MakeMyTrip Senior FE Dev","MakeMyTrip","Senior FE Dev","3–6 yrs","Gurgaon","https://makemytrip.com/careers"],
  ["Cred Hiring: Backend Platform","CRED","Platform Engineer","3–6 yrs","Bangalore","https://cred.club/careers"],
  ["Jupiter Money SDE Opening","Jupiter Money","SDE","1–3 yrs","Bangalore","https://jupiter.money/careers"],
  ["Fi Money Backend Engineer","Fi Money","Backend Engineer","2–5 yrs","Bangalore","https://fi.money/careers"],
  ["Khatabook Go Developer","Khatabook","Go Developer","2–5 yrs","Bangalore","https://khatabook.com/careers"],
  ["WazirX Blockchain Dev — REMOTE","WazirX","Blockchain Developer","2–5 yrs","Remote","https://wazirx.com/careers"],
  ["Truecaller Android Dev","Truecaller","Android Engineer","2–5 yrs","Bangalore","https://truecaller.com/careers"],
  ["InMobi Data Engineer — Apply","InMobi","Data Engineer","2–5 yrs","Bangalore","https://inmobi.com/careers"],
  ["Hotstar SWE — Streaming Infra","Disney Hotstar","SWE","3–6 yrs","Bangalore","https://hotstar.com/in/careers"],
  ["Practo Backend Python Dev","Practo","Backend Python Dev","2–5 yrs","Bangalore","https://practo.com/careers"],
  ["Myntra FE Engineer — React","Myntra","FE Engineer","2–5 yrs","Bangalore","https://myntra.com/careers"],
  ["Bigbasket Data Scientist","Bigbasket","Data Scientist","2–5 yrs","Bangalore","https://bigbasket.com/careers"],
  ["Cult.fit SWE — Health Tech","Curefit","SWE","1–4 yrs","Bangalore","https://curefit.com/careers"],
  ["Slice SDE 1 — Fintech","Slice","SDE 1","0–2 yrs","Bangalore","https://sliceit.com/careers"],
  ["Smallcase Quant Dev","Smallcase","Quant Developer","2–5 yrs","Bangalore","https://smallcase.com/careers"],
  ["TechCrunch Hiring Engineers","TechCrunch","SWE","2–5 yrs","Remote","https://techcrunch.com/careers"],
  ["Freshers: SAP Labs India","SAP Labs","Associate Dev","Fresher","Bangalore","https://jobs.sap.com"],
  ["Uber India Platform Engineer","Uber India","Platform Engineer","3–6 yrs","Bangalore","https://uber.com/careers"],
  ["NVIDIA Compiler Engineer","NVIDIA India","Compiler Engineer","3–6 yrs","Pune","https://nvidia.com/careers"],
  ["Nutanix SWE — Storage","Nutanix India","SWE","3–6 yrs","Bangalore","https://nutanix.com/careers"],
  ["Rubrik Cloud SWE India","Rubrik","SWE","2–5 yrs","Bangalore","https://rubrik.com/careers"],
  ["Harness.io SDE Opening","Harness","SDE","2–5 yrs","Bangalore","https://harness.io/careers"],
  ["CoinDCX Blockchain Eng","CoinDCX","Blockchain Engineer","2–5 yrs","Mumbai","https://coindcx.com/careers"],
  ["Cloudinary SWE — Image CDN","Cloudinary","SWE","2–5 yrs","Remote","https://cloudinary.com/careers"],
  ["HashiCorp SWE India","HashiCorp","SWE","3–6 yrs","Remote","https://hashicorp.com/careers"],
  ["Freshers @ Cognizant 2025","Cognizant","Programmer Analyst","Fresher","Pan India","https://cognizant.com/careers"],
  ["PW Skills SWE — EdTech","Physics Wallah","SWE","1–3 yrs","Noida","https://physicswallah.com/careers"],
  ["Coursera SWE APAC — REMOTE","Coursera","SWE","3–6 yrs","Remote","https://coursera.org/careers"],
  ["Atlassian SRE — Bangalore","Atlassian","SRE","3–6 yrs","Bangalore","https://atlassian.com/careers"],
  ["GitHub SWE — India Remote","GitHub","SWE","3–6 yrs","Remote","https://github.com/careers"],
  ["Stripe SRE India — Payments","Stripe","SRE","3–6 yrs","Bangalore","https://stripe.com/jobs"],
  ["MongoDB SWE — Atlas Search","MongoDB India","SWE","2–5 yrs","Bangalore","https://mongodb.com/careers"],
  ["Datadog SWE — Monitoring","Datadog India","SWE","2–5 yrs","Hyderabad","https://datadog.com/careers"],
  ["Sentry SWE — Error Tracking","Sentry India","SWE","2–5 yrs","Remote","https://sentry.io/careers"],
  ["Linear SWE — Product Tools","Linear","SWE","3–6 yrs","Remote","https://linear.app/careers"],
].map(([title, company, role, exp, loc, link]) => ({
  title, company, role,
  apply_link: link,
  experience: exp,
  location: `${loc}${loc.toLowerCase().includes("remote") ? "" : ", India"}`,
  batch: exp === "Fresher" ? "2024/2025" : "",
  text: `${title}\n\nCompany: ${company}\nRole: ${role}\nExperience: ${exp}\nLocation: ${loc}\nApply: ${link}`,
  date: daysAgo(rand(60) + 1),
  group: "TechJobs",
  sender: "987654321",
  image_url: null,
  source: "Telegram",
  jobHash: md5(`${title}${company}`),
  createdAt: daysAgo(rand(60) + 1),
}));

/* ══════════════════════════════════════════════════════════════════════════
   MAIN SEED FUNCTION
   ══════════════════════════════════════════════════════════════════════════ */
async function seed() {
  console.log("\n🌱  Connecting to MongoDB Atlas…");
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected\n");

  const db = mongoose.connection.db;

  /* ── Wipe everything ─────────────────────────────────────────── */
  console.log("🗑️   Wiping existing data…");
  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    db.collection("timesjob").deleteMany({}),
    db.collection("telegram").deleteMany({}),
    db.collection("hirejobs").deleteMany({}).catch(() => {}),
    db.collection("instahyre").deleteMany({}).catch(() => {}),
  ]);
  console.log("   ✓ All collections cleared\n");

  /* ── 1. Recruiters ────────────────────────────────────────────── */
  console.log("👥  Creating recruiters…");
  const recruiters = [];
  for (const r of RECRUITERS) {
    const u = await User.create({
      name: r.name, email: r.email, password: await hash("Recruiter@123"),
      userRole: "recruiter", companyName: r.company, companyWebsite: r.website,
      position: r.position, phone: r.phone, location: r.location, aboutMe: r.about,
    });
    recruiters.push(u);
    console.log(`   ✓ ${r.name}  (${r.company})`);
  }

  /* ── 2. Job seekers ───────────────────────────────────────────── */
  console.log("\n👤  Creating job seekers…");
  const seekers = [];
  for (const s of SEEKERS) {
    const u = await User.create({
      name: s.name, email: s.email, password: await hash("Seeker@123"),
      userRole: "job_seeker", skills: s.skills, experience: s.exp,
      jobTitle: s.title, location: s.loc, education: s.edu,
      aboutMe: s.about, github: s.github, linkedin: s.linkedin,
      portfolio: s.portfolio || "", projects: s.projects || [],
    });
    seekers.push(u);
    console.log(`   ✓ ${s.name}  (${s.title})`);
  }

  /* ── 3. Recruiter-posted jobs ─────────────────────────────────── */
  console.log("\n💼  Creating recruiter-posted jobs…");
  const recruiterIds = recruiters.map((r) => r._id);
  const jobList = jobs(recruiterIds);
  const insertedJobs = [];
  for (const j of jobList) {
    const created = await Job.create({
      title: j.title, company: j.company, description: j.desc,
      keySkills: j.skills, location: j.location, experience: j.experience,
      salary: j.salary, jobType: j.jobType, workMode: j.workMode,
      status: "active", postedBy: j.postedBy, source: "recruiter",
      applicationsCount: j.apps, views: j.views,
      expiresAt: weeksAhead(j.expires),
      createdAt: daysAgo(j.daysOld),
    });
    insertedJobs.push(created);
    console.log(`   ✓ ${j.title}  @ ${j.company}`);
  }

  /* ── 4. TimesJobs scraped data ────────────────────────────────── */
  console.log("\n🕒  Inserting TimesJobs scraped data…");
  const timesCol = db.collection("timesjob");
  await timesCol.insertMany(TIMES_JOBS);
  console.log(`   ✓ ${TIMES_JOBS.length} entries`);

  /* ── 5. Telegram scraped data ─────────────────────────────────── */
  console.log("\n📱  Inserting Telegram scraped data…");
  const telCol = db.collection("telegram");
  await telCol.insertMany(TEL_JOBS);
  console.log(`   ✓ ${TEL_JOBS.length} entries`);

  /* ── 6. Applications ──────────────────────────────────────────── */
  console.log("\n📋  Creating applications…");
  const STATUSES = ["pending","shortlisted","interview_scheduled","pending","rejected","shortlisted","pending"];
  const appRecs = [];
  for (let si = 0; si < seekers.length; si++) {
    const count = [5, 4, 3, 3, 2, 2, 2][si] || 2;
    const startIdx = si * 5;
    for (let j = 0; j < count && startIdx + j < insertedJobs.length; j++) {
      appRecs.push({
        user: seekers[si]._id,
        jobId: insertedJobs[startIdx + j]._id.toString(),
        title: insertedJobs[startIdx + j].title,
        company: insertedJobs[startIdx + j].company,
        location: insertedJobs[startIdx + j].location,
        applied: true,
        source: "recruiter",
        status: STATUSES[(j + si) % STATUSES.length],
        applicationDate: daysAgo(rand(25) + 1),
      });
    }
  }
  await Application.insertMany(appRecs);
  console.log(`   ✓ ${appRecs.length} applications`);

  /* ── Summary ──────────────────────────────────────────────────── */
  const totalJobs = jobList.length + TIMES_JOBS.length + TEL_JOBS.length;
  console.log(`
╔══════════════════════════════════════════════╗
║         🎉  SEED COMPLETE                    ║
╠══════════════════════════════════════════════╣
║  Recruiters            : ${String(recruiters.length).padEnd(4)} (12 companies)  ║
║  Job Seekers           : ${String(seekers.length).padEnd(4)} (varied skills)  ║
║  Recruiter-posted Jobs : ${String(jobList.length).padEnd(4)} (full descriptions)║
║  TimesJobs scraped     : ${String(TIMES_JOBS.length).padEnd(4)} entries          ║
║  Telegram scraped      : ${String(TEL_JOBS.length).padEnd(4)} entries          ║
║  Total visible jobs    : ${String(totalJobs).padEnd(4)}                  ║
║  Applications          : ${String(appRecs.length).padEnd(4)} (mixed statuses)  ║
╠══════════════════════════════════════════════╣
║  📧 TEST ACCOUNTS                            ║
║  Job Seeker  rohit.verma@gmail.com           ║
║              Seeker@123                      ║
║  Recruiter   priya@razorpay.com              ║
║              Recruiter@123                   ║
╚══════════════════════════════════════════════╝
`);

  await mongoose.disconnect();
}

seed().catch((err) => { console.error("❌  Seed failed:", err.message); mongoose.disconnect(); process.exit(1); });
