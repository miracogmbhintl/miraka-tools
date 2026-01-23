# 🚀 Cloudflare Pages Manual Deployment Guide

## 📋 Pre-Deployment Checklist

✅ **Deployment package ready:** `miraka-tools-deployment.zip` (921 KB)
✅ **SSR enabled:** `dist/_worker.js/index.js` detected
✅ **Routes configured:** `dist/_routes.json` present
✅ **OpenAI API key:** Ready to add as environment variable

---

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│         https://miraka.ch/                  │
│         (Webflow - Public Domain)           │
└─────────────────┬───────────────────────────┘
                  │
                  │ Proxy/Embed /tools/*
                  │
                  ▼
┌─────────────────────────────────────────────┐
│   https://<project>.pages.dev/              │
│   (Cloudflare Pages - Internal Only)        │
│   • SSR Rendering (Astro)                   │
│   • API Routes (/api/analyze-website)       │
│   • OpenAI Integration                      │
└─────────────────────────────────────────────┘
```

**Users never see the `.pages.dev` URL - they stay on `miraka.ch`**

---

## 📦 Step-by-Step Deployment

### Step 1: Download the Deployment Package

1. **Download from this sandbox:**
   - File: `miraka-tools-deployment.zip`
   - Size: ~921 KB
   - Location: Root directory of this project

2. **Extract locally** (you'll upload the contents, not the zip)
   - Extract to a folder called `dist/`
   - Verify you see: `_worker.js/`, `_astro/`, `_routes.json`, `favicon.ico`

---

### Step 2: Access Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com/
2. Login with your account
3. Select your account (if you have multiple)

---

### Step 3: Create New Pages Project

1. In the left sidebar, click **"Workers & Pages"**
2. Click **"Create application"** button
3. Select **"Pages"** tab
4. Click **"Upload assets"**

---

### Step 4: Configure Project Settings

Fill in these exact values:

| Field | Value |
|-------|-------|
| **Project name** | `miraka-tools` (or your preference) |
| **Production branch** | Leave as default |

Click **"Create project"**

---

### Step 5: Upload Files

**IMPORTANT:** Upload the **contents** of the `dist/` folder, not the folder itself.

1. You should see an upload interface
2. Drag and drop ALL files from inside `dist/`:
   - `_worker.js/` (folder)
   - `_astro/` (folder)
   - `_routes.json` (file)
   - `favicon.ico` (file)

3. **OR** use the file selector to upload all files

4. Click **"Deploy site"**

⏱️ Deployment takes ~30-60 seconds

---

### Step 6: Verify SSR is Active

After deployment completes:

1. Go to **Settings** → **Functions**
2. Confirm you see:
   - ✅ **"Functions enabled"** or **"Advanced mode"**
   - ✅ **"_worker.js detected"**

If you see this, SSR is working! ✅

---

### Step 7: Add Environment Variable

1. Go to **Settings** → **Environment variables**
2. Click **"Add variable"**
3. Fill in:
   - **Variable name:** `OPENAI_API_KEY`
   - **Value:** (paste your OpenAI API key)
   - **Environment:** Select **"Production"**
4. Click **"Save"**

⚠️ **IMPORTANT:** After adding the variable, you must **redeploy**:
- Go to **Deployments** tab
- Find the latest deployment
- Click **"···"** menu → **"Retry deployment"**

This ensures the environment variable is loaded.

---

### Step 8: Test Your Deployment

1. Find your deployment URL:
   - Format: `https://miraka-tools.pages.dev` or `https://miraka-tools-abc.pages.dev`
   - Located at the top of your Pages dashboard

2. **Test these URLs:**

   ```
   ✅ Homepage:
   https://miraka-tools.pages.dev/

   ✅ Tools page:
   https://miraka-tools.pages.dev/tools

   ✅ Website Intelligence (should load):
   https://miraka-tools.pages.dev/analysis

   ✅ API endpoint (test with curl):
   curl -X POST https://miraka-tools.pages.dev/api/analyze-website \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com"}'
   ```

3. **Expected behavior:**
   - ✅ Pages load correctly
   - ✅ SSR rendering works
   - ✅ API returns analysis data (not errors)

---

## 🔍 Post-Deployment Checklist

Confirm these are all ✅:

- [ ] **SSR is active** (Functions enabled in dashboard)
- [ ] **Routes are respected** (Static assets load from `/_astro/*`)
- [ ] **Worker entry is detected** (`dist/_worker.js/index.js`)
- [ ] **Environment variable is set** (`OPENAI_API_KEY`)
- [ ] **API endpoint works** (`/api/analyze-website` returns data)
- [ ] **All tools load** (Color Picker, QR Code, etc.)

---

## 🔗 Integration with Webflow

### Option A: Iframe Embed (Simplest)

Add this to your Webflow page where you want `/tools`:

```html
<iframe 
  src="https://miraka-tools.pages.dev/tools" 
  width="100%" 
  height="800px"
  frameborder="0"
  style="border: none;">
</iframe>
```

### Option B: Cloudflare Proxy Rules (Advanced)

Set up a Worker to proxy `miraka.ch/tools/*` to `miraka-tools.pages.dev/*`

This requires:
1. Cloudflare controlling DNS for `miraka.ch`
2. Creating a Worker with routing rules

**Note:** Only use this if Webflow doesn't control your DNS.

### Option C: Webflow Proxy Page (Recommended)

Create a Webflow page at `/tools` that loads the Cloudflare Pages content.

---

## 📊 Monitoring & Logs

### View Real-Time Logs

1. Go to your Pages project
2. Click **"Functions"** tab
3. Click **"Real-time logs"**

This shows all requests, errors, and console.log output.

### Check Analytics

1. Go to **"Analytics"** tab
2. See:
   - Requests per minute
   - Error rates
   - Response times

---

## 🐛 Troubleshooting

### Issue: "Functions not enabled"

**Fix:**
- Redeploy with `_worker.js/` folder included
- Ensure `_routes.json` is in the root

### Issue: API returns 500 errors

**Fix:**
1. Check environment variables are set
2. Redeploy after adding `OPENAI_API_KEY`
3. View logs to see actual error

### Issue: Assets 404 (CSS/JS not loading)

**Fix:**
- Ensure `_astro/` folder is uploaded
- Check `_routes.json` excludes `/_astro/*`

### Issue: Base path issues (routes broken)

**Fix:**
- Verify `baseUrl` in code is set correctly
- For Pages root deployment, it should be `''` (empty string)

---

## 🔄 Future Updates

To deploy updates:

1. **Build new version** (in this sandbox):
   ```bash
   npm run build
   ```

2. **Download new `dist/` folder**

3. **Upload to Cloudflare Pages:**
   - Go to **Deployments** tab
   - Click **"Create deployment"**
   - Upload new files
   - Click **"Save and deploy"**

---

## 🎉 Deployment Complete!

Once you see:
✅ Pages URL is live
✅ SSR is working
✅ API endpoints respond
✅ Environment variables loaded

**You're ready to integrate with Webflow!**

Your Cloudflare Pages URL will be:
```
https://<your-project-name>.pages.dev
```

This URL is **internal only** - users will access via `miraka.ch/tools/*`

---

## 📞 Need Help?

If you encounter issues:

1. Check **Real-time logs** in Cloudflare dashboard
2. Verify environment variables are set
3. Ensure all files were uploaded correctly
4. Test individual routes to isolate issues

---

**Ready to deploy? Start with Step 1!** 🚀
