# 🏗️ Deployment Architecture

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         END USER                                │
│                  https://miraka.ch/tools                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ (User never leaves miraka.ch)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WEBFLOW FRONTEND                             │
│                    https://miraka.ch                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /tools page (Webflow)                                   │  │
│  │  - Contains iframe or proxy                              │  │
│  │  - Points to Cloudflare Pages                            │  │
│  │  - Maintains miraka.ch domain                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Embed/Proxy
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 CLOUDFLARE PAGES (Internal)                     │
│           https://miraka-tools.pages.dev                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SSR RENDERING (Astro)                                   │  │
│  │  - Server-side React components                          │  │
│  │  - Dynamic page generation                               │  │
│  │  - Base path: / (not /tools)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API ROUTES                                              │  │
│  │  - /api/analyze-website (POST)                           │  │
│  │  - OpenAI integration                                    │  │
│  │  - Cheerio web scraping                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STATIC ASSETS                                           │  │
│  │  - /_astro/* (CSS, JS, images)                           │  │
│  │  - Served directly by Cloudflare CDN                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ API Calls
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OPENAI API                                 │
│                  https://api.openai.com                         │
│                                                                 │
│  - GPT-4 model for website analysis                            │
│  - API key stored in Cloudflare env vars                       │
│  - Called from /api/analyze-website endpoint                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure on Cloudflare Pages

```
dist/
├── _worker.js/                 ← SSR Entry Point (Cloudflare detects this)
│   ├── index.js                ← Main worker entry
│   ├── manifest.json           ← Astro manifest
│   ├── renderers.mjs           ← React renderers
│   ├── pages/                  ← Route handlers
│   │   ├── index.astro.mjs     ← Homepage
│   │   ├── tools.astro.mjs     ← Tools listing
│   │   ├── analysis.astro.mjs  ← Website Intelligence
│   │   └── api/
│   │       └── analyze-website.astro.mjs  ← AI API endpoint
│   └── chunks/                 ← Code bundles
│
├── _astro/                     ← Static Assets (served by CDN)
│   ├── *.css                   ← Stylesheets
│   ├── *.js                    ← Client-side JavaScript
│   └── *.woff2                 ← Fonts
│
├── _routes.json                ← Route Configuration
│   {
│     "version": 1,
│     "include": ["/*"],         ← All routes go through worker
│     "exclude": ["/_astro/*"]   ← Except static assets
│   }
│
└── favicon.ico                 ← Site icon
```

---

## 🔄 Request Flow

### Example: User visits https://miraka.ch/tools

```
1. User clicks link on miraka.ch
   ↓
2. Webflow serves /tools page
   ↓
3. Page contains iframe/embed pointing to:
   https://miraka-tools.pages.dev/tools
   ↓
4. Cloudflare Pages receives request
   ↓
5. _routes.json checks: /tools → include (goes to worker)
   ↓
6. _worker.js/index.js handles request
   ↓
7. Astro SSR renders tools.astro page
   ↓
8. React components hydrate on client
   ↓
9. User interacts with tools
   ↓
10. If Website Intelligence used:
    - Frontend calls /api/analyze-website
    - Worker executes analyze-website.astro.mjs
    - OpenAI API analyzes website
    - Results returned to frontend
    ↓
11. User sees analysis results
```

---

## 🔐 Environment Variables Flow

```
┌─────────────────────────────────────────────┐
│  Cloudflare Pages Dashboard                │
│  Settings → Environment Variables           │
│                                             │
│  OPENAI_API_KEY = sk-...                    │
└───────────────┬─────────────────────────────┘
                │
                │ Injected at runtime
                │
                ▼
┌─────────────────────────────────────────────┐
│  Cloudflare Worker Runtime                  │
│  (Executes _worker.js/index.js)             │
│                                             │
│  Access via:                                │
│  - locals.runtime.env.OPENAI_API_KEY        │
│  - import.meta.env.OPENAI_API_KEY           │
└───────────────┬─────────────────────────────┘
                │
                │ Used by API route
                │
                ▼
┌─────────────────────────────────────────────┐
│  /api/analyze-website                       │
│                                             │
│  const token = locals?.runtime?.env         │
│    ?.OPENAI_API_KEY || import.meta.env      │
│    .OPENAI_API_KEY;                         │
└─────────────────────────────────────────────┘
```

---

## 🌐 Network Architecture

```
Internet
   │
   │ DNS: miraka.ch → Webflow
   │
   ▼
┌──────────────────────┐
│  Webflow CDN         │
│  (serves HTML/CSS)   │
└──────────┬───────────┘
           │
           │ Embeds iframe
           │
           ▼
┌──────────────────────┐      ┌──────────────────────┐
│  Cloudflare Pages    │──────│  Cloudflare CDN      │
│  (SSR + API)         │      │  (static assets)     │
└──────────┬───────────┘      └──────────────────────┘
           │
           │ API calls
           │
           ▼
┌──────────────────────┐
│  OpenAI API          │
│  (GPT-4 analysis)    │
└──────────────────────┘
```

---

## 🚀 Deployment Process

```
Developer Sandbox
     │
     │ npm run build
     │
     ▼
┌──────────────────────┐
│  dist/ folder        │
│  (built artifacts)   │
└──────────┬───────────┘
           │
           │ zip & download
           │
           ▼
┌──────────────────────┐
│  Local machine       │
│  (unzip package)     │
└──────────┬───────────┘
           │
           │ manual upload
           │
           ▼
┌──────────────────────┐
│  Cloudflare Pages    │
│  Dashboard           │
│  - Upload files      │
│  - Set env vars      │
│  - Deploy            │
└──────────┬───────────┘
           │
           │ deployment
           │
           ▼
┌──────────────────────┐
│  Live on .pages.dev  │
│  ✅ SSR enabled      │
│  ✅ API working      │
│  ✅ Ready to embed   │
└──────────────────────┘
```

---

## 🔗 Integration Points

### Point 1: Webflow → Cloudflare Pages

**Webflow page HTML:**
```html
<div class="tools-container">
  <iframe 
    src="https://miraka-tools.pages.dev/tools"
    width="100%"
    height="100vh"
    frameborder="0"
    style="border: none;">
  </iframe>
</div>
```

### Point 2: Frontend → API

**React component:**
```typescript
const response = await fetch('/api/analyze-website', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: websiteUrl })
});
```

### Point 3: API → OpenAI

**API route:**
```typescript
const client = new OpenAI({
  apiKey: locals?.runtime?.env?.OPENAI_API_KEY
});

const completion = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [...]
});
```

---

## 📊 Data Flow Example

### Website Intelligence Tool

```
User enters URL: "https://example.com"
     │
     │ 1. React component state update
     │
     ▼
Frontend makes API call
POST /api/analyze-website
{ url: "https://example.com" }
     │
     │ 2. Astro API route receives request
     │
     ▼
Worker fetches website HTML
     │
     │ 3. Cheerio parses HTML
     │
     ▼
Extract metadata, content, structure
     │
     │ 4. Send to OpenAI API
     │
     ▼
GPT-4 analyzes website
     │
     │ 5. Returns structured analysis
     │
     ▼
API formats response
     │
     │ 6. Returns JSON to frontend
     │
     ▼
React component displays results
     │
     │ 7. User sees analysis
     │
     ▼
User can download PDF or request review
```

---

## 🎯 Summary

| Component | Technology | Purpose | URL |
|-----------|-----------|---------|-----|
| **Frontend** | Webflow | User-facing domain | miraka.ch |
| **SSR Runtime** | Cloudflare Pages | Server-side rendering | miraka-tools.pages.dev |
| **API** | Astro API Routes | Backend logic | /api/* |
| **AI** | OpenAI GPT-4 | Website analysis | api.openai.com |
| **Assets** | Cloudflare CDN | Static files | /_astro/* |

**Key Points:**
- ✅ No custom DNS required
- ✅ No domain changes
- ✅ Webflow stays primary frontend
- ✅ Cloudflare handles SSR + API only
- ✅ Users never see .pages.dev URL
- ✅ Seamless integration via iframe/proxy

---

**Ready to deploy?** Follow the steps in `CLOUDFLARE_PAGES_MANUAL_DEPLOY.md` 🚀
