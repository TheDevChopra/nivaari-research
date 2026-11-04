# Nivaari — Founding 100 Research Experience

A production-quality, mobile-first interactive research application for **Nivaari**, a women-led menstrual and everyday health platform. Designed to listen before building, inviting the first 100 participants to share cycle experiences, daily frictions, healthcare trust, and digital support needs.

---

## 🌸 Brand & Design Direction

- **Personality:** Warm, empathetic, feminine, empowering, trustworthy, modern, minimal.
- **Palette Tokens:**
  - **Olive Green** (`#556B45`) — Primary buttons, active states, progress indicators.
  - **Sage Green** (`#A7C4A0`) — Soft accent backgrounds, check indicators, highlights.
  - **Peach Orange** (`#E8976B`) & **Blush Pink** (`#E8A7A1`) — Warm badges and gentle accents.
  - **Warm Beige** (`#F4E1D4`) & **Ivory White** (`#FDF6F2`) — Primary surfaces, cards, and backgrounds.
  - **Terracotta** (`#C87B5A`) — Supporting badges, callouts, and notes.
  - **Forest Green** (`#2E3D2F`) — High-contrast, accessible primary typography.
- **Typography:** Refined sans-serif (`DM Sans`) paired with editorial titles (`Playfair Display`).
- **Mobile First:** Optimized for 375px, 390px, and 430px mobile screens, scaling responsively to tablets and desktops.

---

## 🛠️ Architecture & Project Structure

```text
nivaari-research/
├── public/
│   └── nivaari-logo.png             # Provided high-resolution Nivaari brand mark
├── src/
│   ├── app/
│   │   └── research/
│   │       └── ResearchExperience.tsx # State machine orchestrator & flow
│   ├── components/
│   │   └── research/
│   │       ├── ResearchShell.tsx       # Layout shell, branding header, progress bar, disclaimers
│   │       ├── WelcomeScreen.tsx       # Welcoming hero, founding benefits, time estimate
│   │       ├── ConsentScreen.tsx       # 5 separate unchecked consents, age verification, privacy notice
│   │       ├── IneligibleScreen.tsx    # Respectful under-18 exit without collecting data
│   │       ├── ExitScreen.tsx          # Respectful exit if consent is declined
│   │       ├── QuestionRenderer.tsx    # Single-question display with adaptive navigation
│   │       ├── SingleSelectQuestion.tsx# Radio cards with conditional "Other" text input
│   │       ├── MultiSelectQuestion.tsx # Multi-choice cards with mutually exclusive options & limit tags
│   │       ├── TextQuestion.tsx        # Accessible inputs for short, long, email, phone, yes/no
│   │       ├── ScaleQuestion.tsx       # 1–5 intuitive interactive rating scale
│   │       ├── ProgressIndicator.tsx   # Adaptive progress bar (Step X of Y within active path)
│   │       ├── ReviewScreen.tsx        # Response summary grouped by section with per-question Edit
│   │       └── ThankYouScreen.tsx      # Heartfelt gratitude, founding 100 next steps, privacy reassurance
│   ├── config/
│   │   └── founding100/
│   │       ├── copy.v1.ts             # Versioned strings, privacy copy, badges, section titles
│   │       └── survey.v1.ts           # Central question bank (A01–H05) with stable IDs and conditions
│   ├── lib/
│   │   └── research/
│   │       ├── branching-engine.ts    # Pure branching engine: path recalculation, answer pruning, validation
│   │       ├── submission.ts          # Contact separation, duplicate prevention, backend/mock handler
│   │       └── supabase-client.ts     # Supabase client initializer (RLS safe)
│   ├── tests/
│   │   ├── branching-engine.test.ts   # 21 unit tests covering all branch paths & mutual exclusivity
│   │   ├── consent.test.ts            # Age eligibility and mandatory consent tests
│   │   └── submission.test.ts         # Data isolation, idempotency, and versioned payload tests
│   ├── types/
│   │   └── research.ts                # TypeScript interfaces and domain models
│   ├── App.tsx                        # Main application root
│   ├── main.tsx                       # React 19 entry point
│   └── index.css                      # Tailwind base and custom accessibility styles
├── supabase/
│   └── migrations/
│       └── 20261104000000_create_research_tables.sql # Production schema, RLS policies, atomic RPC
├── .env.example                       # Environment template for Supabase credentials
└── vite.config.ts                     # Bundler configuration with Vitest setup
```

