# ViralLens

ViralLens is a modern, full-stack web application designed for content creators and social media managers. It extracts text from uploaded PDFs and images (via PDF parsing and OCR) and analyzes the content to provide actionable engagement suggestions.

## Features

- **Drag-and-Drop Uploads**: A premium, glassmorphism-styled UI for easy file uploads.
- **Client-Side Validation**: Ensures only supported file types (PDF, PNG, JPEG) and sizes (under 10MB) are uploaded.
- **Smart Text Extraction**:
  - Uses `pdf-parse` for fast, accurate text extraction from PDF documents.
  - Uses `tesseract.js` for Optical Character Recognition (OCR) to extract text from images.
- **Engagement Analysis Engine**: A rule-based system that analyzes the extracted content for:
  - Optimal post length
  - Ideal hashtag count (3-5)
  - Call-to-Action (CTA) presence
  - Readability (average sentence length)
  - Emoji/tone recommendations
- **Stateless Architecture**: Uploads are processed entirely in memory via `multer.memoryStorage()`, ensuring no residual files are left on the server.

## Architecture

This project is structured as a monorepo containing:

- **Frontend (`/client`)**: React + Vite + TypeScript. Uses Vanilla CSS for styling.
- **Backend (`/server`)**: Node.js + Express + TypeScript. Exposes a REST API (`/api/extract`).

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher recommended)

## Getting Started

### 1. Install Dependencies

Install dependencies for both the frontend and backend:

```bash
# In the root directory (optional, if you have a root package.json)
# Otherwise, navigate to each folder:

cd client
npm install

cd ../server
npm install
```

### 2. Run Locally

You can run both development servers concurrently.

**Start the Backend (API):**
```bash
cd server
npm run dev
# Runs on http://localhost:3001
```

**Start the Frontend (UI):**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

Vite is configured to proxy API requests from `/api` to the backend server at `http://localhost:3001`.

## Deployment

### Backend
1. Build the TypeScript code: `npm run build`
2. Deploy the `/server` folder to your preferred Node.js hosting provider (e.g., Render, Railway, Heroku).
3. Ensure the environment uses Node 18+.

### Frontend
1. Build the Vite app: `npm run build`
2. Deploy the generated `dist` folder to a static hosting provider (e.g., Vercel, Netlify, GitHub Pages).
3. Update the production API URL if the backend is not hosted on the same domain.

## License

MIT License
