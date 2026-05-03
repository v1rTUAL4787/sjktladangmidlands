# SJKT Ladang Midlands — School Portal Specification
**Project codename:** `sjkt-portal`
**Domain:** polylearn.my
**Last updated:** 2026-05-03
**Facebook Page:** https://www.facebook.com/p/Sjkt-Ladang-Midlands-100010632196930/

---

## 1. Overview

A web-based school portal for SJKT Ladang Midlands. It serves three audiences:

| Role | Access |
|---|---|
| **Public** | Activity feed, school announcements (no login) |
| **Parent** | Login → view child's progress, book teacher consultations, see child's activities/gallery |
| **Teacher** | Login → manage students, post progress data, upload activity media, set consultation availability |
| **Admin** | Login → full access + user management, announcements, system config |

The portal is built as a modular system so new modules can be added without restructuring the core.

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + static pages, API routes, great DX |
| Language | TypeScript | Type safety across modules |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent, accessible |
| Database | Supabase (Postgres) | Auth + DB + Storage in one, free tier |
| ORM | Prisma | Type-safe queries, easy migrations |
| Auth | Supabase Auth | Google OAuth (Gmail) + email/password fallback |
| File Storage | Supabase Storage | Photos, recordings, documents |
| Notifications | Meta WhatsApp Cloud API | Appointment confirmations, parent approval alerts |
| i18n | next-intl | Tamil / English / BM, English default |
| Deployment | Vercel (free tier) | Works with polylearn.my custom domain |
| One-time scraper | Playwright (Node.js script) | Seed FB public page posts → DB |

**polylearn.my DNS:** Point A/CNAME to Vercel. Hostinger Premium is used only for DNS management.

---

## 3. Repository Structure

```
sjkt-portal/
├── app/                        # Next.js App Router
│   ├── (public)/               # No-auth routes
│   │   ├── page.tsx            # Landing / activity feed
│   │   └── about/
│   ├── (auth)/                 # Login, register, forgot-password
│   ├── (portal)/               # Auth-gated shell
│   │   ├── dashboard/          # Role-aware home after login
│   │   ├── progress/           # Module: Child Progress
│   │   ├── appointments/       # Module: Consultation Booking
│   │   ├── activities/         # Module: Activities & Gallery
│   │   └── admin/              # Module: Admin panel
│   └── api/                    # Next.js API routes
├── components/
│   ├── ui/                     # shadcn primitives
│   ├── layout/                 # Shell, Navbar, Sidebar
│   └── modules/                # Per-module components
├── lib/
│   ├── supabase/               # Client + server Supabase clients
│   ├── prisma/                 # Prisma client
│   └── i18n/                   # next-intl config + message files
├── messages/
│   ├── en.json
│   ├── ta.json                 # Tamil
│   └── ms.json                 # Bahasa Malaysia
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── seed-fb.ts              # One-time Playwright FB scraper
├── middleware.ts               # Auth + i18n routing
├── SPEC.md                     # This file
└── .env.local
```

---

## 4. Data Model

### 4.1 Users & Roles

```prisma
model User {
  id            String   @id @default(uuid())
  supabaseId    String   @unique          // links to supabase auth.users
  email         String   @unique
  fullName      String
  role          Role
  phone         String?
  preferredLang Lang     @default(EN)
  createdAt     DateTime @default(now())

  // Relations
  parentProfile  ParentProfile?
  teacherProfile TeacherProfile?
}

enum Role { ADMIN TEACHER PARENT }
enum Lang { EN TA MS }
```

### 4.2 School Structure