---

## 🔀 Branching Engine & Rules

The survey engine dynamically computes the participant's path:

1. **Cycle Regularity (A04):**
   - `predictable` ➔ Skips `A05` and `A06`, moves directly to `B01`.
   - `vary`, `unpredictable`, `recent_change` ➔ Shows `A05` (cycle variation details), then `B01`.
   - `no_periods` ➔ Shows `A06` (context around why no periods, without medical diagnosis), then `B01`.
   - `not_sure`, `prefer_not` ➔ Skips detailed regularity follow-ups.
2. **Tracking Setup (B01):**
   - `period_app` ➔ Asks app names (`B02`), reasons (`B03`), frustrations (`B04`), switching history (`B05`).
   - `phone_calendar`, `notes_diary`, `mental`, `other_method` ➔ Skips `B02`, asks `B03`, `B04`, `B05`.
   - `do_not_track` ➔ Skips `B02`–`B05`, shows non-tracker questions `B06` (reasons) and `B07` (what would help).
3. **Switching Considerations (B05):**
   - If user stopped using, considered switching, or switched ➔ Shows `B08` ("What would a new app need to do better?"). Otherwise skipped.
4. **Symptoms & Daily Impact (C01):**
   - If `none_of_these` or `prefer_not` is selected ➔ Skips symptom frequency (`C02`), scale (`C03`), and recent story (`C04`), moving straight to energy/mood patterns (`C05`).
   - If symptoms reported ➔ Shows `C02`, `C03`, `C04`.
5. **Dismissal in Healthcare (D04):**
   - If `yes` or `sometimes` ➔ Shows optional reflection question `D05`.
6. **Digital Companion Stance (E05):**
   - If `comfortable` or `open` ➔ Shows use cases `E06`.
   - If `prefer_human`, `not_comfortable`, or `not_sure` ➔ Shows trust conditions `E07` instead.
7. **Founding 100 Programme (G01):**
   - If `yes` or `learn_more` ➔ Shows benefits `G02`, interview willingness `G03`, and contact section `H01`–`H05`.
   - If `not_now` ➔ Skips `G02` and `G03`. Contact details are only shown if the participant separately checked contact/update consent.
8. **Mutually Exclusive Selections:**
   - Selecting "None of these" or "Prefer not to say" unchecks all other options.
   - Selecting any other option deselects "None of these".
9. **Backward Path Recalculation & Answer Pruning:**
   - Navigating backwards and changing an earlier choice instantly recalculates the active sequence and strips any no-longer-applicable answers so stale data is never submitted.

---

## 🔒 Privacy, Ethics & Data Protection

- **Separate Contact & Health Data:** Contact details (`H01`–`H05`) are completely separated from health research answers into a distinct `research_participants` table and stripped from `research_answers`.
- **Under-18 Protection:** Participants under 18 exit immediately without any health answers collected.
- **Row Level Security (RLS):** All four database tables (`research_participants`, `research_responses`, `research_answers`, `consent_records`) have RLS enabled with anonymous insert policies and zero public read permissions.
- **No Trackers or Replay:** No advertising pixels, session replay, or intrusive tracking scripts.
- **Transparent Local Development Mode:** When Supabase credentials are not configured, responses are saved locally in the participant's browser session with a clear dev notice—never pretending fake cloud insertion.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite
```bash
npm test
```
Runs 29 automated tests across the branching engine, mutual exclusivity, answer pruning, consent validation, and data separation.

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🗄️ Supabase Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. In your Supabase Dashboard, navigate to the **SQL Editor**.
3. Run the migration script located at:
   `supabase/migrations/20261104000000_create_research_tables.sql`
4. Copy your **Project URL** and **anon public key** into `.env`.

