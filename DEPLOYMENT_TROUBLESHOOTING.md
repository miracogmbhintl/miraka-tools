# 🐛 Deployment Troubleshooting Guide

## Common Issues & Solutions

---

## ❌ Issue 1: "Functions not enabled" in Cloudflare Pages

### Symptoms:
- Dashboard shows "Functions: Disabled"
- SSR not working
- All pages return 404

### Cause:
Cloudflare didn't detect the `_worker.js/` folder

### Solution:

**Step 1:** Verify file structure before upload
```
dist/
├── _worker.js/          ← Must be exactly this name
│   ├── index.js         ← Must exist
│   └── ...
├── _routes.json         ← Must exist in root
└── ...
```

**Step 2:** Re-upload with correct structure
- Ensure you uploaded **contents** of `dist/`, not the `dist/` folder itself
- The upload should show `_worker.js/` at the root level, not nested

**Step 3:** Check deployment logs
- Go to **Deployments** tab
- Click on latest deployment
- Look for: "✓ Functions detected"

---

## ❌ Issue 2: API returns 500 or "Missing API key"

### Symptoms:
- Website Intelligence tool shows error
- API endpoint returns 500 status
- Console shows: "Missing OPENAI_API_KEY"

### Cause:
Environment variable not set or not loaded

### Solution:

**Step 1:** Verify environment variable exists
1. Go to **Settings** → **Environment variables**
2. Confirm `OPENAI_API_KEY` is listed
3. Confirm it's set for **Production** environment

**Step 2:** Redeploy to load variable
⚠️ **CRITICAL:** Adding env vars requires redeployment!

1. Go to **Deployments** tab
2. Find latest deployment
3. Click **"···"** menu → **"Retry deployment"**
4. Wait for deployment to complete

