# Product Requirements Document
## Social Media Content Analyzer

**Version:** 1.0
**Purpose:** Technical assessment submission for Software Engineer position
**Deadline:** 1st Sep 2025
**Time budget:** ~8 hours total build time
**Audience for this doc:** CLI coding agent (build this in the phases below, in order, and do not skip ahead)

---

## 1. Project Overview

Build a web application called **Social Media Content Analyzer**. Users upload a PDF or an image (scanned document) containing social media post content. The app extracts the text (via PDF parsing or OCR) and then analyzes it to suggest engagement improvements.

### Core user flow
1. User lands on the app.
2. User uploads a file via drag-and-drop or file picker (PDF or image: jpg/png).
3. App shows a loading state while it extracts text.
4. Extracted text is displayed to the user, preserving formatting where possible.
5. App analyzes the extracted text and shows engagement suggestions (hashtags, length, tone, readability, call-to-action presence, etc.)
6. User can copy/download the extracted text and/or the suggestions.

### Non-negotiable constraints (from the assessment brief)
- Clean, production-quality code.
- Basic error handling everywhere a file/network/parsing operation happens.
- Loading states for all async operations.
- Simple documentation (README) explaining the approach.
- Any framework is fine.
- Free-tier AI/ML services only if used.
- Final deliverables: (1) working hosted app URL, (2) GitHub repo with source + README, (3) a ≤200-word write-up of the approach.

### Submission guideline constraints (from your org's guidelines doc — apply throughout, not just at the end)
- GitHub repo on `main` branch, public, downloadable, within GitHub size limits.
- No `node_modules`, `.env`, build artifacts (`dist/`, `.next/`, `out/`), or editor folders (`.vscode/`, `.idea/`) committed — enforce via `.gitignore` from Phase 0.
- Only strictly necessary dependencies. No dependency bloat.
- Properly structured, named, and commented code.

---

## 2. Tech Stack Decision

Chosen for speed of build within an 8-hour budget, free-tier hosting, and minimal dependency footprint:

- **Frontend:** React + Vite + TypeScript, plain CSS (or Tailwind if it speeds up styling — keep it minimal).
- **Backend:** Node.js + Express (TypeScript).
- **PDF text extraction:** `pdf-parse` (lightweight, no external API needed).
- **OCR for images:** `tesseract.js` (runs client-side or server-side, free, no API key needed).
- **Hosting:** Frontend on Vercel/Netlify (free tier), backend on Render/Railway (free tier). If time is short, prefer a single deployable (e.g., serve frontend build from the Express server) to reduce moving parts.
- **No database required** — this is stateless, single-session analysis. Do not add one.

> Agent note: if a simpler single-process architecture (e.g., Next.js API routes) lets you ship faster with fewer deploy steps, that is an acceptable substitution — but keep the phase order and feature scope identical.

---

## 3. Phased Build Plan

Build and verify each phase before moving to the next. Commit to git at the end of every phase with a clear commit message. Do not add speculative features beyond what's listed.

---

### **Phase 0 — Project Setup** (~30 min)

**Goal:** Clean scaffold, nothing extra.

Tasks:
- Initialize git repo, set default branch to `main`.
- Scaffold frontend (Vite + React + TS) and backend (Express + TS) in a monorepo-style structure:
  ```
  /client       -> frontend
  /server       -> backend
  README.md
  .gitignore
  ```
- Add a root `.gitignore` covering: `node_modules/`, `.env`, `dist/`, `build/`, `.next/`, `out/`, `.vscode/`, `.idea/`, OS files (`.DS_Store`).
- Install only essential deps (no UI kits, no state libraries unless truly needed).
- Add basic `README.md` with project title and a "Setup" placeholder section (fill in fully in Phase 5).

**Definition of done:** `npm run dev` starts both client and server locally with a blank "Hello" page rendering. Nothing committed that violates the submission guidelines.

---

### **Phase 1 — File Upload UI** (~1 hr)

**Goal:** Users can select or drag-and-drop a PDF/image.

Tasks:
- Build an upload component supporting:
  - Drag-and-drop zone
  - Click-to-browse file picker fallback
- Restrict accepted types client-side to `application/pdf`, `image/png`, `image/jpeg`.
- Show file name + size after selection, with a "Remove" option before submitting.
- Basic client-side validation: reject unsupported file types and oversized files (set a sane cap, e.g., 10MB) with a clear inline error message — no silent failures.

**Definition of done:** User can pick or drop a valid file and see it staged; invalid files are rejected with a visible error.

---

### **Phase 2 — Text Extraction Backend** (~2 hrs)

**Goal:** Given an uploaded file, return extracted text.

