import { chromium } from "playwright";

const BASE = "http://localhost:8080";
const shot = "/tmp/opencode/site-live.png";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.setDefaultTimeout(90000);

const log = (...args) => console.log(...args);

await page.goto(BASE, { waitUntil: "commit", timeout: 120000 });
await page.waitForSelector('input[placeholder="Search for a service…"]', { timeout: 120000 });
await page.waitForFunction(() => Object.keys(document.body).some((k) => k.startsWith("__reactFiber")), null, { timeout: 120000 });
await page.waitForTimeout(2000);
log("page loaded + hydrated");

await page.fill('input[placeholder="Search for a service…"]', "passport");
await page.waitForSelector("text=irembo.gov.rw", { timeout: 90000 });
log("live source badge visible");

await page.waitForSelector("text=e-Passport Application", { timeout: 90000 });
log("scraper hit rendered");

const showBtn = page.getByRole("button", { name: "Show requirements" }).first();
await showBtn.waitFor({ timeout: 90000 });
await showBtn.click();
log("clicked show requirements");

await page.waitForSelector("text=Fetching live details from Irembo…", { timeout: 30000 }).catch(() => log("no loading label (fast cache)"));
await page.waitForSelector("text=Open on Irembo", { timeout: 90000 });
log("detail rendered");

const chips = await page.locator("text=/Processing time|Price|Provided by/").allTextContents();
log("chips:", JSON.stringify(chips.slice(0, 6)));
const applyHref = await page
  .locator('a[href*="irembo.gov.rw"]:has-text("Open on Irembo")')
  .first()
  .getAttribute("href");
log("apply/list link:", applyHref);

await page.screenshot({ path: shot, fullPage: false });
log("screenshot:", shot);

await page.getByRole("button", { name: "KN", exact: true }).first().click();
await page.fill('input[placeholder="Shakisha serivisi…"]', "indangamuntu");
await page.waitForSelector("text=Gusaba Indangamuntu", { timeout: 90000 });
log("KN search ok");
const knBtn = page.getByRole("button", { name: "Reba ibyifuza" }).first();
await knBtn.click();
await page.waitForSelector("text=Fungura kuri Irembo", { timeout: 120000 });
log("KN detail ok");
await page.screenshot({ path: "/tmp/opencode/site-live-kn.png", fullPage: false });

await browser.close();
log("E2E PASS");
