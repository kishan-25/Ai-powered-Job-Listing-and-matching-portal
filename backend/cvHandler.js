const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');
const RegexResumeParser = require('./utils/regexResumeParser');

async function cvHandler(fileUrl) {
    console.log("📥 Starting CV processing for URL:", fileUrl);

    const regexParser = new RegexResumeParser();
    
    try {
        // STEP 1: Try regex-based extraction first
        console.log("🔍 Attempting regex-based extraction...");
        const regexResult = await regexParser.extractFromPDF(fileUrl);
        
        if (regexResult.isComplete && regexResult.data) {
            console.log("✅ Regex extraction successful! Completeness:", regexResult.completenessScore);
            console.log("✅ Final Extracted CV JSON (Regex):\n", JSON.stringify(regexResult.data, null, 2));
            return regexResult.data;
        }
        
        console.log("⚠️ Regex extraction incomplete. Completeness:", regexResult.completenessScore);
        console.log("🤖 Falling back to Gemini AI...");
        
        // STEP 2: Fallback to Gemini AI if regex extraction is incomplete
        return await processWithGemini(fileUrl, regexResult.data);
        
    } catch (error) {
        console.error("❌ Error in CV handler:", error);
        throw new Error("Failed to process CV: " + error.message);
    }
}

async function processWithGemini(fileUrl, regexData = null) {
    console.log("🤖 Processing with Gemini AI...");
    
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        console.log("❌ Gemini API key not configured, using regex data only");
        if (regexData) {
            return regexData;
        }
        throw new Error("Gemini API key is not configured and regex extraction failed");
    }

    try {
        const downloadResponse = await axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'arraybuffer',
            maxContentLength: 50 * 1024 * 1024,
            timeout: 30000
        });

        const pdfFileData = downloadResponse.data;
        const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const prompt = `
You're a document parser for resumes. Extract structured information from the attached PDF.

📌 Specific Instructions:
- Scan the entire resume for links (even at the bottom of the document).
- Identify and assign social/contact links based on these rules:
  - "linkedin.com" → linkedin
  - "github.com" → github
  - "vercel.app", "netlify.app" → portfolio
  - "leetcode.com" → leetcode
- Populate both 'socialLinks' and 'contact' accordingly.
- Return ONLY a stringified JSON object. No extra text.

JSON structure:
{
  "firstname": "",
  "lastname": "",
  "about": "",
  "title": "",
  "yearOfExperience": 0,
  "education": [],
  "experience": [],
  "skills": [],
  "socialLinks": [
    { "name": "Linkedin", "url": "" },
    { "name": "Github", "url": "" },
    { "name": "Leetcode", "url": "" },
    { "name": "Portfolio", "url": "" }
  ],
  "contact": {
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "portfolio": "",
    "leetcode": ""
  }
}
`;

        const contents = [
            { text: prompt },
            {
                inlineData: {
                    data: Buffer.from(pdfFileData).toString('base64'),
                    mimeType: 'application/pdf'
                }
            }
        ];

        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents
        });

        const text = result.text;
        let jsonString = text.replace(/```json|```/g, "").trim();

        const rawUrls = [...new Set(text.match(/https?:\/\/[^\s")]+/g))] || [];

        const findLink = (keyword) =>
            rawUrls.find((url) => url.toLowerCase().includes(keyword)) || "";

        const fallbackLinks = {
            linkedin: findLink("linkedin"),
            github: findLink("github"),
            portfolio: findLink("vercel") || findLink("netlify"),
            leetcode: findLink("leetcode")
        };

        let cvJson;
        try {
            cvJson = JSON.parse(jsonString);
        } catch (err) {
            console.error("❌ JSON parse error:", err);
            console.log("⚠️ Failed JSON string:", jsonString);
            throw new Error("Gemini output could not be parsed into JSON.");
        }

        // Validate and fallback assignment
        const isValidUrl = (url) => typeof url === 'string' && url.startsWith('http');

        if (!isValidUrl(cvJson.contact.linkedin)) cvJson.contact.linkedin = fallbackLinks.linkedin;
        if (!isValidUrl(cvJson.contact.github)) cvJson.contact.github = fallbackLinks.github;
        if (!isValidUrl(cvJson.contact.portfolio)) cvJson.contact.portfolio = fallbackLinks.portfolio;
        if (!isValidUrl(cvJson.contact.leetcode)) cvJson.contact.leetcode = fallbackLinks.leetcode;

        // Update or insert proper socialLinks
        const updateOrInsertSocialLink = (platform, url) => {
            const existing = cvJson.socialLinks.find(l => l.name.toLowerCase() === platform.toLowerCase());
            const isValid = isValidUrl(existing?.url);
            if (existing && !isValid && url) {
                existing.url = url;
            } else if (!existing && url) {
                cvJson.socialLinks.push({ name: platform, url });
            }
        };

        updateOrInsertSocialLink("Linkedin", fallbackLinks.linkedin);
        updateOrInsertSocialLink("Github", fallbackLinks.github);
        updateOrInsertSocialLink("Leetcode", fallbackLinks.leetcode);
        updateOrInsertSocialLink("Portfolio", fallbackLinks.portfolio);

        // Normalize incorrect skill names
        if (Array.isArray(cvJson.skills)) {
            cvJson.skills = cvJson.skills.map(skill =>
                skill.toLowerCase() === "shaden ui" ? "shadcn/ui" : skill
            );
        }

        cvJson.extractedUrls = rawUrls;

        // ✅ Final debug output
        console.log("✅ Final Extracted CV JSON:\n", JSON.stringify(cvJson, null, 2));

        // If we have regex data, merge it with Gemini results for better accuracy
        if (regexData) {
            cvJson = mergeExtractionResults(regexData, cvJson);
            console.log("🔄 Merged regex and Gemini results");
        }
        
        return cvJson;

    } catch (error) {
        console.error("❌ Gemini processing failed:", error);
        
        // If Gemini fails but we have regex data, use that
        if (regexData) {
            console.log("⚠️ Using regex data as fallback due to Gemini failure");
            return regexData;
        }
        
        throw new Error("Failed to process CV: " + error.message);
    }
}

/**
 * Merge regex and Gemini extraction results, preferring more complete data
 */
function mergeExtractionResults(regexData, geminiData) {
    const merged = { ...geminiData };
    
    // Prefer non-empty values from either source
    const mergeField = (field) => {
        const regexValue = getNestedValue(regexData, field);
        const geminiValue = getNestedValue(geminiData, field);
        
        if (Array.isArray(regexValue) && Array.isArray(geminiValue)) {
            // For arrays, combine and deduplicate
            const combined = [...regexValue, ...geminiValue];
            return [...new Set(combined)].filter(item => item && item.toString().trim());
        } else {
            // For strings/numbers, prefer non-empty values
            return (regexValue && regexValue.toString().trim()) ? regexValue : geminiValue;
        }
    };
    
    // Merge key fields
    setNestedValue(merged, 'firstname', mergeField('firstname'));
    setNestedValue(merged, 'lastname', mergeField('lastname'));
    setNestedValue(merged, 'contact.email', mergeField('contact.email'));
    setNestedValue(merged, 'contact.phone', mergeField('contact.phone'));
    setNestedValue(merged, 'contact.linkedin', mergeField('contact.linkedin'));
    setNestedValue(merged, 'contact.github', mergeField('contact.github'));
    setNestedValue(merged, 'contact.portfolio', mergeField('contact.portfolio'));
    setNestedValue(merged, 'skills', mergeField('skills'));
    setNestedValue(merged, 'title', mergeField('title'));
    setNestedValue(merged, 'yearOfExperience', mergeField('yearOfExperience'));
    
    return merged;
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
}

function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
        if (!current[key]) current[key] = {};
        return current[key];
    }, obj);
    target[lastKey] = value;
}

module.exports = cvHandler;