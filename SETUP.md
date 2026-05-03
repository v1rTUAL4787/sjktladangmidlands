# Setup Guide — SJKT Ladang Midlands Portal

## Prerequisites
- Node.js 20+
- A Supabase account (supabase.com)
- A Vercel account (vercel.com)

---

## Step 1: Supabase Project

1. Go to supabase.com → New Project → name it `sjkt-portal`
2. Once created, go to **Project Settings > API**
3. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **Settings > Database** → copy the **Connection string (Transaction)** → `DATABASE_URL`
   - Also copy the **Direct connection string** → `DIRECT_URL`
5. Go to **Authentication > Providers > Google**:
   - Enable Google
   - Add your Google OAuth credentials (create at console.cloud.google.com)
   - Authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`

---

## Step 2: Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in all values. Generate your encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add `DATABASE_URL` and `DIRECT_URL` from Supabase (Prisma needs both for connection pooling).

---

## Step 3: Install & Migrate

```bash
npm install
npx prisma generate
npx prisma db push
```

---

## Step 4: Seed Admin User

1. Go to Supabase Dashboard → **Authentication > Users** → **Invite user**
2. Enter `kthevan87@gmail.com`
3. After the user accepts the invite and signs in, run:

```sql
-- Run in Supabase SQL Editor
INSERT INTO "User" ("id", "supabaseId", "email", "fullName", "role", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  id,
  email,
  'Kumarathevan Subassandran',
  'ADMIN',
  now(),
  now()
FROM auth.users
WHERE email = 'kthevan87@gmail.com';
```

---

## Step 5: Run Locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Step 6: Seed Facebook Posts (one-time)

After the admin user is seeded:
```bash
npm run seed:fb
```

This scrapes ~30 posts from the SJKT Ladang Midlands Facebook page and imports them as announcements. Run once only.

---

## Step 7: Deploy to Vercel

1. Push code to GitHub
2. Go to vercel.com → New Project → Import the GitHub repo
3. Add all environment variables from `.env.local`
4. Deploy

**Connect polylearn.my:**
1. In Vercel project → Settings → Domains → Add `polylearn.my`
2. In Hostinger hPanel → DNS Manager:
   - Add A record: `@` → `76.76.21.21`
   - Add CNAME: `www` → `cname.vercel-dns.com`
3. SSL is auto-provisioned by Vercel (~5 mins)

---

## Step 8: WhatsApp Cloud API (before go-live)

1. Go to developers.facebook.com → Create App → Business
2. Add WhatsApp product
3. Register the school's phone number
4. Copy `Phone Number ID` and generate a permanent `Access Token`
5. Add to Vercel environment variables
6. Submit message templates for approval:
   - `parent_approved`
   - `appt_confirmed`
   - `appt_cancelled`
   - `progress_updated`

**For dev/testing:** Use the test number Meta provides, or your own number.

---

## Adding Students (Admin)

Before parents can register, students must be in the database.
Use the Supabase SQL Editor or build the admin import UI (v1.1):

```sql
-- Example: add one student
-- First encrypt the IC via the app's /api/admin/students endpoint (build later)
-- For now, use the Prisma Studio: npm run db:studio
```

Students can be bulk-added via Prisma Studio at launch.
