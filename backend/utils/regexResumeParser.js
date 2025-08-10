const pdf = require('pdf-parse');
const axios = require('axios');

/**
 * Regex-based resume parser as primary extraction method
 * Falls back to Gemini AI only if extraction is incomplete
 */

class RegexResumeParser {
    constructor() {
        // Common regex patterns for resume parsing
        this.patterns = {
            email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
            phone: /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
            linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9_-]+/gi,
            github: /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_-]+/gi,
            portfolio: /(?:https?:\/\/)?(?:[\w-]+\.)?(?:vercel\.app|netlify\.app|herokuapp\.com|github\.io)(?:\/[\w-]*)?/gi,
            leetcode: /(?:https?:\/\/)?(?:www\.)?leetcode\.com\/[A-Za-z0-9_-]+/gi,
            
            // Name patterns (usually at the top of resume)
            name: /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/m,
            
            // Experience patterns
            experience: /(\d+)(?:\+)?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi,
            
            // Skills section patterns
            skillsSection: /(?:skills?|technical\s*skills?|technologies?|programming\s*languages?)[:\s]*([^]*?)(?=\n\s*[A-Z][^:]*:|$)/gi,
            
            // Education patterns
            education: /(?:education|academic|qualification)[:\s]*([^]*?)(?=\n\s*[A-Z][^:]*:|$)/gi,
            
