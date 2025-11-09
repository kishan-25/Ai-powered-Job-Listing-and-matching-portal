// Test script for resume extraction with embedded link support
// Run with: node test-resume-extraction.js

const cvHandler = require('./cvHandler');

async function testResumeExtraction() {
    console.log("🧪 Starting Resume Extraction Test\n");
    console.log("=" . repeat(60));

    // Test with a real resume URL from ImageKit or any accessible URL
    const testResumeUrl = process.argv[2] || "PASTE_YOUR_RESUME_URL_HERE";

    if (testResumeUrl === "PASTE_YOUR_RESUME_URL_HERE") {
        console.log("❌ Please provide a resume URL as argument:");
        console.log("   node test-resume-extraction.js <resume-url>");
        console.log("\nExample:");
        console.log("   node test-resume-extraction.js https://ik.imagekit.io/ocxypkiqc/cv-parser/resume_1234567890");
        process.exit(1);
    }

    try {
        console.log("📥 Processing resume from:", testResumeUrl);
        console.log("=" . repeat(60) + "\n");

        const startTime = Date.now();
        const result = await cvHandler(testResumeUrl);
        const endTime = Date.now();

        console.log("\n" + "=".repeat(60));
        console.log("✅ EXTRACTION COMPLETE!");
        console.log("=".repeat(60));

        console.log("\n📊 EXTRACTION SUMMARY:");
        console.log("-".repeat(60));
        console.log("⏱️  Processing Time:", (endTime - startTime) + "ms");
        console.log("👤 Name:", result.firstname, result.lastname);
        console.log("📧 Email:", result.contact?.email || "Not found");
        console.log("📱 Phone:", result.contact?.phone || "Not found");
        console.log("💼 Title:", result.title || "Not found");
        console.log("📅 Experience:", result.yearOfExperience, "years");
        console.log("🎯 Skills Count:", result.skills?.length || 0);

        console.log("\n🔗 EXTRACTED LINKS:");
        console.log("-".repeat(60));
        console.log("LinkedIn:", result.contact?.linkedin || "❌ Not found");
        console.log("GitHub:", result.contact?.github || "❌ Not found");
        console.log("Portfolio:", result.contact?.portfolio || "❌ Not found");
        console.log("LeetCode:", result.contact?.leetcode || "❌ Not found");
        console.log("Codolio:", result.contact?.codolio || "❌ Not found");

        if (result.socialLinks && result.socialLinks.length > 0) {
            console.log("\n📱 SOCIAL LINKS (Structured):");
            console.log("-".repeat(60));
            result.socialLinks.forEach(link => {
                if (link.url) {
                    console.log(`  ${link.name}: ${link.url}`);
                }
            });
        }

        if (result.skills && result.skills.length > 0) {
            console.log("\n🛠️  SKILLS EXTRACTED:");
            console.log("-".repeat(60));
            console.log(result.skills.join(", "));
        }

        if (result.education && result.education.length > 0) {
            console.log("\n🎓 EDUCATION:");
            console.log("-".repeat(60));
            result.education.forEach((edu, index) => {
                console.log(`  ${index + 1}. ${edu.institution || edu.degree || JSON.stringify(edu)}`);
            });
        }

        if (result.extractedUrls && result.extractedUrls.length > 0) {
            console.log("\n🌐 ALL EXTRACTED URLS:");
            console.log("-".repeat(60));
            result.extractedUrls.forEach(url => {
                console.log(`  • ${url}`);
            });
        }

        console.log("\n📝 FULL RESULT (JSON):");
        console.log("=".repeat(60));
        console.log(JSON.stringify(result, null, 2));

        console.log("\n✅ Test completed successfully!");

    } catch (error) {
        console.error("\n❌ TEST FAILED:");
        console.error("Error:", error.message);
        console.error("\nStack trace:");
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the test
testResumeExtraction();