```prisma
model Class {
  id        String    @id @default(uuid())
  year      Int                           // 1–6
  name      String                        // e.g. "A", "B", "Mawar"
  year_label String                       // e.g. "2025"
  teacher   TeacherProfile? @relation(fields: [teacherId], references: [id])
  teacherId String?
  students  Student[]
}

model Student {
  id           String   @id @default(uuid())
  icNumber     String   @unique           // MyKid / MyKad — encrypted at rest
  fullName     String
  enrolledYear Int
  class        Class    @relation(fields: [classId], references: [id])
  classId      String
  parents      ParentStudent[]
  progressRecords ProgressRecord[]
  attendanceRecords AttendanceRecord[]
  activitySubmissions ActivitySubmission[]
}
```

> **Security note:** `icNumber` is stored AES-256 encrypted. Only the hash is used for lookup during parent registration.

### 4.3 Parent–Student Link

```prisma
model ParentProfile {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String   @unique
  approved  Boolean  @default(false)     // admin must approve
  students  ParentStudent[]
}

model ParentStudent {
  parent    ParentProfile @relation(fields: [parentId], references: [id])
  parentId  String
  student   Student       @relation(fields: [studentId], references: [id])
  studentId String
  relation  String        // "mother", "father", "guardian"
  @@id([parentId, studentId])
}
```

### 4.4 Teacher Profile & Availability

```prisma
model TeacherProfile {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String   @unique
  subjects  String[]
  classes   Class[]

  availability  TeacherSlot[]
  appointments  Appointment[]
}

model TeacherSlot {
  id          String        @id @default(uuid())
  teacher     TeacherProfile @relation(fields: [teacherId], references: [id])
  teacherId   String
  date        DateTime
  startTime   DateTime
  endTime     DateTime
  slotType    SlotType      // CONSULTATION | CLASS | SCHOOL_DUTY | BLOCKED
  label       String?       // optional note, e.g. "Exam invigilation"
  booked      Boolean       @default(false)
}

enum SlotType { CONSULTATION CLASS SCHOOL_DUTY BLOCKED }
```

### 4.5 Consultation Booking

```prisma
model Appointment {
  id          String         @id @default(uuid())
  slot        TeacherSlot    @relation(fields: [slotId], references: [id])
  slotId      String         @unique
  parent      ParentProfile  @relation(fields: [parentId], references: [id])
  parentId    String
  student     Student        @relation(fields: [studentId], references: [id])
  studentId   String
  teacher     TeacherProfile @relation(fields: [teacherId], references: [id])
  teacherId   String
  status      ApptStatus     @default(PENDING)
  notes       String?
  createdAt   DateTime       @default(now())
}

enum ApptStatus { PENDING CONFIRMED CANCELLED COMPLETED }
```

### 4.6 Child Progress

```prisma
model ProgressRecord {
  id          String   @id @default(uuid())
  student     Student  @relation(fields: [studentId], references: [id])
  studentId   String
  teacher     TeacherProfile @relation(fields: [teacherId], references: [id])
  teacherId   String
  subject     String
  term        Int                          // 1, 2, or 3
  year        Int
  tpScore     Int?                         // Tahap Penguasaan 1–6 (nullable for flexibility)
  customScore String?                      // free-text for non-TP rubrics
  requiredAttention  String?
  actionPlan  String?
  nextMilestone String?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AttendanceRecord {
  id        String   @id @default(uuid())
  student   Student  @relation(fields: [studentId], references: [id])
  studentId String
  date      DateTime
  present   Boolean
  reason    String?                        // if absent
}
```

### 4.7 Activity Feed & Announcements

```prisma
model Announcement {
  id          String   @id @default(uuid())
  title       String
  body        String
  titleTa     String?  // Tamil translation
  titleMs     String?  // BM translation
  bodyTa      String?
  bodyMs      String?
  publishedAt DateTime @default(now())
  source      AnnSource @default(MANUAL)
  fbPostId    String?  // populated if seeded from FB
  imageUrl    String?
  author      User     @relation(fields: [authorId], references: [id])
  authorId    String
  pinned      Boolean  @default(false)
  tags        String[]
}

enum AnnSource { MANUAL FB_SEED }
```

### 4.8 Activities & Gallery