            // Job titles/roles
            jobTitles: /(?:software\s*engineer|developer|programmer|analyst|manager|intern|consultant|architect|lead|senior|junior|full\s*stack|front\s*end|back\s*end|devops|data\s*scientist|product\s*manager)/gi
        };

        // Common skills to look for
        this.commonSkills = [
            'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
            'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
            'HTML', 'CSS', 'SCSS', 'Sass', 'Bootstrap', 'Tailwind', 'Material-UI', 'Chakra UI',
            'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'Redis', 'Firebase', 'Supabase',
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
            'TypeScript', 'GraphQL', 'REST API', 'Microservices', 'Machine Learning', 'AI',
            'Data Analysis', 'SQL', 'NoSQL', 'Linux', 'Windows', 'macOS', 'Agile', 'Scrum'
        ];
    }

    async extractFromPDF(fileUrl) {
        try {
            console.log("🔍 Starting regex-based extraction for:", fileUrl);
            
            // Download the PDF file
            const response = await axios({
                method: 'GET',
                url: fileUrl,
                responseType: 'arraybuffer',
                maxContentLength: 50 * 1024 * 1024,
                timeout: 30000
            });

            // Parse PDF to text
            const pdfBuffer = Buffer.from(response.data);
            const pdfData = await pdf(pdfBuffer);
            const text = pdfData.text;

            console.log("📄 Extracted text length:", text.length);

            // Extract data using regex patterns
            const extractedData = this.parseTextWithRegex(text);
            
            // Calculate completeness score
            const completenessScore = this.calculateCompleteness(extractedData);
            
            console.log("📊 Extraction completeness score:", completenessScore);
            
            return {
                data: extractedData,
                completenessScore,
                rawText: text,
                isComplete: completenessScore >= 0.6 // 60% threshold
            };

        } catch (error) {
            console.error("❌ Regex extraction failed:", error);
            return {
                data: null,
                completenessScore: 0,
                rawText: null,
                isComplete: false,
                error: error.message
            };
        }
    }

    parseTextWithRegex(text) {
        const data = {
            firstname: "",
            lastname: "",
            about: "",
            title: "",
            yearOfExperience: 0,
            education: [],
            experience: [],
            skills: [],
            socialLinks: [
                { "name": "Linkedin", "url": "" },
                { "name": "Github", "url": "" },
                { "name": "Leetcode", "url": "" },
                { "name": "Portfolio", "url": "" }
            ],
            contact: {
                email: "",
                phone: "",
                linkedin: "",
                github: "",
                portfolio: "",
                leetcode: ""
            }
        };

        // Extract basic contact information
        const emails = text.match(this.patterns.email) || [];
        const phones = text.match(this.patterns.phone) || [];
        
        if (emails.length > 0) data.contact.email = emails[0];
        if (phones.length > 0) data.contact.phone = phones[0];

        // Extract social links
        const linkedinMatches = text.match(this.patterns.linkedin) || [];
        const githubMatches = text.match(this.patterns.github) || [];
        const portfolioMatches = text.match(this.patterns.portfolio) || [];
        const leetcodeMatches = text.match(this.patterns.leetcode) || [];

        if (linkedinMatches.length > 0) {
            data.contact.linkedin = linkedinMatches[0];
            data.socialLinks.find(link => link.name === "Linkedin").url = linkedinMatches[0];
        }
        if (githubMatches.length > 0) {
            data.contact.github = githubMatches[0];
            data.socialLinks.find(link => link.name === "Github").url = githubMatches[0];
        }
        if (portfolioMatches.length > 0) {
            data.contact.portfolio = portfolioMatches[0];
            data.socialLinks.find(link => link.name === "Portfolio").url = portfolioMatches[0];
        }
        if (leetcodeMatches.length > 0) {
            data.contact.leetcode = leetcodeMatches[0];
            data.socialLinks.find(link => link.name === "Leetcode").url = leetcodeMatches[0];
        }

        // Extract name (usually first line or prominent text)
        const nameMatch = text.match(this.patterns.name);
        if (nameMatch) {
            const fullName = nameMatch[1].trim();
            const nameParts = fullName.split(' ');
            data.firstname = nameParts[0] || "";
            data.lastname = nameParts.slice(1).join(' ') || "";
        }

        // Extract experience years
        const expMatches = text.match(this.patterns.experience) || [];
        if (expMatches.length > 0) {
            const expMatch = expMatches[0].match(/(\d+)/);
            if (expMatch) {
                data.yearOfExperience = parseInt(expMatch[1]);
            }
        }

        // Extract job title
        const titleMatches = text.match(this.patterns.jobTitles) || [];
        if (titleMatches.length > 0) {
            data.title = titleMatches[0];
        }

        // Extract skills
        data.skills = this.extractSkills(text);

        // Extract education (basic)
        const educationMatch = text.match(this.patterns.education);
        if (educationMatch) {
            const educationText = educationMatch[1];
            // Simple education extraction - can be enhanced
            const educationLines = educationText.split('\n').filter(line => line.trim().length > 0);
            data.education = educationLines.slice(0, 3).map(line => ({ degree: line.trim() }));
        }

        // Create basic about section from available data
        if (data.title && data.yearOfExperience > 0) {
            data.about = `${data.title} with ${data.yearOfExperience} years of experience`;
        }

        return data;
    }

    extractSkills(text) {
        const foundSkills = [];
        const textLower = text.toLowerCase();

        // Look for common skills
        this.commonSkills.forEach(skill => {
            const skillLower = skill.toLowerCase();
            if (textLower.includes(skillLower)) {
                foundSkills.push(skill);
            }
        });

        // Look for skills in dedicated skills section
        const skillsMatch = text.match(this.patterns.skillsSection);
        if (skillsMatch) {
            const skillsText = skillsMatch[1];
            const additionalSkills = skillsText.split(/[,\n•\-\|]/)
                .map(skill => skill.trim())
                .filter(skill => skill.length > 2 && skill.length < 30)
                .slice(0, 10); // Limit to 10 additional skills

            foundSkills.push(...additionalSkills);
        }

        // Remove duplicates and return
        return [...new Set(foundSkills)].slice(0, 15); // Limit to 15 skills total
    }

    calculateCompleteness(data) {
        let score = 0;
        let maxScore = 0;

        // Essential fields (higher weight)
        const essentialFields = [
            { field: 'firstname', weight: 0.15 },
            { field: 'contact.email', weight: 0.15 },
            { field: 'skills', weight: 0.20, isArray: true },
            { field: 'title', weight: 0.10 }
        ];

        // Important fields (medium weight)
        const importantFields = [
            { field: 'lastname', weight: 0.10 },
            { field: 'yearOfExperience', weight: 0.10 },
            { field: 'contact.phone', weight: 0.05 },
            { field: 'contact.linkedin', weight: 0.05 }
        ];

        // Optional fields (lower weight)
        const optionalFields = [
            { field: 'contact.github', weight: 0.05 },
            { field: 'contact.portfolio', weight: 0.05 }
        ];

        const allFields = [...essentialFields, ...importantFields, ...optionalFields];

        allFields.forEach(({ field, weight, isArray }) => {
            maxScore += weight;
            
            const value = this.getNestedValue(data, field);
            
            if (isArray) {
                if (Array.isArray(value) && value.length > 0) {
                    score += weight;
                }
            } else {
                if (value && value.toString().trim().length > 0) {
                    score += weight;
                }
            }
        });

        return score / maxScore;
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }
}

module.exports = RegexResumeParser;
