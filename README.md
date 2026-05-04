# SJKT Ladang Midlands — School Portal

A school management and parent communication portal for **Sekolah Jenis Kebangsaan (Tamil) Ladang Midlands**, Shah Alam, Selangor.

> School Code: BBD8463 · PPD Petaling Perdana · Primary (Year 1–6) · ~250 students

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router (TypeScript) |
| Auth | Supabase Auth — Google OAuth only |
| Database | PostgreSQL via Supabase + Prisma ORM |
| Storage | Supabase Storage (public bucket: `SJKTPublic`) |
| i18n | `next-intl` — English (default), Tamil, Bahasa Malaysia |
| Deployment | Vercel (target domain: `polylearn.my`) |

**Brand colours:** Navy `#1B3A6B` · Teal `#00A0C0` · Gold `#F5B800`

---

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase + DB credentials
npx prisma generate
npx prisma migrate deploy
npm run dev
```

### Required environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=          # pooler URL (port 6543) for Vercel
DIRECT_URL=            # direct URL for migrations
ENCRYPTION_KEY=        # 32-byte hex key for AES-256 IC encryption
```

---

## Roles & Access

| Role | Who | How they get access |
|---|---|---|
| `ADMIN` | School administrator | Manually set in database |
| `TEACHER` | Teaching staff | Sign in with Google → email matched against TeacherRoster → auto-registered |
| `PARENT` | Parents / guardians | Admin adds their email via Students page → they sign in with Google |

**No self-registration. No invite emails. No passwords.**

### Authentication flow

```
User clicks "Sign in with Google"
  → Google OAuth → /auth/callback
  → supabaseId already in DB?          → /dashboard
  → Email pre-registered by admin?      → stamp real Supabase ID → /dashboard
  → Email in TeacherRoster?             → auto-create TEACHER account → /dashboard
  → Otherwise                           → sign out → /login?error=not_registered
```

---

## Application Structure

### Public (no login required)

| Route | Description |
|---|---|
| `/` | Hero, announcement feed (latest 20, pinned first), anonymous feedback form |
| `/announcements/[id]` | Full announcement detail |
| `/about` | School info, contact details, address |
| `/login` | Google sign-in (primary) + email/password (admin use) |

### Portal (login required)

| Route | Roles | Description |
|---|---|---|
| `/dashboard` | All | Welcome, linked children (parent), quick access tiles, notifications |
| `/progress` | All | List students to view progress (parent sees own children, teacher sees class, admin sees all) |
| `/progress/[studentId]` | All | TP scores by subject/term/year, attention flags, action plan, YoY chart, attendance heatmap |
| `/appointments` | Parent | Available consultation slots, booking, my appointments list |
| `/appointments/book/[slotId]` | Parent | Book a specific slot — select child, add notes |
| `/activities` | All | School activities and gallery feed |
| `/teacher/schedule` | Teacher | View upcoming slots with booking status |
| `/teacher/schedule/new` | Teacher | Create a new slot (Consultation / Class / School Duty / Blocked) |

### Admin Panel (`/admin/*`)

| Route | Description |
|---|---|
| `/admin` | Stats dashboard, pending parent approvals, quick actions |
| `/admin/classes` | Create / edit / delete classes (Year 1–6, academic year, class teacher) |
| `/admin/students` | Full student CRUD + Excel bulk import + parent linking |
| `/admin/teachers` | Teacher roster management, Excel upload, Google Sheets sync |
| `/admin/announcements` | *(not yet built)* |
| `/admin/events` | *(not yet built)* |

---

## Key Features

### Student Management
- Add students: full name, IC number (hashed + AES-256 encrypted at rest), DOB, gender, class
- Link parents at the point of student creation — no separate parent registration step
- Edit students: update details, add/remove parent links
- Bulk import via Excel: `fullName`, `icNumber`, `classId`, `dateOfBirth`, `gender`, `enrolledYear`, `parentName`, `parentEmail`, `parentRelation`, `parentWhatsapp` (append `2`…`5` suffix for multiple parents per row)

### Parent Pre-registration
- Admin enters parent name + email → creates a DB record silently (no email sent, no Supabase account yet)
- Parent visits site → clicks Sign in with Google with their registered email → account activates instantly → lands on dashboard with child already linked

