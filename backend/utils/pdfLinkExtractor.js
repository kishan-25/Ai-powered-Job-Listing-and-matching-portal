// backend/utils/pdfLinkExtractor.js

/**
 * Extracts embedded links and annotations from PDF files
 * This captures clickable links that may not appear as text
 */
class PDFLinkExtractor {
    constructor() {
        this.pdfjsLib = null;
    }

    /**
     * Lazy load pdfjs-dist using dynamic import
     */
    async loadPdfLib() {
        if (!this.pdfjsLib) {
            this.pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
            // Disable worker to avoid canvas dependencies in Node.js
            if (this.pdfjsLib.GlobalWorkerOptions) {
                this.pdfjsLib.GlobalWorkerOptions.workerSrc = null;
            }
        }
        return this.pdfjsLib;
    }

    /**
     * Extract all links from a PDF buffer
     * @param {Buffer} pdfBuffer - PDF file buffer
     * @returns {Promise<Object>} Extracted links and metadata
     */
    async extractLinks(pdfBuffer) {
        try {
            console.log("🔗 Starting PDF link extraction...");

            // Dynamically load pdfjs-dist
            const pdfjsLib = await this.loadPdfLib();

            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(pdfBuffer),
                useSystemFonts: true,
                disableFontFace: true,
            });

            const pdfDocument = await loadingTask.promise;
            const numPages = pdfDocument.numPages;

            console.log(`📄 Processing ${numPages} pages...`);

            const allLinks = [];
            const textContent = [];

            // Process each page
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdfDocument.getPage(pageNum);

                // Extract annotations (embedded links)
                const annotations = await page.getAnnotations();

                annotations.forEach(annotation => {
                    if (annotation.subtype === 'Link') {
                        const linkData = {
                            url: annotation.url || annotation.dest,
                            page: pageNum,
                            type: 'pdf_annotation',
                            confidence: 1.0,
                            rect: annotation.rect
                        };

                        if (linkData.url && typeof linkData.url === 'string') {
                            allLinks.push(linkData);
                        }
                    }
                });

                // Extract text content for additional context
                const text = await page.getTextContent();
                const pageText = text.items.map(item => item.str).join(' ');
                textContent.push(pageText);
            }

            // Get metadata
            const metadata = await pdfDocument.getMetadata();

            console.log(`✅ Extracted ${allLinks.length} embedded links`);

            return {
                links: this.deduplicateLinks(allLinks),
                textContent: textContent.join('\n'),
                metadata: metadata.info,
                pageCount: numPages
            };

        } catch (error) {
            console.error("❌ PDF link extraction failed:", error.message);
            return {
                links: [],
                textContent: '',
                metadata: {},
                pageCount: 0,
                error: error.message
            };
        }
    }

    /**
     * Extract links from text content using regex patterns
     * @param {string} text - Text to search
     * @returns {Array} Found URLs
     */
    extractLinksFromText(text) {
        const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
        const matches = text.match(urlPattern) || [];

        return matches.map(url => ({
            url: url.trim(),
            type: 'text_extraction',
            confidence: 0.8
        }));
    }

    /**
     * Remove duplicate links
     * @param {Array} links - Array of link objects
     * @returns {Array} Deduplicated links
     */
    deduplicateLinks(links) {
        const seen = new Set();
        return links.filter(link => {
            const normalized = this.normalizeUrl(link.url);
            if (seen.has(normalized)) {
                return false;
            }
            seen.add(normalized);
            return true;
        });
    }

    /**
     * Normalize URL for comparison
     * @param {string} url - URL to normalize
     * @returns {string} Normalized URL
     */
    normalizeUrl(url) {
        try {
            let normalized = url.toLowerCase().trim();

            // Add protocol if missing
            if (!normalized.startsWith('http')) {
                normalized = 'https://' + normalized;
            }

            // Remove trailing slash
            normalized = normalized.replace(/\/$/, '');

            // Remove www.
            normalized = normalized.replace(/^(https?:\/\/)www\./, '$1');

            return normalized;
        } catch (error) {
            return url;
        }
    }
}

module.exports = PDFLinkExtractor;