```prisma
model Activity {
  id          String   @id @default(uuid())
  title       String
  description String?
  date        DateTime
  class       Class?   @relation(fields: [classId], references: [id])
  classId     String?
  createdBy   TeacherProfile @relation(fields: [teacherId], references: [id])
  teacherId   String
  submissions ActivitySubmission[]
  mediaItems  ActivityMedia[]
  requiresSubmission Boolean @default(false)
  dueDate     DateTime?
}

model ActivitySubmission {
  id         String   @id @default(uuid())
  activity   Activity @relation(fields: [activityId], references: [id])
  activityId String
  student    Student  @relation(fields: [studentId], references: [id])
  studentId  String
  mediaItems ActivityMedia[]
  grade      String?
  feedback   String?
  submittedAt DateTime @default(now())
}

model ActivityMedia {
  id           String   @id @default(uuid())
  storageUrl   String   // Supabase Storage path
  mediaType    MediaType
  caption      String?
  uploadedBy   User     @relation(fields: [userId], references: [id])
  userId       String
  activity     Activity? @relation(fields: [activityId], references: [id])
  activityId   String?
  submission   ActivitySubmission? @relation(fields: [submissionId], references: [id])
  submissionId String?
  uploadedAt   DateTime @default(now())
}

enum MediaType { PHOTO VIDEO DOCUMENT }
```

---

## 5. Modules

### Module 1 — Public Activity Feed
- **Who:** Anyone (no login)
- **Pages:** `/` (homepage feed), `/announcements/[id]`
- **Features:**
  - Paginated card feed of announcements (text + image)
  - Pin important notices to top
  - Feedback/comment form (stored, reviewed by admin)
  - Language switcher (EN / TA / MS) in navbar
- **Seeding:** One-time Playwright script scrapes https://www.facebook.com/p/Sjkt-Ladang-Midlands-100010632196930/ → inserts as `AnnSource.FB_SEED`

### Module 2 — Authentication
- **Who:** All roles
- **Pages:** `/login`, `/register`, `/forgot-password`, `/verify`
- **Flow:**
  - **Parent registration:** Email + password + child's IC (MyKid/MyKad hash lookup). Account created as `approved: false`. Admin sees pending list.
  - **Teacher/Admin:** Created by admin only (invite email flow)
  - **Post-approval:** Parent gets WhatsApp message → can access portal
- **Auth provider:** Supabase Auth — **Google OAuth (Gmail login) is primary**; email/password as fallback
  - Parents sign in with Google → enter child's IC hash to link → pending admin approval
  - Teachers/Admin invited by admin → also use Google OAuth or email/password

### Module 3 — Parent Dashboard
- **Who:** Parent (approved)
- **Pages:** `/dashboard`, `/progress`, `/appointments`, `/activities`
- **Features:**
  - Overview of all linked children
  - Quick-links to each module
  - Notification bell (appointment confirmations, new progress records)

### Module 4 — Child Progress
- **Who:** Parent views; Teacher creates/edits; Admin views all
- **Pages:** `/progress/[studentId]`
- **Features:**
  - Subject-by-subject TP score per term per year
  - YoY comparison chart (Recharts line chart)
  - "Requires attention" flags highlighted in red
  - Action plan and next milestone fields
  - Attendance calendar heatmap (YoY)
  - Future: bulk upload via Google Sheets import (module extension point)

### Module 5 — Consultation Booking
- **Who:** Parent books; Teacher manages availability; Admin views all
- **Pages:** `/appointments` (parent), `/teacher/schedule` (teacher)
- **Features (Teacher side):**
  - Calendar view to add/edit slots
  - Slot types: Consultation (bookable), Class, School Duty, Blocked
  - Custom start/end time per slot (no fixed grid)
  - Bulk copy week template
- **Features (Parent side):**
  - View teacher's available consultation slots
  - Select slot → choose which child → add notes → submit
  - Status tracking: Pending → Confirmed / Cancelled
  - WhatsApp notification to parent on confirmation/cancellation

