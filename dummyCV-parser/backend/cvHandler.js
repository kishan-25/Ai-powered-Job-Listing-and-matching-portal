const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

async function cvHandler(fileUrl) {
    console.log("📥 Starting CV processing for URL:", fileUrl);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || require("./env").GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error("❌ Gemini API key is not configured");

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

        // Attach extracted URLs for backup or debugging
        cvJson.extractedUrls = rawUrls;

        // ✅ Final debug output
        console.log("✅ Final Extracted CV JSON:\n", JSON.stringify(cvJson, null, 2));

        return cvJson;

    } catch (error) {
        console.error("❌ Error in CV handler:", error);
        throw new Error("Failed to process CV: " + error.message);
    }
}

module.exports = cvHandler;