**Step 3:** Test the API
```bash
curl -X POST https://YOUR-PROJECT.pages.dev/api/analyze-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

Expected: JSON response with analysis data
Not: 500 error or "Missing API key"

---

## ❌ Issue 3: Static assets 404 (CSS/JS not loading)

### Symptoms:
- Pages load but no styling
- JavaScript not working
- Console shows 404 for `/_astro/*` files

### Cause:
`_astro/` folder not uploaded or `_routes.json` misconfigured

### Solution:

**Step 1:** Verify `_astro/` folder uploaded
1. Check deployment files in dashboard
2. Confirm `_astro/` folder exists with CSS/JS files

**Step 2:** Check `_routes.json`
Should contain:
```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/_astro/*", "/favicon.ico"]
}
```

The `exclude` tells Cloudflare to serve these directly (not through worker)

**Step 3:** Re-upload if missing
- Download fresh `dist/` folder
- Ensure `_astro/` is included
- Upload all files again

---

## ❌ Issue 4: "Invalid API key" from OpenAI

### Symptoms:
- API endpoint works but returns OpenAI error
- Error message: "Invalid API key"
- Website Intelligence tool fails with API error

### Cause:
Wrong API key or key format issue

### Solution:

**Step 1:** Verify API key format
OpenAI keys look like: `sk-proj-...` or `sk-...`

NOT like:
- `cf_...` (Cloudflare token)
- `32-character hex` (Account ID)

**Step 2:** Test key locally
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_KEY_HERE"
```

Should return list of models, not 401 error

**Step 3:** Update in Cloudflare
1. Delete old `OPENAI_API_KEY` variable
2. Add new one with correct key
3. **Redeploy** (critical!)

---

## ❌ Issue 5: Pages load but routes are broken

### Symptoms:
- Homepage works
- `/tools` returns 404
- `/analysis` returns 404

### Cause:
Base path configuration issue

### Solution:

**Step 1:** Check `_routes.json`
```json
{
  "version": 1,
  "include": ["/*"],    ← Should include ALL routes
  "exclude": ["/_astro/*"]
}
```

**Step 2:** Verify Astro config
File: `astro.config.mjs`
```javascript
export default defineConfig({
  base: process.env.BASE_PATH || '',  // Should be empty for Pages root
  // ...
});
```

**Step 3:** If using subdirectory (advanced):
Only needed if deploying to `/tools` subdirectory on Pages

---

## ❌ Issue 6: CORS errors when calling API

### Symptoms:
- Browser console: "CORS policy blocked"
- API works in curl but not in browser
- Error from frontend fetch calls

### Cause:
API not sending CORS headers

### Solution:

This shouldn't happen with the current setup (API and frontend on same domain), but if it does:

**Add CORS headers to API route:**
```typescript
// In src/pages/api/analyze-website.ts
return new Response(JSON.stringify(data), {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
});
```

---

## ❌ Issue 7: Deployment succeeds but site is blank

### Symptoms:
- Deployment shows success
- URL loads but shows blank page
- No errors in console

### Cause:
React hydration issue or missing DevLinkProvider

### Solution:

**Step 1:** Check browser console for errors
Look for:
- "Hydration failed"
- "DevLinkProvider not found"
- React errors

**Step 2:** Verify build output
The `dist/` folder should contain:
- `_worker.js/` (SSR logic)
- `_astro/` (client-side JS)
- `_routes.json`

**Step 3:** Test in local preview first
Before uploading, test locally:
```bash
npm run preview
```

If it works locally but not on Pages, check:
- All files uploaded correctly
- No file size limits exceeded
- Deployment logs for errors

---

## ❌ Issue 8: "Too many requests" from OpenAI

### Symptoms:
- API works sometimes
- Error: "Rate limit exceeded"
- Website Intelligence fails intermittently

### Cause:
OpenAI rate limits hit

### Solution:

**Step 1:** Check OpenAI dashboard
https://platform.openai.com/usage

**Step 2:** Implement rate limiting
Add to API route:
```typescript
// Simple in-memory rate limit (per deployment)
const rateLimits = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);
  
  if (limit && now - limit < 60000) {
    return false; // Too fast
  }
  
  rateLimits.set(ip, now);
  return true;
}
```

**Step 3:** Upgrade OpenAI plan if needed
Or implement caching for repeated URLs

---

## ❌ Issue 9: Webflow iframe doesn't load Pages app

### Symptoms:
- Iframe shows blank or error
- Console shows: "Refused to frame"
- Pages app works directly but not in iframe

### Cause:
X-Frame-Options header blocking iframe

### Solution:

**Step 1:** Check if Pages sets X-Frame-Options
View response headers:
```bash
curl -I https://YOUR-PROJECT.pages.dev
```

**Step 2:** If blocked, add custom headers
In Cloudflare Pages:
1. Go to **Settings** → **Functions**
2. Create `_headers` file in root:
```
/*
  X-Frame-Options: ALLOWALL
  Content-Security-Policy: frame-ancestors https://miraka.ch
```

**Step 3:** Redeploy with `_headers` file

---

## 🔍 General Debugging Steps

### 1. Check Real-time Logs
- Go to **Functions** tab in Pages dashboard
- Click **"Real-time logs"**
- Open your app in browser
- Watch logs for errors

### 2. Test Each Layer
```bash
# Test 1: Static assets
curl https://YOUR-PROJECT.pages.dev/favicon.ico
# Should: Return file

# Test 2: SSR homepage
curl https://YOUR-PROJECT.pages.dev/
# Should: Return HTML

# Test 3: API endpoint
curl -X POST https://YOUR-PROJECT.pages.dev/api/analyze-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
# Should: Return JSON analysis
```

### 3. Check Deployment Status
```bash
# In Cloudflare dashboard
Deployments → Latest → View details

Look for:
✓ Functions enabled
✓ Environment variables set
✓ Build successful
✓ Routes configured
```

---

## 📊 Diagnostic Checklist

Run through this checklist when debugging:

```
[ ] Deployment succeeded (green checkmark)
[ ] Functions are enabled (check dashboard)
[ ] _worker.js/ folder detected
[ ] _routes.json exists in root
[ ] Environment variables set (OPENAI_API_KEY)
[ ] Redeployed after adding env vars
[ ] Static assets (_astro/) uploaded
[ ] Homepage loads correctly
[ ] /tools route works
[ ] /analysis route works
[ ] API endpoint returns data (not 500)
[ ] Browser console shows no errors
[ ] Real-time logs show no errors
```

If all checked ✅, your deployment is working!

---

## 🆘 Still Having Issues?

### Get More Info:

**1. Export deployment logs:**
- Deployments → Click deployment → View logs
- Copy full log output

**2. Check function invocation logs:**
- Functions → Real-time logs
- Reproduce the issue
- Copy error messages

**3. Test with curl:**
```bash
# Homepage
curl -v https://YOUR-PROJECT.pages.dev/

# API
curl -v -X POST https://YOUR-PROJECT.pages.dev/api/analyze-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**4. Browser DevTools:**
- Open Console tab (errors)
- Open Network tab (failed requests)
- Open Application tab (check storage)

---

## 📞 Support Resources

- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Astro Cloudflare Docs:** https://docs.astro.build/en/guides/integrations-guide/cloudflare/
- **OpenAI API Docs:** https://platform.openai.com/docs/

---

**Most issues are solved by:**
1. ✅ Ensuring `_worker.js/` is uploaded correctly
2. ✅ Redeploying after adding environment variables
3. ✅ Checking real-time logs for specific errors

Good luck with your deployment! 🚀
