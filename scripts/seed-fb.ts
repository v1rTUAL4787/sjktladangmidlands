import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FB_PAGE_URL = "https://www.facebook.com/p/Sjkt-Ladang-Midlands-100010632196930/";
const POST_LIMIT = parseInt(process.argv[2] ?? "30", 10);

async function main() {
  console.log(`Scraping up to ${POST_LIMIT} posts from ${FB_PAGE_URL}`);

  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminUser) throw new Error("No admin user found. Seed the admin first via Supabase dashboard.");

  // Launch visible browser so you can solve any login/captcha manually
  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  console.log("Opening Facebook login page...");
  await page.goto("https://www.facebook.com/login", { waitUntil: "domcontentloaded", timeout: 30000 });

  console.log(">>> LOG IN TO FACEBOOK NOW. You have 3 minutes...");
  await page.waitForTimeout(180000);

  console.log("Navigating to school page...");
  await page.goto(FB_PAGE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(5000);

  // Scroll to load posts
  console.log("Scrolling to load posts...");
  for (let i = 0; i < Math.ceil(POST_LIMIT / 4); i++) {
    await page.evaluate(() => window.scrollBy(0, 2000));
    await page.waitForTimeout(1500);
  }

  // Try multiple selectors Facebook uses for post text
  const selectors = [
    "[data-ad-comet-preview='message']",
    "[data-ad-preview='message']",
    "div[dir='auto'] span[dir='auto']",
    ".xdj266r span",
  ];

  const posts: { text: string; imageUrl: string | null; postId: string; date: Date }[] = [];

  for (const selector of selectors) {
    const els = await page.locator(selector).all();
    if (els.length > 0) {
      console.log(`Found ${els.length} elements with selector: ${selector}`);

      for (const el of els.slice(0, POST_LIMIT)) {
        try {
          const text = (await el.textContent()) ?? "";
          if (!text.trim() || text.trim().length < 20) continue;

          // Try to find image near the post
          const parent = el.locator("xpath=ancestor::div[5]").first();
          const imgEl = parent.locator("img[referrerpolicy='origin-when-cross-origin']").first();
          const imageUrl = await imgEl.getAttribute("src").catch(() => null);

          const uniqueId = Buffer.from(text.slice(0, 60)).toString("base64").slice(0, 64);

          // Avoid duplicates within this run
          if (posts.find((p) => p.postId === uniqueId)) continue;

          posts.push({
            text: text.trim(),
            imageUrl: imageUrl ?? null,
            postId: uniqueId,
            date: new Date(),
          });
        } catch {
          // skip
        }
      }

      if (posts.length > 0) break;
    }
  }

  console.log(`Found ${posts.length} posts. Importing...`);

  let imported = 0;
  for (const post of posts) {
    const existing = await prisma.announcement.findUnique({ where: { fbPostId: post.postId } });
    if (existing) continue;

    const titleLine = post.text.split("\n")[0]?.slice(0, 120) ?? "School Update";

    await prisma.announcement.create({
      data: {
        title: titleLine,
        body: post.text,
        imageUrl: post.imageUrl,
        publishedAt: post.date,
        source: "FB_SEED",
        fbPostId: post.postId,
        authorId: adminUser.id,
        tags: ["facebook"],
      },
    });
    imported++;
  }

  console.log(`✓ Imported ${imported} new announcements.`);
  await browser.close();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
