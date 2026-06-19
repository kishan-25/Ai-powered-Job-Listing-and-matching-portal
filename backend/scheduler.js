/**
 * TalentAlign — Robust Scraper Scheduler
 *
 * Guarantees:
 *  1. Runs every Sunday 2 AM IST — cron via node-cron
 *  2. Catch-up on startup — if a run was missed (server was down on Sunday), runs immediately
 *  3. Retry logic — each scraper retried up to MAX_RETRIES times before giving up
 *  4. Persists run history to MongoDB — survives process restarts
 *  5. Health endpoint — GET /api/v1/admin/scheduler-status
 *  6. Global error handlers — unhandledRejection / uncaughtException never kill the cron
 *  7. Scraper isolation — one scraper failing never stops the others
 */

const cron      = require("node-cron");
const { exec }  = require("child_process");
const path      = require("path");
const mongoose  = require("mongoose");

// ── Config ────────────────────────────────────────────────────────────────────
const SCRIPTS_DIR   = path.join(__dirname, "scripts");
const TELEGRAM_DIR  = path.join(SCRIPTS_DIR, "telegram");
const WEBSITES_DIR  = path.join(SCRIPTS_DIR, "websites");

// Sunday 2:00 AM IST = 20:30 UTC Saturday
const CRON_EXPR   = "30 20 * * 0";
const MAX_RETRIES = 2;         // attempts = 1 + MAX_RETRIES = 3 total
const RETRY_DELAY = 60_000;   // 1 min between retries

// Catch-up window: if last run was more than 8 days ago, run immediately on startup
const CATCHUP_THRESHOLD_MS = 8 * 24 * 60 * 60 * 1000;

// ── Environment detection ─────────────────────────────────────────────────────
// Render sets RENDER=true automatically. Website scrapers need Chrome/Selenium
// which is NOT available on Render. Telegram scrapers are pure Python — fine.
const IS_RENDER = !!process.env.RENDER;

// ── Scraper definitions ───────────────────────────────────────────────────────
// requiresBrowser: true  → needs Chrome/Selenium → skipped on Render
// requiresBrowser: false → pure Python           → always runs
const ALL_SCRAPERS = [
  { id: "timesjobs",          name: "TimesJobs",               timeoutMs: 20 * 60_000, requiresBrowser: true,  cmd: `python3 "${path.join(WEBSITES_DIR, "timesOfJob_scraper.py")}"` },
  { id: "hirejobs",           name: "HireJobs",                timeoutMs: 25 * 60_000, requiresBrowser: true,  cmd: `python3 "${path.join(WEBSITES_DIR, "hirejobs_scraper.py")}"` },
  { id: "instahyre",          name: "Instahyre",               timeoutMs: 20 * 60_000, requiresBrowser: true,  cmd: `python3 "${path.join(WEBSITES_DIR, "instahyre_scraper.py")}"` },
  { id: "telegram_techuprise", name: "Telegram — TechUprise",  timeoutMs: 10 * 60_000, requiresBrowser: false, cmd: `python3 "${path.join(TELEGRAM_DIR, "techuprise.py")}"` },
  { id: "telegram_krishan",   name: "Telegram — Krishan Kumar",timeoutMs: 10 * 60_000, requiresBrowser: false, cmd: `python3 "${path.join(TELEGRAM_DIR, "krishan_kumar.py")}"` },
  { id: "telegram_kushal",    name: "Telegram — Kushal Vijay", timeoutMs: 10 * 60_000, requiresBrowser: false, cmd: `python3 "${path.join(TELEGRAM_DIR, "kushal_vijay.py")}"` },
];

// On Render: only Telegram scrapers (no Chrome available)
// Locally:   all scrapers
const SCRAPERS = IS_RENDER
  ? ALL_SCRAPERS.filter((s) => !s.requiresBrowser)
  : ALL_SCRAPERS;

// ── Mongoose model for run history ────────────────────────────────────────────
const RunSchema = new mongoose.Schema({
  triggeredBy:  String,           // "weekly-cron" | "startup-catchup" | "manual"
  startedAt:    Date,
  finishedAt:   Date,
  durationSec:  Number,
  results: [{
    id:         String,
    name:       String,
    success:    Boolean,
    attempts:   Number,
    durationSec:Number,
    error:      String,
  }],
  passed:  Number,
  failed:  Number,
  status:  String,               // "success" | "partial" | "failed"
}, { collection: "scraper_runs" });

let RunModel = null;
function getRunModel() {
  if (!RunModel && mongoose.connection.readyState === 1) {
    RunModel = mongoose.models.ScraperRun || mongoose.model("ScraperRun", RunSchema);
  }
  return RunModel;
}

