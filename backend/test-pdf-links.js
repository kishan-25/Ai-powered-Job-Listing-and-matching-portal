// Standalone test for PDF link extraction
// Run with: node test-pdf-links.js <path-to-pdf>

const fs = require('fs');
const PDFLinkExtractor = require('./utils/pdfLinkExtractor');
const URLClassifier = require('./utils/urlClassifier');

async function testPDFLinkExtraction() {
    const pdfPath = process.argv[2];

    if (!pdfPath) {
        console.log("❌ Please provide a PDF file path:");
        console.log("   node test-pdf-links.js <path-to-pdf>");
        console.log("\nExample:");
        console.log("   node test-pdf-links.js ./BK_CV.pdf");
        process.exit(1);
    }

    if (!fs.existsSync(pdfPath)) {
        console.log("❌ File not found:", pdfPath);
        process.exit(1);
    }

    try {
        console.log("🔗 Testing PDF Link Extraction");
        console.log("=".repeat(60));
        console.log("📄 File:", pdfPath);
        console.log("=".repeat(60) + "\n");

        // Read the PDF file
        const pdfBuffer = fs.readFileSync(pdfPath);
        console.log("✅ PDF file loaded:", pdfBuffer.length, "bytes\n");

        // Extract links
        const extractor = new PDFLinkExtractor();
        const startTime = Date.now();
        const result = await extractor.extractLinks(pdfBuffer);
        const endTime = Date.now();

        console.log("⏱️  Extraction time:", (endTime - startTime) + "ms\n");

        console.log("📊 EXTRACTION RESULTS:");
        console.log("-".repeat(60));
        console.log("📄 Pages:", result.pageCount);
        console.log("🔗 Embedded Links Found:", result.links.length);
        console.log("📝 Text Content Length:", result.textContent.length, "characters");

        if (result.metadata) {
            console.log("\n📋 PDF METADATA:");
            console.log("-".repeat(60));
            Object.entries(result.metadata).forEach(([key, value]) => {
                if (value) {
                    console.log(`  ${key}:`, value);
                }
            });
        }

        if (result.links.length > 0) {
            console.log("\n🔗 EMBEDDED LINKS (from PDF annotations):");
            console.log("-".repeat(60));
            result.links.forEach((link, index) => {
                console.log(`\n  ${index + 1}. ${link.url}`);
                console.log(`     Page: ${link.page}`);
                console.log(`     Type: ${link.type}`);
                console.log(`     Confidence: ${link.confidence}`);
            });
        } else {
            console.log("\n⚠️  No embedded links found in PDF annotations");
            console.log("    This is normal for text-only PDFs without clickable links");
        }

        // Extract links from text content
        console.log("\n🔍 Extracting links from text content...");
        const textLinks = extractor.extractLinksFromText(result.textContent);

        if (textLinks.length > 0) {
            console.log("\n📝 LINKS FROM TEXT:");
            console.log("-".repeat(60));
            textLinks.forEach((link, index) => {
                console.log(`  ${index + 1}. ${link.url}`);
            });
        }

        // Classify all links
        const allLinks = [...result.links, ...textLinks];

        if (allLinks.length > 0) {
            console.log("\n🏷️  CLASSIFYING LINKS...");
            const classifier = new URLClassifier();
            const classified = classifier.classifyMultiple(allLinks);

            console.log("\n📱 CLASSIFIED SOCIAL LINKS:");
            console.log("-".repeat(60));

            Object.entries(classified).forEach(([platform, data]) => {
                if (data && !Array.isArray(data)) {
                    console.log(`\n  ${platform.toUpperCase()}:`);
                    console.log(`    URL: ${data.url}`);
                    console.log(`    Username: ${data.username || 'N/A'}`);
                    console.log(`    Confidence: ${data.confidence}`);
                } else if (Array.isArray(data) && data.length > 0) {
                    console.log(`\n  ${platform.toUpperCase()}:`);
                    data.forEach((item, idx) => {
                        console.log(`    ${idx + 1}. ${item.url}`);
                    });
                }
            });
        } else {
            console.log("\n⚠️  No links found in the PDF");
        }

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
testPDFLinkExtraction();