### Teacher Roster
- Google Sheets or Excel is the single source of truth for teacher data
- Teachers auto-register on first Google login by matching email to roster
- Fields: `email`, `fullName`, `teacherRole`, `subjects[]`, `assignedClassId`, `academicYear`
- Teacher roles: `CLASS_TEACHER`, `SUBJECT_TEACHER`, `PENOLONG_KANAN`, `HEADMISTRESS`

### Progress Tracking
- KSSR SJKT grading: Tahap Penguasaan TP1–TP6 per subject per term
- 3 terms per academic year
- Colour-coded TP badges (red TP1 → emerald TP6)
- Attention flags, action plans, next milestones per subject
- Year-on-year line chart across terms
- Attendance heatmap (calendar view)

### Consultation Booking
- Teachers publish available time slots with type and optional label
- Parents see upcoming consultation slots from all teachers
- Parent books a slot → selects child → adds notes → appointment created as Pending
- Appointment statuses: Pending → Confirmed → Completed / Cancelled

### Announcements
- Pinned and unpinned posts, optional image
- Sourced manually or seeded from Facebook (`FB_SEED` badge)
- Tags support
- Trilingual fields: `title`, `body` + `titleTa`, `bodyTa`, `titleMs`, `bodyMs`

---

## Data Models

```
User                — all roles, linked to Supabase auth
├── ParentProfile   — WhatsApp, approval status
└── TeacherProfile  — subjects, teacher role

Student             — IC hash + encrypted, DOB, gender
└── ParentStudent   — many-to-many with relation label (Mother/Father/Guardian)

Class               — Year 1–6, name, academic year, class teacher
TeacherRoster       — pre-registration store, source of truth for teacher linking

Announcement        — title, body, image, pinned, tags, trilingual fields
TeacherSlot         — date, time, type
Appointment         — slot + parent + student + teacher, status lifecycle

ProgressRecord      — TP1–6 per subject/term/year, action plan, attention
AttendanceRecord    — daily present/absent per student

Activity            — school activity or assignment, class + teacher
ActivityMedia       — photos/videos/documents on activities or submissions
ActivitySubmission  — student submission on an activity

Notification        — in-portal bell notifications per user
```

---

## Build Status

### Done
- [x] Public site (home, announcements, about)
- [x] Google OAuth with role-based auto-registration
- [x] Admin student CRUD + Excel bulk import with parent linking
- [x] Admin class CRUD
- [x] Admin teacher roster management (Excel + Sheets sync)
- [x] Parent dashboard with linked children
- [x] Progress view — TP scores, attendance heatmap, YoY chart (read-only)
- [x] Teacher schedule management (create/view slots)
- [x] Appointment booking (parent books consultation slot)
- [x] Activities list and creation
- [x] In-portal notification model
- [x] Trilingual support (EN complete, TA/BM structure in place)

### Not Yet Built
- [ ] **Grade entry** — teacher UI to enter TP scores per student/subject/term; Excel bulk upload
- [ ] **Attendance upload** — Excel import for daily attendance
- [ ] **Announcements admin** — create/edit/pin/delete from admin panel
- [ ] **Events/Calendar** — upcoming school events page
- [ ] **Appointment management** — teacher confirms/cancels; parent notification on confirm
- [ ] **Activity detail + gallery** — `/activities/[id]` page
- [ ] **Submission upload** — upload work against an activity
- [ ] **WhatsApp notifications** — Meta WhatsApp Cloud API (scaffolded, not connected)
- [ ] **FB Graph API** — replace manual seed once FB page admin access obtained
- [ ] **DNS** — point `polylearn.my` to Vercel
- [ ] **Supabase redirect URLs** — update for production domain after DNS is live
- [ ] **Admin users page** — `/admin/users` linked but not implemented
- [ ] **Tamil/BM translations** — string keys exist, content not filled in

---

## Deployment

Push to `main` → GitHub → Vercel auto-deploys.

To trigger a manual redeploy:
```bash
curl -X POST https://api.vercel.com/v1/integrations/deploy/prj_HC5MxR0KvYiOs0LfDCIBb86Lj60Y/ttaznovrNX
```

---

## Contact

SJKT Ladang Midlands · Jalan Plumbum 7/100, 40000 Shah Alam, Selangor
📞 03-5510 3239 · 📠 03-5510 1745 · ✉️ BBD8463@moe.edu.my
