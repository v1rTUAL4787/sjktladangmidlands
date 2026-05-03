import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FB_PAGE_URL = "https://www.facebook.com/p/Sjkt-Ladang-Midlands-100010632196930/";
const POST_LIMIT = parseInt(process.argv[2] ?? "30", 10);

async function main() {
  console.log(`Scraping up to ${POST_LIMIT} posts from ${FB_PAGE_URL}`);

  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminUser) throw new Error("No admin user found. Seed the admin first via Supabase dashboard.");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  await page.goto(FB_PAGE_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(3000);

  // Dismiss cookie/login dialogs if present
  const closeBtn = page.locator('[aria-label="Close"]').first();
  if (await closeBtn.isVisible()) await closeBtn.click();

  const posts: { text: string; imageUrl: string | null; postId: string; date: Date }[] = [];

  for (let i = 0; i < Math.ceil(POST_LIMIT / 5); i++) {
    await page.evaluate(() => window.scrollBy(0, 2000));
    await page.waitForTimeout(2000);
  }

  const postEls = await page.locator("[data-ad-comet-preview='message']").all();

  for (const el of postEls.slice(0, POST_LIMIT)) {
    try {
      const text = (await el.textContent()) ?? "";
      if (!text.trim()) continue;

      const parent = el.locator("xpath=ancestor::div[contains(@class,'x1yztbdb')]").first();
      const imgEl = parent.locator("img[referrerpolicy='origin-when-cross-origin']").first();
      const imageUrl = (await imgEl.getAttribute("src").catch(() => null)) ?? null;

      const uniqueId = Buffer.from(text.slice(0, 50)).toString("base64");

      posts.push({
        text: text.trim(),
        imageUrl,
        postId: uniqueId,
        date: new Date(),
      });
    } catch {
      // skip malformed post
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
