require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require('multer');
const ImageKit = require('imagekit');
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
const { exec } = require("child_process");
const generateCoverLetterRoute = require("./routes/generateCoverLetter");

const app = express();
app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "https://talentalign.vercel.app"], // Add your frontend URLs
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
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

// File upload endpoint
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


// ✅ Add these middlewares

app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api/v1/auth", authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use("/api/v1/cover-letter", generateCoverLetterRoute);
app.use('/api/v1/resume', resumeRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/recruiter', recruiterRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server is runnig on PORT : ${PORT}`));

//Database Connection
// Test function
// const testDBWrite = async () => {
//     try {
//       const testJob = new Job({
//         title: "Test Job",
//         company: "Test Company",
//         source: "Manual Test",
//         text: "This is a test job posting"
//       });
      
//       const saved = await testJob.save();
//       console.log("Test job saved successfully:", saved);
//     } catch (err) {
//       console.error("Error saving test job:", err);
//     }
//   };
  
//   // Call after database connection
//   connectDB().then(() => {
//     testDBWrite();
//   });

connectDB();

//   const runScrapers = async () => {
//         console.log("🔄 Running dummy...");
        
//         const scriptsDir = path.join(__dirname, "scripts");
       
//         const dummyPath = path.join(scriptsDir, "dummyScript.py");

//   try {
//             console.log("📊 Starting python script...");
//             await new Promise((resolve, reject) => {
//                 exec(`python "${dummyPath}"`, (error, stdout, stderr) => {
//                     if (error) {
//                         console.error(`❌ dummy Error: ${error.message}`);
//                         reject(error);
//                         return;
//                     }
//                     if (stderr) console.error(`⚠ Website Scraper Stderr: ${stderr}`);
//                     console.log(`✅ dummy Output: ${stdout}`);
//                     resolve();
//                 });
//             });
            
//         } catch (err) {
//             console.error("❌ Error running scrapers:", err);
//         }
//   }

//   runScrapers();


//scrapper run
const runScrapers = async () => {
    console.log("🔄 Running scrapers...");
    
    const scriptsDir = path.join(__dirname, "scripts");
    const telegramScraperPath = path.join(scriptsDir, "telegram_scraper.py");
    const websiteScraperPath = path.join(scriptsDir, "website_scraper.py");

    // Run Website Scraper first
    try {
        console.log("📊 Starting Website Scraper...");
        await new Promise((resolve, reject) => {
            exec(`python "${websiteScraperPath}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Website Scraper Error: ${error.message}`);
                    reject(error);
                    return;
                }
                if (stderr) console.error(`⚠ Website Scraper Stderr: ${stderr}`);
                console.log(`✅ Website Scraper Output: ${stdout}`);
                resolve();
            });
        });
        
        // Then run Telegram Scraper
        console.log("📱 Starting Telegram Scraper...");
        await new Promise((resolve, reject) => {
            exec(`python "${telegramScraperPath}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Telegram Scraper Error: ${error.message}`);
                    reject(error);
                    return;
                }
                if (stderr) console.error(`⚠ Telegram Scraper Stderr: ${stderr}`);
                console.log(`✅ Telegram Scraper Output: ${stdout}`);
                resolve();
            });
        });
        
        console.log("✅ All scrapers completed successfully!");
    } catch (err) {
        console.error("❌ Error running scrapers:", err);
    }
};

// const telegramScrapers = async () => {
//     console.log("🔄 Running scrapers...");
    
//     const scriptsDir = path.join(__dirname, "scripts");
//     const telegramScraperPath = path.join(scriptsDir, "telegram_scraper.py");

//     // Run Website Scraper first
//     try {
        
//         // Then run Telegram Scraper
//         console.log("📱 Starting Telegram Scraper...");
//         await new Promise((resolve, reject) => {
//             exec(`python "${telegramScraperPath}"`, (error, stdout, stderr) => {
//                 if (error) {
//                     console.error(`❌ Telegram Scraper Error: ${error.message}`);
//                     reject(error);
//                     return;
//                 }
//                 if (stderr) console.error(`⚠ Telegram Scraper Stderr: ${stderr}`);
//                 console.log(`✅ Telegram Scraper Output: ${stdout}`);
//                 resolve();
//             });
//         });
        
//         console.log("✅ All scrapers completed successfully!");
//     } catch (err) {
//         console.error("❌ Error running scrapers:", err);
//     }
// };

// // Run scrapers immediately on startup
// runScrapers();

// telegramScrapers();

// // Run scrapers every 24 hours (86400000 ms)
// setInterval(runScrapers, 24 * 60 * 60 * 1000);