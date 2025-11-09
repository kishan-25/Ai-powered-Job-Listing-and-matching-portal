const { GoogleGenAI } = require("@google/genai");

const generateCoverLetter = async (req, res) => {
   // Verify user is authenticated (middleware should have added req.user)
   if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  const { jobTitle, companyName, skills, experience, userName } = req.body;
  
  // Validate required fields
  if (!jobTitle || !companyName) {
    return res.status(400).json({
      success: false,
      message: "Job title and company name are required"
    });
  }

  try {
    // Validate API key first
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("API key for Gemini is not configured");
    }

    // Initialize the API client with new @google/genai package
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `Craft a concise, authentic-sounding cover letter for ${userName} applying for the ${jobTitle} position at ${companyName}. The tone should be professional but conversational — like a real person who knows their stuff and isn’t trying too hard to sound perfect.

    INSTRUCTIONS:
    - Write like a confident developer who’s talking directly to the hiring team
    - Use natural sentence structure with a smooth, slightly informal flow
    - Avoid overly polished or generic language — it’s okay to sound human
    - Add small, natural imperfections or quirks (e.g., contractions, varied sentence lengths)
    - Keep it under 300 words, ideally 3–4 paragraphs
    
    INCLUDE:
    - Today’s date: ${new Date().toLocaleDateString()}
    - Greeting: Start with “Dear Hiring Team,” (not “Dear Hiring Manager”)
    - Signature: Sign off with “Warm regards,” followed by applicant’s name
    
    DETAILS TO HIGHLIGHT:
    - Name: ${userName}
    - Job Title: ${jobTitle}
    - Company: ${companyName}
    - Skills: ${Array.isArray(skills) ? skills.join(", ") : skills}
    - Experience: ${experience} years
    - Projects: Mention 1–2 actual projects or work examples with specific technologies
    
    CONTENT SUGGESTIONS:
    - Start with what genuinely excites the applicant about the role/company
    - Drop in a couple of specific technologies used recently
    - Briefly describe a project that reflects relevant experience
    - Wrap up with an approachable note and interest in moving forward
    
    AVOID:
    - Phrases like "I am writing to express..." or "I believe I’m a perfect fit"
    - Repetitive adjectives like “passionate” or “highly motivated”
    - Anything that sounds like AI wrote it — keep it warm and human`;
    
    // Generate content with new API
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    const text = result.text;

    res.status(200).json({ success: true, coverLetter: text });
  } catch (error) {
    console.error("Gemini cover letter generation error:", error);
    
    // More specific error messages based on error type
    if (error.message.includes("API key")) {
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate cover letter", 
      error: error.message 
    });
  }
};

module.exports = { generateCoverLetter };