# job-hunt-ai-ui 🎨

A local React + Node.js web interface for the [job-hunt-ai](https://github.com/mandavaakhilkumar/job-hunt-ai) pipeline.

Run the pipeline through a clean browser UI instead of the command line.

---

## What it looks like

```
┌─────────────────────────────────────────┐
│  🚀 job-hunt-ai                          │
│  AI-powered resume tailoring...          │
├─────────────────────────────────────────┤
│  [1. Setup] → [2. Running] → [3. Results]│
├─────────────────────────────────────────┤
│                                         │
│  📄 Drop your resume PDF here           │
│  📋 Paste job description               │
│  ⚙️  Email / options                    │
│                                         │
│              [🚀 Run Pipeline]          │
└─────────────────────────────────────────┘
```

---

## Prerequisites

1. **job-hunt-ai** cloned and set up at `../job-hunt-ai`  
   → Follow its [README](../job-hunt-ai/README.md) first

2. **Node.js 18+** — [download](https://nodejs.org)

3. **Python 3.10+** with job-hunt-ai dependencies installed

---

## Setup

### 1. Clone this repo (if separate) or navigate to the ui folder

```bash
cd job-hunt-ai-ui
```

### 2. Install all dependencies (server + client)

```bash
npm install
npm run install:all
```

### 3. Make sure job-hunt-ai is set up next to this folder

```
projects/
├── job-hunt-ai/          ← Python pipeline
│   ├── main.py
│   └── ...
└── job-hunt-ai-ui/       ← This UI project
    ├── server/
    └── client/
```

---

## Running locally

```bash
npm run dev
```

This starts both:
- **Server** → `http://localhost:3001` (Express API + SSE log streaming)
- **Client** → `http://localhost:3000` (React UI)

Open `http://localhost:3000` in your browser.

---

## How to use

### Step 1 — Setup
- **Drop your resume PDF** into the upload area
- **Paste the full job description** into the text area
- **Enter your email** (or check "skip email" to just download)
- Click **🚀 Run Pipeline**

### Step 2 — Running
- Watch the **8-step progress tracker** update in real time
- See **live terminal output** as the pipeline runs
- Each step completes before the next starts

### Step 3 — Results
- **Download your 4 key deliverables** directly from the browser:
  - `resume_final.pdf` — 2-page ATS-optimized resume
  - `resume_final.docx` — editable Word version
  - `interview_prep.pdf` — 20+ Q&A interview guide
  - `interview_prep.docx` — editable interview guide
- All intermediate files (v1, v2) also available

---

## Project structure

```
job-hunt-ai-ui/
├── package.json              # Root — runs both server + client
├── server/
│   ├── index.js              # Express server + SSE streaming
│   ├── package.json
│   ├── uploads/              # Temp files (auto-cleaned)
│   └── outputs/              # Pipeline output files
└── client/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js             # Main layout + step routing
        ├── App.css            # Global styles
        ├── index.js
        ├── index.css
        └── pages/
            ├── PipelineForm.js    # Step 1: inputs
            ├── PipelineRunner.js  # Step 2: live logs
            └── Results.js         # Step 3: downloads
```

---

## Architecture

```
Browser (React :3000)
       │
       │ POST /api/run  (resume PDF + JD text)
       │ GET  /api/logs/:jobId  (SSE stream)
       │ GET  /api/download/:jobId/:file
       ▼
Express Server (:3001)
       │
       │ spawn()
       ▼
Python Pipeline (job-hunt-ai/main.py)
       │
       ▼
Claude API → PDF/DOCX files → streamed back to browser
```

---

## Tech stack

- **Frontend**: React 18, react-dropzone, axios
- **Backend**: Node.js, Express, multer (file upload)
- **Streaming**: Server-Sent Events (SSE) for live log output
- **Pipeline**: Calls `job-hunt-ai` Python CLI via `child_process.spawn`

---

## Author

**Akhil Kumar Mandava** — [github.com/mandavaakhilkumar](https://github.com/mandavaakhilkumar)
