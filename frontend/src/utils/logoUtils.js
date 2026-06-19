/**
 * Logo utilities — domain extraction and Clearbit logo URL generation.
 * Clearbit's logo API is free and returns company logos by domain.
 */

// Well-known company → domain overrides (Telegram data has messy company names)
const DOMAIN_OVERRIDES = {
  "google":       "google.com",
  "microsoft":    "microsoft.com",
  "amazon":       "amazon.com",
  "meta":         "meta.com",
  "apple":        "apple.com",
  "netflix":      "netflix.com",
  "stripe":       "stripe.com",
  "spotify":      "spotify.com",
  "uber":         "uber.com",
  "airbnb":       "airbnb.com",
  "linkedin":     "linkedin.com",
  "twitter":      "twitter.com",
  "salesforce":   "salesforce.com",
  "oracle":       "oracle.com",
  "ibm":          "ibm.com",
  "infosys":      "infosys.com",
  "wipro":        "wipro.com",
  "tcs":          "tcs.com",
  "hcl":          "hcltech.com",
  "accenture":    "accenture.com",
  "deloitte":     "deloitte.com",
  "cognizant":    "cognizant.com",
  "capgemini":    "capgemini.com",
  "adobe":        "adobe.com",
  "autodesk":     "autodesk.com",
  "atlassian":    "atlassian.com",
  "razorpay":     "razorpay.com",
  "paytm":        "paytm.com",
  "phonepe":      "phonepe.com",
  "flipkart":     "flipkart.com",
  "zomato":       "zomato.com",
  "swiggy":       "swiggy.com",
  "ola":          "olacabs.com",
  "byju":         "byjus.com",
  "cred":         "cred.club",
  "freshworks":   "freshworks.com",
  "zoho":         "zoho.com",
  "zepto":        "zeptonow.com",
  "groww":        "groww.in",
  "zerodha":      "zerodha.com",
  "meesho":       "meesho.com",
  "lenskart":     "lenskart.com",
  "unacademy":    "unacademy.com",
  "upstox":       "upstox.com",
  "nykaa":        "nykaa.com",
  "juspay":       "juspay.in",
  "browserstack": "browserstack.com",
  "rubrik":       "rubrik.com",
  "mozilla":      "mozilla.org",
  "spacex":       "spacex.com",
  "pinterest":    "pinterest.com",
};

/** Extract a usable domain from apply_link URL */
function domainFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    let host = u.hostname.replace(/^www\./, "");
    // Skip job-board redirect hosts
    if (/timesjobs|hirejobs|naukri|linkedin|jobvite|greenhouse|lever|workable|indeed|glassdoor/.test(host)) {
      return null;
    }
    return host;
  } catch {
    return null;
  }
}

/** Guess company domain from company name string */
function domainFromCompanyName(name) {
  if (!name || typeof name !== "string") return null;
  const lower = name.toLowerCase().trim();

  // Check overrides first
  for (const [key, domain] of Object.entries(DOMAIN_OVERRIDES)) {
    if (lower.includes(key)) return domain;
  }

  // Strip common suffixes and try company.com
  const clean = lower
    .replace(/\s*(pvt|private|limited|ltd|inc|llc|corp|co|technologies|technology|solutions|services|systems|software|consulting|group|india|global)\b\.?/gi, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

  return clean.length >= 3 ? `${clean}.com` : null;
}

/**
 * Returns the best logo URL to try for a job.
 * Priority: scraped CDN URL → Clearbit via apply_link → Clearbit via company name
 */
export function getLogoUrl(job) {
  // Already have a scraped logo
  const scraped = job.companyLogo || job.company_logo || job.image_url;
  if (scraped && scraped.startsWith("http")) return scraped;

  // Try Clearbit via apply_link domain
  const urlDomain = domainFromUrl(job.apply_link || job.actualApplyLink);
  if (urlDomain) return `https://logo.clearbit.com/${urlDomain}`;

  // Try Clearbit via company name guess
  const nameDomain = domainFromCompanyName(job.company || job.companyName);
  if (nameDomain) return `https://logo.clearbit.com/${nameDomain}`;

  return null;
}

/**
 * Clean job title — strip Telegram markdown, emojis, and noise
 */
export function cleanTitle(raw) {
  if (!raw) return "Untitled";
  return raw
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")  // remove emojis
    .replace(/📌|🔴|🟢|🟡|⭐|✅|❌|🔥|💼|📢|📣|🎯|🚀|💡/gu, "")
    .replace(/\*{1,2}/g, "")                  // remove ** markdown bold
    .replace(/_{1,2}/g, "")                   // remove __ markdown
    .replace(/#+\s*/g, "")                    // remove ## headings
    .replace(/https?:\/\/\S+/g, "")           // remove URLs
    .replace(/\s{2,}/g, " ")                  // collapse whitespace
    .trim()
    || "Untitled";
}

/**
 * Clean company name — strip Telegram noise
 */
export function cleanCompany(raw) {
  if (!raw || typeof raw !== "string") return "";
  const cleaned = raw
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, "")
    .replace(/\*{1,2}|_{1,2}/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  // If it looks like an email or date, discard it
  if (/@/.test(cleaned) || /^\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(cleaned)) return "";
  return cleaned.length > 60 ? cleaned.slice(0, 60) + "…" : cleaned;
}
