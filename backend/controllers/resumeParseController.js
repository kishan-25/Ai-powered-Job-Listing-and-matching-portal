// backend/controllers/resumeParseController.js
const ImageKit = require('imagekit');
const cvHandler = require('../cvHandler');

if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error("Missing required ImageKit environment variables");
}

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const parseResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No resume file uploaded' 
            });
        }

        // Upload the file to ImageKit
        const uploadResult = await imagekit.upload({
            file: req.file.buffer,
            fileName: `resume_${Date.now()}`,
            folder: process.env.IMAGEKIT_UPLOAD_FOLDER || "cv-parser"
        });

        // Process the CV using the cvHandler
        const fileUrl = uploadResult.url;
        const extractedData = await cvHandler(fileUrl);

        // Transform data to match your user model structure
        const transformedData = {
            name: extractedData.firstname && extractedData.lastname 
                ? `${extractedData.firstname} ${extractedData.lastname}` 
                : extractedData.firstname || extractedData.lastname || "",
            email: extractedData.contact?.email || "",
            skills: extractedData.skills || [],
            experience: extractedData.yearOfExperience?.toString() || "",
            role: extractedData.title || "Software Engineer",
            education: extractedData.education?.length 
                ? extractedData.education.map(edu => edu.institution).join(", ") 
                : "",
            linkedin: extractedData.contact?.linkedin || "",
            github: extractedData.contact?.github || "",
            portfolio: extractedData.contact?.portfolio || "",
            aboutMe: extractedData.about || ""
        };

        return res.status(200).json({
            success: true,
            data: transformedData
        });

    } catch (error) {
        console.error("Resume parsing error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to parse resume",
            error: error.message
        });
    }
};

module.exports = { parseResume };