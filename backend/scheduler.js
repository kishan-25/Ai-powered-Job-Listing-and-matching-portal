/**
 * TalentAlign — Scraper Scheduler
 * Runs all scrapers on a weekly cron schedule.
 *
 * Schedule: Every Sunday at 2:00 AM IST (UTC+5:30 → 20:30 UTC Saturday).
 * Cron expression: "30 20 * * 0"  (UTC)
 *
 * Also exposes a manual trigger: POST /api/v1/admin/run-scrapers
 * (admin-only, protected by protect + isAdmin middleware)
 *
 * Usage (standalone): node scheduler.js
 * Usage (integrated): imported by index.js on startup
 */

const cron    = require("node-cron");
const { exec } = require("child_process");
const path    = require("path");

const SCRIPTS_DIR  = path.join(__dirname, "scripts");
const TELEGRAM_DIR = path.join(SCRIPTS_DIR, "telegram");
const WEBSITES_DIR = path.join(SCRIPTS_DIR, "websites");

// ── Scraper definitions ───────────────────────────────────────────────────────
const SCRAPERS = [
  {
    name: "TimesJobs",
    cmd:  `python "${path.join(WEBSITES_DIR, "timesOfJob_scraper.py")}"`,
    timeoutMs: 10 * 60 * 1000,  // 10 min
  },
  {
    name: "HireJobs",
    cmd:  `python "${path.join(WEBSITES_DIR, "hirejobs_scraper.py")}"`,
    timeoutMs: 15 * 60 * 1000,  // 15 min (navigates detail pages)
  },
  {
    name: "Instahyre",
    cmd:  `python "${path.join(WEBSITES_DIR, "instahyre_scraper.py")}"`,
    timeoutMs: 10 * 60 * 1000,
  },
  {
    name: "Telegram — TechUprise",
    cmd:  `python "${path.join(TELEGRAM_DIR, "techuprise.py")}"`,
    timeoutMs: 5 * 60 * 1000,
  },
  {
    name: "Telegram — Krishan Kumar",
    cmd:  `python "${path.join(TELEGRAM_DIR, "krishan_kumar.py")}"`,
    timeoutMs: 5 * 60 * 1000,
  },
  {
    name: "Telegram — Kushal Vijay",
    cmd:  `python "${path.join(TELEGRAM_DIR, "kushal_vijay.py")}"`,
    timeoutMs: 5 * 60 * 1000,
  },
];

// ── Run a single scraper ──────────────────────────────────────────────────────
function runScraper(scraper) {
  return new Promise((resolve) => {
    console.log(`  ▶ Starting: ${scraper.name}`);
    const start = Date.now();

    const child = exec(scraper.cmd, { timeout: scraper.timeoutMs }, (error, stdout, stderr) => {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      if (error) {
        if (error.killed) {
          console.error(`  ✗ ${scraper.name}: timed out after ${elapsed}s`);
        } else {
          console.error(`  ✗ ${scraper.name}: failed after ${elapsed}s — ${error.message}`);
        }
        resolve({ name: scraper.name, success: false, elapsed });
        return;
      }
      if (stderr) console.warn(`  ⚠ ${scraper.name} stderr: ${stderr.slice(0, 300)}`);
      // Print last 3 output lines (summary)
      const lines = stdout.trim().split("\n");
      lines.slice(-3).forEach((l) => console.log(`    ${l}`));
      console.log(`  ✓ ${scraper.name}: done in ${elapsed}s`);
      resolve({ name: scraper.name, success: true, elapsed });
    });

    child.on("error", (err) => {
      console.error(`  ✗ ${scraper.name}: spawn error — ${err.message}`);
      resolve({ name: scraper.name, success: false, elapsed: 0 });
    });
  });
}

// ── Run all scrapers sequentially ─────────────────────────────────────────────
async function runAllScrapers(triggeredBy = "cron") {
  const startedAt = new Date().toISOString();
  console.log(`\n${"═".repeat(60)}`);
  console.log(`🕷  Scraper run started at ${startedAt}`);
  console.log(`   Triggered by: ${triggeredBy}`);
  console.log(`${"─".repeat(60)}`);

  const results = [];
  for (const scraper of SCRAPERS) {
    const result = await runScraper(scraper);
    results.push(result);
  }

  const passed  = results.filter((r) => r.success).length;
  const failed  = results.filter((r) => !r.success).length;
  const elapsed = results.reduce((sum, r) => sum + Number(r.elapsed), 0).toFixed(1);

  console.log(`${"─".repeat(60)}`);
  console.log(`✅  Run complete — ${passed} succeeded, ${failed} failed, ${elapsed}s total`);
  console.log(`${"═".repeat(60)}\n`);

  return { results, passed, failed, startedAt };
}

// ── Weekly cron schedule ──────────────────────────────────────────────────────
// Every Sunday at 2:00 AM IST = 20:30 UTC Saturday
// Cron: "30 20 * * 0"
const CRON_EXPRESSION = "30 20 * * 0";

let scheduledTask = null;

function startScheduler() {
  if (!cron.validate(CRON_EXPRESSION)) {
    console.error(`❌ Invalid cron expression: ${CRON_EXPRESSION}`);
    return;
  }

  scheduledTask = cron.schedule(CRON_EXPRESSION, async () => {
    await runAllScrapers("weekly-cron");
  }, {
    timezone: "UTC",
    scheduled: true,
  });

  // Human-readable next run time
  const now  = new Date();
  const days  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const nextSunday = new Date(now);
  nextSunday.setUTCDate(now.getUTCDate() + ((7 - now.getUTCDay()) % 7 || 7));
  nextSunday.setUTCHours(20, 30, 0, 0);

  console.log(`📅  Scraper scheduler started.`);
  console.log(`    Schedule : Every Sunday at 2:00 AM IST (20:30 UTC)`);
  console.log(`    Next run : ${nextSunday.toUTCString()}`);
}

function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
    console.log("🛑  Scraper scheduler stopped.");
  }
}

// ── Standalone mode ───────────────────────────────────────────────────────────
if (require.main === module) {
  const arg = process.argv[2];

  if (arg === "--run-now") {
    // One-shot manual run: node scheduler.js --run-now
    runAllScrapers("manual").then(() => process.exit(0)).catch((e) => {
      console.error(e);
      process.exit(1);
    });
  } else {
    // Start scheduler daemon
    startScheduler();
    console.log("   Press Ctrl+C to stop.\n");
  }
}

module.exports = { startScheduler, stopScheduler, runAllScrapers };
