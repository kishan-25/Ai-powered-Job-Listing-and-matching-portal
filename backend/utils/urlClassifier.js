// backend/utils/urlClassifier.js

/**
 * Classifies URLs into categories (LinkedIn, GitHub, Portfolio, etc.)
 * and validates/normalizes them
 */
class URLClassifier {
    constructor() {
        this.patterns = {
            linkedin: /linkedin\.com\/in\/([A-Za-z0-9_-]+)/i,
            github: /github\.com\/([A-Za-z0-9_-]+)(?!\/orgs|\/topics|\/explore)/i,
            portfolio: /(?:vercel\.app|netlify\.app|github\.io|herokuapp\.com|render\.com|personal|portfolio)/i,
            leetcode: /leetcode\.com\/(?:u\/)?([A-Za-z0-9_-]+)/i,
            codolio: /codolio\.com\/profile\/([A-Za-z0-9_-]+)/i,
            twitter: /(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)/i,
            stackoverflow: /stackoverflow\.com\/users\/(\d+)/i,
            medium: /medium\.com\/@?([A-Za-z0-9_-]+)/i,
            youtube: /youtube\.com\/(?:c\/|channel\/|@)?([A-Za-z0-9_-]+)/i,
            behance: /behance\.net\/([A-Za-z0-9_-]+)/i,
            dribbble: /dribbble\.com\/([A-Za-z0-9_-]+)/i,
            email: /^mailto:(.+)/i
        };
    }

    
    classify(url, context = '') {
        const normalized = this.normalizeUrl(url);

        for (const [platform, pattern] of Object.entries(this.patterns)) {
            if (pattern.test(normalized)) {
                const match = normalized.match(pattern);
                return {
                    platform,
                    url: normalized,
                    username: match[1] || null,
                    confidence: 1.0
                };
            }
        }

        // Try context-based classification if pattern didn't match
        if (context) {
            const contextLower = context.toLowerCase();
            for (const platform of Object.keys(this.patterns)) {
                if (contextLower.includes(platform)) {
                    return {
                        platform,
                        url: normalized,
                        username: null,
                        confidence: 0.7
                    };
                }
            }
        }

        // Check if it's a personal portfolio domain
        if (this.isLikelyPortfolio(normalized)) {
            return {
                platform: 'portfolio',
                url: normalized,
                username: null,
                confidence: 0.8
            };
        }

        return {
            platform: 'other',
            url: normalized,
            username: null,
            confidence: 0.5
        };
    }

  
    classifyMultiple(links) {
        const classified = {
            linkedin: null,
            github: null,
            portfolio: null,
            leetcode: null,
            codolio: null,
            twitter: null,
            stackoverflow: null,
            medium: null,
            email: null,
            other: []
        };

        links.forEach(link => {
            const result = this.classify(link.url, link.context);

            if (classified[result.platform] === null || Array.isArray(classified[result.platform])) {
                if (result.platform === 'other') {
                    classified.other.push(result);
                } else {
                    // Only keep the first (most confident) link for each platform
                    if (!classified[result.platform] || result.confidence > classified[result.platform].confidence) {
                        classified[result.platform] = result;
                    }
                }
            }
        });

        return classified;
    }

  
    normalizeUrl(url) {
        let normalized = url.trim();

        // Remove email prefix
        if (normalized.startsWith('mailto:')) {
            return normalized;
        }

        // Add protocol if missing
        if (!normalized.match(/^https?:\/\//i)) {
            normalized = 'https://' + normalized;
        }

        // Remove trailing slash
        normalized = normalized.replace(/\/$/, '');

        // Remove tracking parameters
        normalized = this.removeTrackingParams(normalized);

        return normalized;
    }

  
    removeTrackingParams(url) {
        try {
            const urlObj = new URL(url);
            const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'source'];

            trackingParams.forEach(param => {
                urlObj.searchParams.delete(param);
            });

            return urlObj.toString().replace(/\?$/, '');
        } catch (error) {
            return url;
        }
    }

    
    isLikelyPortfolio(url) {
        const portfolioKeywords = ['portfolio', 'personal', 'blog', 'website', 'projects'];
        const urlLower = url.toLowerCase();

        return portfolioKeywords.some(keyword => urlLower.includes(keyword)) ||
               /\.(vercel\.app|netlify\.app|github\.io|herokuapp\.com|render\.com)/.test(urlLower);
    }

    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (error) {
            return false;
        }
    }
}

module.exports = URLClassifier;
