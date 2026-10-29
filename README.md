# CareerLens AI — Advanced Resume Intelligence

## Included
- Redesigned responsive frontend (`index.html`).
- PDF upload/drop-zone; server-side Python extraction with `pypdf` (`api/extract.py`).
- Gemini structured output through the existing secure Node serverless function (`api/analyze.js`).
- Detailed report: match estimate, role fit, matched/partial/missing skills, requirement evidence table, priority gaps, honest resume rewrites, interview questions, 7-day action plan, keywords, JSON export.

## Run locally
1. Install Node.js 20+ and Python 3.12+.
2. Add `.env.local` in the root with `GEMINI_API_KEY=your_real_key` (never commit it).
3. `npm install -g vercel`
4. Run `vercel dev` and open the local URL.
5. Upload a text-based PDF, inspect extracted text, paste a full job description, and analyze.

Vercel's Python runtime installs packages from `requirements.txt`. If local extraction fails, check that Python is installed and the Vercel CLI is up to date.

## Deploy
Commit all files except `.env.local`, including `api/extract.py` and `requirements.txt`. Add `GEMINI_API_KEY` in Vercel Settings → Environment Variables and redeploy.

## Limitations
- Scanned/image-only PDFs are not OCR'd.
- PDF maximum: 3 MB and 25 pages; extracted text maximum: 20,000 characters.
- Resume text is sent to Gemini for analysis; use sample resumes or obtain permission.
- The match score is an AI estimate, not an actual ATS score or hiring probability.
- This starter has no authentication or persistent rate limiting; add abuse protection before broad public use.
- Model configured: `gemini-3.8-flash`; verify availability in Google's current documentation if access changes.

Live link - https://carrerlensproject.vercel.app/
 
