require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require('multer');
const ImageKit = require('imagekit');
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const applicationRoutes = require('./routes/applicationRoutes');
const jobRoutes = require('./routes/jobRoutes');
const cvHandler = require('./cvHandler');
const resumeRoutes = require('./routes/resumeRoute');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const recruiterRoutes = require('./routes/recruiterRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const generateCoverLetterRoute = require("./routes/generateCoverLetter");
const { protect } = require("./middlewares/authMiddleware");

const app = express();

// Rate limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later." }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many login attempts, please try again in 15 minutes." }
});

app.use(globalLimiter);

const ALLOWED_ORIGINS = [
    // localhost (dev)
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://10.91.49.94:3001",
    // production
    "https://talentalign.vercel.app",
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, mobile apps)
        if (!origin) return callback(null, true);
        // Allow any LAN IP on port 3000 or 3001 (useful for mobile testing on same network)
        if (/^http:\/\/10\.\d+\.\d+\.\d+:(3000|3001)$/.test(origin)) return callback(null, true);
        if (/^http:\/\/192\.168\.\d+\.\d+:(3000|3001)$/.test(origin)) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(express.json());

app.get("/", (req,res) => {
    res.json({
        success:true,
        message: "API is running"
    });
});

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;
const IMAGEKIT_UPLOAD_FOLDER = process.env.IMAGEKIT_UPLOAD_FOLDER; 


// Initialize ImageKit with explicit values
const imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT
});

// File upload endpoint — no auth required: used during registration before the user has a token
app.post('/upload-cv', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Upload file to ImageKit
        const uploadResult = await imagekit.upload({
            file: req.file.buffer,
            fileName: `cv_${Date.now()}`,
            folder: IMAGEKIT_UPLOAD_FOLDER
        });

        // Return the URL of the uploaded file
        res.json({ 
            success: true, 
            fileUrl: uploadResult.url 
        });
    } catch (error) {
        console.error('Error uploading file to ImageKit:', error);
        res.status(500).json({ message: 'Failed to upload file' });
    }
});

app.post('/process-cv', async(req, res) => {
    const { fileUrl } = req.body;

    if(!fileUrl) {
        return res.status(400).json({ message: 'fileUrl is required' });
    }

    try {
        const result = await cvHandler(fileUrl);
        res.json(result);
    } catch(err) {
        console.error("Error processing CV:", err);
        res.status(500).json({ message: err.message });
    }
});


app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api/v1/auth", authLimiter, authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use("/api/v1/cover-letter", generateCoverLetterRoute);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/recruiter', recruiterRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/users', userRoutes);

// Global error handler — must be after all routes
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));

connectDB();