Tasks:
- Build a single backend endpoint, e.g. `POST /api/extract`, accepting `multipart/form-data`.
- Branch on file type:
  - **PDF** → parse with `pdf-parse`, preserve paragraph/line breaks as best as the library allows.
  - **Image** → run through `tesseract.js` OCR.
- Return a consistent JSON contract, e.g.:
  ```json
  { "success": true, "text": "...", "sourceType": "pdf" | "image" }
  ```
  or on failure:
  ```json
  { "success": false, "error": "human-readable message" }
  ```
- Error handling: corrupt file, unsupported format, empty/unreadable content, extraction timeout — each should return a distinct, useful error message, not a stack trace.
- Do not persist uploaded files to disk longer than needed for processing; delete/temp-clean after extraction.

**Definition of done:** Hitting the endpoint with a real PDF and a real scanned image both return correct extracted text via curl/Postman, and malformed input returns a clean 4xx error with a message.

---

### **Phase 3 — Wire Upload → Extraction, Add Loading States** (~1 hr)

**Goal:** Connect frontend to backend end-to-end.

Tasks:
- On file submit, call `POST /api/extract`, show a loading spinner/skeleton during the request.
- On success, display extracted text in a readable panel (preserve line breaks, use `<pre>`-like styling or paragraph splitting).
- On failure, show the backend's error message in a dismissible alert — do not fail silently or leave the UI stuck loading.
- Add a "try another file" / reset action.

**Definition of done:** Full happy path works in the browser: upload → loading → extracted text displayed. Failure path shows a clear error and lets the user retry.

---

### **Phase 4 — Engagement Analysis** (~2 hrs)

**Goal:** Analyze extracted text and surface actionable, non-generic suggestions.

Tasks:
- Build a `POST /api/analyze` endpoint (or fold into `/api/extract` response — agent's call, but keep it a distinct, testable function either way).
- Implement rule-based analysis (no paid API required, keeps this within free-tier constraint and avoids external dependency/latency):
  - **Length check** — flag if post is too short/too long for typical platform norms; suggest a target range.
  - **Hashtag check** — count hashtags present; suggest an ideal range if 0 or too many.
  - **Call-to-action detection** — simple keyword/pattern check (e.g., "comment," "share," "click," "link in bio," question marks) and note if missing.
  - **Readability** — basic score (e.g., average sentence length, or a simple Flesch-Kincaid style calculation) with a plain-language takeaway.
  - **Emoji/tone check** (optional if time allows) — flag if content is very plain/text-heavy with no visual break.
- Return suggestions as a structured list with a short label + explanation each, not a wall of text.
- Display these as cards/list items in the UI, next to or below the extracted text.

**Definition of done:** For a given extracted text, the UI shows 3–5 concrete, differentiated suggestions — not placeholder text.

---

### **Phase 5 — Polish, Error Handling Pass, Docs, Deploy** (~1.5 hrs)

**Goal:** Ship it.

Tasks:
- **Error handling audit:** revisit every async call (upload, extract, analyze) and confirm there's a loading state, a success state, and a visible error state. No unhandled promise rejections.
- **UI polish:** consistent spacing/typography, mobile-responsive check, disable submit button while processing, clear visual hierarchy between "extracted text" and "suggestions."
- **README.md** — finalize with:
  - What the app does
  - Tech stack
  - Setup/run instructions (local)
  - API contract summary
  - Known limitations
  - Approach write-up (this doubles as your ≤200-word deliverable — keep a copy of just that paragraph handy for direct submission)
- **Deploy:**
  - Backend to Render/Railway free tier.
  - Frontend to Vercel/Netlify free tier (or serve statically from backend if unified).
  - Confirm the live URL works end-to-end after deploy (re-test the full flow on the deployed version, not just localhost).
- **Repo hygiene check against submission guidelines:**
  - Confirm branch is `main`.
  - Confirm repo is public.
  - Confirm no `node_modules`, `.env`, `dist/`, `.vscode/`, etc. are committed (`git ls-files | grep` sanity check).
  - Confirm repo size is small/downloadable.
  - Confirm dependencies list is minimal — remove any unused packages from `package.json`.

**Definition of done:** Live URL works, repo is clean and public on `main`, README is complete, write-up paragraph is ready to paste into the submission form.

---

## 4. Explicit Non-Goals (do not build these)

- No user accounts / auth.
- No database / persistence of past uploads.
- No paid AI API integration (stay free-tier).
- No multi-file batch upload (single file at a time is sufficient for the assessment).
- No CI/CD pipeline setup (out of scope for an 8-hour assessment).

---

## 5. Final Deliverables Checklist

- [ ] Working hosted application URL
- [ ] Public GitHub repo, `main` branch, clean of excluded files, with README
- [ ] ≤200-word approach write-up (drafted from the README's "Approach" section)
- [ ] Manually re-tested on the deployed URL, not just localhost, before submitting