### Module 6 — Activities & Gallery
- **Who:** Teacher uploads; Parent views child's; Admin sees all
- **Pages:** `/activities`, `/activities/[id]`
- **Features:**
  - Teacher creates an activity (optional: requires submission, set due date)
  - Upload photos/videos/docs to activity (Supabase Storage)
  - Parents upload child's work as submission
  - Teacher grades submission + adds feedback
  - Media gallery view (lightbox)
  - Storage: organised as `activities/{activityId}/` and `submissions/{submissionId}/`

### Module 7 — Admin Panel
- **Who:** Admin only
- **Pages:** `/admin/*`
- **Features:**
  - User management: approve parents, invite teachers, assign roles
  - Parent–student link management
  - Class management (create classes, assign class teachers)
  - Announcement management (post, pin, delete)
  - View all appointments
  - System settings (school name, logo, contact info)

---

## 6. One-Time FB Scraper

**Script:** `scripts/seed-fb.ts`

- Uses Playwright to open the school's public Facebook page URL
- Scrolls to load N posts (configurable)
- Extracts: post text, date, image URLs
- Writes to DB as `Announcement` records with `source: FB_SEED`
- Run once: `npx ts-node scripts/seed-fb.ts --url https://www.facebook.com/p/Sjkt-Ladang-Midlands-100010632196930/ --limit 50`
- After running, admin can review and delete irrelevant imported posts

**Note:** This is a one-time bootstrap tool, not a recurring sync. Facebook's HTML structure can change at any time — this script is intentionally not scheduled.

---

## 7. Brand & Design Tokens

School badge colours extracted from the official SJKT Ladang Midlands crest:

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#1B3A6B` | Navy blue — outer shield. Primary buttons, navbar bg, headings |
| `--color-accent` | `#00A0C0` | Teal — inner shield. Links, highlights, active states |
| `--color-gold` | `#F5B800` | Gold — top banner. Badges, warnings, call-to-action accents |
| `--color-crimson` | `#C41E3A` | Crimson — middle band. Danger states, "requires attention" flags |
| `--color-deep` | `#2D1B69` | Deep purple — Tamil motto band. Footer, secondary dark surfaces |
| `--color-surface` | `#F8F9FC` | Off-white. Page background |
| `--color-text` | `#1A1A2E` | Near-black. Body text |

**Logo:** School badge image used in navbar (top-left) and auth pages. Store at `public/badge.png`.

**Typography:**
- Headings: `Noto Serif` (works well across Latin, Tamil, and Malay scripts)
- Body: `Noto Sans` (covers all three scripts cleanly)
- Both available via Google Fonts, no extra licensing needed

---

## 8. Internationalisation (i18n)

- Library: `next-intl`
- Default: English (`en`)
- Supported: `en`, `ta` (Tamil), `ms` (Bahasa Malaysia)
- Language switcher in global navbar, persisted in cookie
- Announcement content has per-language fields (`titleTa`, `bodyMs` etc.) — admin can optionally fill these; falls back to English if not provided
- All static UI strings live in `messages/{locale}.json`

---

## 9. Security Considerations

| Concern | Approach |
|---|---|
| IC numbers | AES-256 encrypted at DB layer; only SHA-256 hash used for registration lookup |
| Row-level security | Supabase RLS policies enforce role boundaries at DB level |
| Parent–child access | Parents can only see data for their approved linked children |
| File access | Supabase Storage bucket policies: private buckets, signed URLs with 1hr expiry |
| CSRF | Next.js built-in protection on API routes |
| Admin-only routes | Middleware checks `role === ADMIN` server-side |
| Rate limiting | Vercel Edge middleware rate-limit on auth endpoints |

---

## 10. Deployment