// ── Run a single scraper with retries ─────────────────────────────────────────
function execScraper(scraper) {
  return new Promise((resolve) => {
    const child = exec(scraper.cmd, { timeout: scraper.timeoutMs }, (error, stdout, stderr) => {
      if (error) {
        const msg = error.killed
          ? `timed out after ${scraper.timeoutMs / 1000}s`
          : error.message;
        resolve({ success: false, error: msg, stdout, stderr });
      } else {
        resolve({ success: true, stdout, stderr });
      }
    });
    child.on("error", (err) => resolve({ success: false, error: err.message }));
  });
}

async function runScraperWithRetries(scraper) {
  const start = Date.now();
  let attempt = 0;
  let lastError = "";

  while (attempt <= MAX_RETRIES) {
    attempt++;
    const prefix = attempt === 1 ? "  ▶" : `  ↩ retry ${attempt - 1}`;
    console.log(`${prefix} ${scraper.name} (attempt ${attempt}/${MAX_RETRIES + 1})`);

    const result = await execScraper(scraper);

    if (result.success) {
      // Print last 3 lines of output as summary
      const lines = (result.stdout || "").trim().split("\n");
      lines.slice(-4).forEach((l) => l.trim() && console.log(`      ${l.trim()}`));
      const secs = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`  ✅ ${scraper.name} — done in ${secs}s`);
      return { id: scraper.id, name: scraper.name, success: true, attempts: attempt, durationSec: Number(secs) };
    }

    lastError = result.error || "Unknown error";
    console.error(`  ✗ ${scraper.name} attempt ${attempt} failed: ${lastError}`);

    if (attempt <= MAX_RETRIES) {
      console.log(`     Waiting ${RETRY_DELAY / 1000}s before retry…`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
    }
  }

  const secs = ((Date.now() - start) / 1000).toFixed(1);
  console.error(`  ❌ ${scraper.name} — gave up after ${attempt} attempts (${secs}s): ${lastError}`);
  return { id: scraper.id, name: scraper.name, success: false, attempts: attempt, durationSec: Number(secs), error: lastError };
}

// ── Run ALL scrapers ──────────────────────────────────────────────────────────
async function runAllScrapers(triggeredBy = "cron") {
  const runStart  = new Date();
  const wallStart = Date.now();
  const skippedBrowserScrapers = IS_RENDER
    ? ALL_SCRAPERS.filter((s) => s.requiresBrowser).map((s) => s.name)
    : [];

  console.log(`\n${"═".repeat(65)}`);
  console.log(`🕷  Scraper run started — ${runStart.toISOString()}`);
  console.log(`   Triggered by : ${triggeredBy}`);
  console.log(`   Environment  : ${IS_RENDER ? "Render" : "Local"}`);
  console.log(`   Scrapers     : ${SCRAPERS.length} active  |  Max retries : ${MAX_RETRIES}`);
  if (skippedBrowserScrapers.length) {
    console.log(`   Skipped      : ${skippedBrowserScrapers.join(", ")} (no Chrome on Render)`);
  }
  console.log(`${"─".repeat(65)}`);

  const results = [];
  for (const scraper of SCRAPERS) {
    try {
      const r = await runScraperWithRetries(scraper);
      results.push(r);
    } catch (err) {
      // Isolate — one scraper crashing never stops the loop
      console.error(`  💥 Unexpected error in ${scraper.name}: ${err.message}`);
      results.push({ id: scraper.id, name: scraper.name, success: false, attempts: 1, durationSec: 0, error: err.message });
    }
  }

  const passed    = results.filter((r) => r.success).length;
  const failed    = results.filter((r) => !r.success).length;
  const totalSecs = ((Date.now() - wallStart) / 1000).toFixed(1);
  const status    = failed === 0 ? "success" : passed === 0 ? "failed" : "partial";

  console.log(`${"─".repeat(65)}`);
  console.log(`✅  Run complete — ${passed} succeeded, ${failed} failed — ${totalSecs}s total`);
  if (failed > 0) {
    results.filter((r) => !r.success).forEach((r) => console.error(`   ✗ ${r.name}: ${r.error}`));
  }
  console.log(`${"═".repeat(65)}\n`);

  // Persist run record to MongoDB
  try {
    const Run = getRunModel();
    if (Run) {
      await Run.create({
        triggeredBy, startedAt: runStart, finishedAt: new Date(),
        durationSec: Number(totalSecs), results, passed, failed, status,
      });
    }
  } catch (e) {
    console.error("⚠ Failed to persist scraper run record:", e.message);
  }

  return { results, passed, failed, status, startedAt: runStart.toISOString() };
}