```
polylearn.my
    └── Vercel project (sjkt-portal)
         ├── Environment: NEXT_PUBLIC_SUPABASE_URL
         ├── Environment: NEXT_PUBLIC_SUPABASE_ANON_KEY
         ├── Environment: SUPABASE_SERVICE_ROLE_KEY
         ├── Environment: ENCRYPTION_KEY (for IC AES)
         ├── Environment: NEXT_PUBLIC_SCHOOL_NAME="SJKT Ladang Midlands"
         ├── Environment: WHATSAPP_PHONE_NUMBER_ID  (from Meta Business Manager)
         ├── Environment: WHATSAPP_ACCESS_TOKEN     (Meta permanent token)
         └── Environment: WHATSAPP_VERIFY_TOKEN     (webhook verification)
```

**DNS setup on Hostinger:**
1. Add CNAME record: `www` → `cname.vercel-dns.com`
2. Add A record: `@` → `76.76.21.21` (Vercel)
3. Add domain in Vercel project → auto-provision SSL

---

## 11. Module Roadmap

| Phase | Modules | Status |
|---|---|---|
| MVP (v1) | Public Feed, Auth, Child Progress, Consultation Booking, Activities Gallery, Admin Panel | **Build now** |
| v1.1 | Google Sheets bulk import for progress data | Planned |
| v1.2 | Live FB Page sync (requires school Page admin access) | Planned |
| v1.3 | Push notifications (PWA) | Planned |
| v1.4 | WhatsApp Business API integration (school broadcast channel) | Planned |
| v2 | Student self-service portal (Std 4–6) | Future |

---

## 12. WhatsApp Notification Flow

**Provider:** Meta WhatsApp Cloud API (free tier, up to 1,000 conversations/month)

**Setup required (one-time, before launch):**
1. School registers a dedicated number on Meta Business Manager
2. Create a WhatsApp Business App → get `Phone Number ID` and `Access Token`
3. Add these to Vercel environment variables
4. Submit message templates for Meta approval (24–48hr turnaround):
   - `appt_confirmed` — "Your consultation with {teacher} on {date} at {time} is confirmed."
   - `appt_cancelled` — "Your appointment on {date} has been cancelled."
   - `parent_approved` — "Your account on SJKT Ladang Midlands portal has been approved. Login at polylearn.my"
   - `progress_updated` — "New progress report for {child_name} is available at polylearn.my"

**During registration:** Parent provides their WhatsApp number (Malaysian format, e.g. `601x-xxxxxxx`). Stored on `ParentProfile.whatsappNumber`.

**Notification triggers:**
| Event | Recipient | Template |
|---|---|---|
| Admin approves parent account | Parent | `parent_approved` |
| Appointment confirmed by teacher | Parent | `appt_confirmed` |
| Appointment cancelled | Parent | `appt_cancelled` |
| New progress record posted | Parent | `progress_updated` |

**In-portal bell** is also maintained as a fallback — parents who haven't provided a WhatsApp number still get in-portal notifications.

---

## 13. Open Questions (resolve before build)

- [x] Facebook Page URL → https://www.facebook.com/p/Sjkt-Ladang-Midlands-100010632196930/
- [x] School terms → 3 terms per year (standard Malaysian primary)
- [x] Auth → Google OAuth (Gmail) as primary login method
- [x] Brand colours → extracted from school badge (see Section 7)
- [x] **Notifications** → Meta WhatsApp Cloud API (school needs to register a number on Meta Business Manager before launch)
- [x] **First admin user** → `kthevan87@gmail.com` (seeded via Supabase dashboard on first deploy)
- [x] **School's WhatsApp Business number** → placeholder `+601XXXXXXXXXX` in `.env.local` for development. Replace with real school number before go-live. Dev/staging will use `kthevan87@gmail.com` owner's personal number for testing.
- [x] **Parent WhatsApp field** → **mandatory** at registration (Malaysian format, e.g. `601x-xxxxxxx`, validated on submit)