// ── Catch-up on startup ───────────────────────────────────────────────────────
// If the server was down on Sunday and missed the scheduled run, run immediately.
async function checkAndCatchUp() {
  try {
    const Run = getRunModel();
    if (!Run) return;  // DB not ready yet

    const lastRun = await Run.findOne({ status: { $in: ["success", "partial"] } })
      .sort({ startedAt: -1 })
      .lean();

    if (!lastRun) {
      console.log("📋  No previous scraper run found — triggering catch-up run.");
      runAllScrapers("startup-catchup").catch(console.error);
      return;
    }

    const ageMs = Date.now() - new Date(lastRun.startedAt).getTime();
    if (ageMs > CATCHUP_THRESHOLD_MS) {
      const days = (ageMs / 86400000).toFixed(1);
      console.log(`📋  Last scraper run was ${days} days ago — triggering catch-up run.`);
      runAllScrapers("startup-catchup").catch(console.error);
    } else {
      const hours = (ageMs / 3600000).toFixed(1);
      console.log(`📋  Last scraper run was ${hours}h ago — no catch-up needed.`);
    }
  } catch (e) {
    console.error("⚠ Catch-up check failed:", e.message);
  }
}

// ── Scheduler status (for admin API) ─────────────────────────────────────────
async function getSchedulerStatus() {
  const Run = getRunModel();
  const lastRuns = Run
    ? await Run.find().sort({ startedAt: -1 }).limit(10).lean()
    : [];

  // Compute next Sunday 20:30 UTC
  const now = new Date();
  const next = new Date(now);
  const daysUntilSunday = (7 - now.getUTCDay()) % 7 || 7;
  next.setUTCDate(now.getUTCDate() + daysUntilSunday);
  next.setUTCHours(20, 30, 0, 0);

  const skippedScrapers = IS_RENDER
    ? ALL_SCRAPERS.filter((s) => s.requiresBrowser).map((s) => s.name)
    : [];

  return {
    schedulerAlive: scheduledTask !== null,
    isRender: IS_RENDER,
    cronExpression: CRON_EXPR,
    nextRunUTC: next.toISOString(),
    nextRunIST: next.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    scraperCount: SCRAPERS.length,
    totalScrapers: ALL_SCRAPERS.length,
    skippedScrapers,
    maxRetries: MAX_RETRIES,
    lastRuns: lastRuns.map((r) => ({
      startedAt: r.startedAt,
      durationSec: r.durationSec,
      status: r.status,
      passed: r.passed,
      failed: r.failed,
      triggeredBy: r.triggeredBy,
    })),
  };
}

// ── Global error guards — prevent cron from dying silently ───────────────────
process.on("unhandledRejection", (reason) => {
  console.error("⚠ [scheduler] unhandledRejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("⚠ [scheduler] uncaughtException:", err.message);
  // Do NOT call process.exit() here — let the server stay up
});

// ── Start / stop the cron ─────────────────────────────────────────────────────
let scheduledTask = null;

function startScheduler() {
  if (!cron.validate(CRON_EXPR)) {
    console.error(`❌ Invalid cron expression: ${CRON_EXPR}`);
    return;
  }

  if (scheduledTask) {
    console.log("ℹ Scheduler already running — skipping duplicate start.");
    return;
  }

  scheduledTask = cron.schedule(CRON_EXPR, async () => {
    console.log("⏰ Weekly cron fired — starting scraper run…");
    await runAllScrapers("weekly-cron");
  }, {
    timezone: "UTC",
    scheduled: true,
  });

  // Catch-up check after DB connects (give it 5s to connect)
  setTimeout(() => checkAndCatchUp(), 5_000);

  // Compute next Sunday
  const now = new Date();
  const daysUntilSunday = (7 - now.getUTCDay()) % 7 || 7;
  const nextRun = new Date(now);
  nextRun.setUTCDate(now.getUTCDate() + daysUntilSunday);
  nextRun.setUTCHours(20, 30, 0, 0);

  const skipped = ALL_SCRAPERS.filter((s) => s.requiresBrowser);
  console.log("📅  Scraper scheduler started.");
  console.log(`    Environment: ${IS_RENDER ? "Render (browser scrapers SKIPPED)" : "Local (all scrapers)"}`);
  console.log(`    Schedule   : Every Sunday at 2:00 AM IST (20:30 UTC)`);
  console.log(`    Next run   : ${nextRun.toUTCString()}`);
  console.log(`    Active     : ${SCRAPERS.length} scrapers  (${MAX_RETRIES} retries each)`);
  if (IS_RENDER && skipped.length) {
    console.log(`    Skipped    : ${skipped.map((s) => s.name).join(", ")} — Chrome not available on Render`);
    console.log(`    Tip        : Run website scrapers locally with: node scheduler.js --run-now`);
  }
  console.log(`    Catch-up   : runs on startup if last run > 8 days ago`);
}

function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log("🛑 Scraper scheduler stopped.");
  }
}

// ── Standalone ────────────────────────────────────────────────────────────────
if (require.main === module) {
  const arg = process.argv[2];
  if (arg === "--run-now") {
    runAllScrapers("manual-cli").then(() => process.exit(0)).catch((e) => {
      console.error(e);
      process.exit(1);
    });
  } else {
    startScheduler();
    console.log("   Press Ctrl+C to stop.\n");
  }
}

module.exports = { startScheduler, stopScheduler, runAllScrapers, getSchedulerStatus };
