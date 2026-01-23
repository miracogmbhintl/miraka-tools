# 📚 Deployment Documentation Index

## 🎯 Start Here

**New to deployment?** Start with this order:

1. **[CLOUDFLARE_PAGES_MANUAL_DEPLOY.md](./CLOUDFLARE_PAGES_MANUAL_DEPLOY.md)** ⭐ START HERE
   - Complete step-by-step deployment guide
   - Configure environment variables
   - Test your deployment
   - Integration with Webflow

2. **[DEPLOYMENT_ARCHITECTURE.md](./DEPLOYMENT_ARCHITECTURE.md)**
   - Understand the system architecture
   - See how all components connect
   - Data flow diagrams
   - Request/response lifecycle

3. **[DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)**
   - Common issues and fixes
   - Diagnostic checklist
   - Debugging tools
   - Support resources

---

## 📦 Deployment Package

**File:** `miraka-tools-deployment.zip`
**Size:** 921 KB
**Location:** Root of this project

**Contents:**
- `_worker.js/` - SSR entry point (Cloudflare Workers)
- `_astro/` - Static assets (CSS, JS, fonts)
- `_routes.json` - Routing configuration
- `favicon.ico` - Site icon

**What's included:**
- ✅ 6 fully functional tools
- ✅ AI-powered Website Intelligence
- ✅ Miraka & Co. branded UI
- ✅ SSR enabled
- ✅ API routes for OpenAI
- ✅ PDF download feature
- ✅ Professional review link

---

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Download deployment package
#    File: miraka-tools-deployment.zip

# 2. Extract locally
unzip miraka-tools-deployment.zip -d dist/

# 3. Go to Cloudflare Dashboard
open https://dash.cloudflare.com/

# 4. Create Pages Project
#    Workers & Pages → Create → Pages → Upload assets

# 5. Upload all files from dist/
#    (drag & drop or file selector)

# 6. Add environment variable
#    Settings → Environment variables → Add
#    Name: OPENAI_API_KEY
#    Value: <your-openai-key>

# 7. Redeploy
#    Deployments → Latest → Retry deployment

# 8. Test
open https://YOUR-PROJECT.pages.dev/tools
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for Website Intelligence | `sk-proj-...` |

### Cloudflare Pages Settings

| Setting | Value | Notes |
|---------|-------|-------|
| **Framework preset** | Astro | Auto-detected |
| **Build command** | (empty) | Pre-built |
| **Output directory** | `dist` | Already built |
| **Functions** | Enabled | Auto-detected from `_worker.js/` |

---

## 🏗️ Architecture Overview

```
User Request (miraka.ch/tools)
    ↓
Webflow Frontend (iframe/embed)
    ↓
Cloudflare Pages (YOUR-PROJECT.pages.dev)
    ├── SSR Rendering (Astro)
    ├── API Routes (/api/*)
    └── Static Assets (/_astro/*)
    ↓
OpenAI API (analysis)
```

**Key Points:**
- Public URL: `https://miraka.ch/tools`
- Backend URL: `https://YOUR-PROJECT.pages.dev` (internal)
- No DNS changes required
- No custom domain needed
- Webflow controls routing and navigation

---

## 🛠️ Tools Included

1. **Website Intelligence** 🤖
   - AI-powered website analysis
   - GPT-4 integration
   - PDF export
   - Professional review request

2. **Color Picker** 🎨
   - Interactive color selection
   - Multiple format outputs (HEX, RGB, HSL)
   - Copy to clipboard

3. **Image Color Picker** 🖼️
   - Extract colors from images
   - Upload or paste image
   - Color palette generation

4. **QR Code Generator** 📱
   - Custom QR codes
   - Downloadable PNG
   - Configurable size

5. **HTML Preview** 👁️
   - Live HTML rendering
   - Code editor
   - Real-time preview

6. **More tools** ✨
   - Extensible architecture
   - Easy to add new tools

---

## 📊 Pages & Routes

| Route | Description | SSR |
|-------|-------------|-----|
| `/` | Homepage (Miraka & Co. branding) | Yes |
| `/tools` | Tools listing page | Yes |
| `/analysis` | Website Intelligence tool | Yes |
| `/color-picker` | Color picker tool | Yes |
| `/image-color-picker` | Image color picker tool | Yes |
| `/qr` | QR code generator | Yes |
| `/html` | HTML preview tool | Yes |
| `/api/analyze-website` | AI analysis API | Yes |
| `/_astro/*` | Static assets | No (CDN) |
| `/404` | Branded 404 page | Yes |

---

## 🔐 Security

### Environment Variables
- Never commit API keys to git
- Use Cloudflare dashboard to set secrets
- Rotate keys regularly

### CORS
- API routes allow same-origin requests
- Frontend and API on same domain
- No CORS issues

### Rate Limiting
- OpenAI has built-in rate limits
- Consider implementing app-level limits for production

---

## 🧪 Testing

### Local Testing
```bash
# Build the app
npm run build

# Preview locally (simulates Cloudflare)
npm run preview

# Open browser
open http://localhost:4321
```

### Production Testing
```bash
# Test homepage
curl https://YOUR-PROJECT.pages.dev/

# Test tools page
curl https://YOUR-PROJECT.pages.dev/tools

# Test API
curl -X POST https://YOUR-PROJECT.pages.dev/api/analyze-website \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

---

## 📈 Monitoring

### Cloudflare Analytics
- **Requests:** Track traffic and usage
- **Performance:** Monitor response times
- **Errors:** Identify issues quickly

### Real-time Logs
- **Location:** Functions → Real-time logs
- **Shows:** All console.log(), errors, requests
- **Use:** Debugging production issues

### Usage Tracking
- **OpenAI Dashboard:** Track API usage
- **Cloudflare Workers:** Monitor compute time

---

## 🔄 Updates & Maintenance

### Deploying Updates

1. **Make changes** in this sandbox
2. **Rebuild:** `npm run build`
3. **Download** new `dist/` folder
4. **Upload** to Cloudflare Pages
   - Deployments → Create deployment
   - Upload new files
5. **Test** new deployment

### Rollback

If something breaks:
1. Go to **Deployments** tab
2. Find previous working deployment
3. Click **"Rollback to this deployment"**
4. Confirm rollback

### Environment Changes

When updating environment variables:
1. Settings → Environment variables → Edit
2. Save changes
3. **Must redeploy** for changes to take effect

---

## 🌐 Webflow Integration

### Method 1: Iframe Embed (Recommended)

Add to Webflow page:
```html
<iframe 
  src="https://YOUR-PROJECT.pages.dev/tools"
  width="100%"
  height="100vh"
  frameborder="0"
  style="border: none; display: block;">
</iframe>
```

### Method 2: Webflow Proxy Page

Create a Webflow page that proxies to Cloudflare:
1. Create `/tools` page in Webflow
2. Use Webflow's embed feature
3. Load Cloudflare Pages content

### Method 3: Custom Integration

For advanced use:
- Cloudflare Workers to proxy requests
- Custom routing rules
- Requires DNS control

---

## 📖 Additional Resources

### Documentation Files

| File | Purpose |
|------|---------|
| `API_SETUP.md` | OpenAI API configuration |
| `ARCHITECTURE.md` | Code architecture |
| `CHEAT_SHEET.md` | Quick reference |
| `README.md` | Project overview |
| `WHAT_WAS_BUILT.md` | Feature list |

### External Links

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Astro Docs](https://docs.astro.build/)
- [OpenAI API Docs](https://platform.openai.com/docs/)
- [Webflow Docs](https://university.webflow.com/)

---

## ✅ Deployment Checklist

Before going live:

```
[ ] Downloaded deployment package
[ ] Created Cloudflare Pages project
[ ] Uploaded all files correctly
[ ] Verified _worker.js/ detected
[ ] Added OPENAI_API_KEY environment variable
[ ] Redeployed after adding env var
[ ] Tested homepage loads
[ ] Tested /tools page loads
[ ] Tested Website Intelligence tool works
[ ] Tested API endpoint returns data
[ ] Verified no console errors
[ ] Checked real-time logs
[ ] Documented deployment URL
[ ] Created Webflow integration page
[ ] Tested full user flow
```

---

## 🆘 Need Help?

1. **Check troubleshooting guide:** [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md)
2. **Review logs:** Cloudflare dashboard → Functions → Real-time logs
3. **Test endpoints:** Use curl or Postman to isolate issues
4. **Verify configuration:** Double-check all settings in dashboard

---

## 🎉 Success!

When everything is deployed and working:

✅ **Your tools are live** at `https://YOUR-PROJECT.pages.dev`
✅ **SSR is working** (pages render server-side)
✅ **API is functional** (Website Intelligence works)
✅ **Webflow integrated** (users access via miraka.ch)
✅ **Ready for production** 🚀

---

**Next Step:** Open [CLOUDFLARE_PAGES_MANUAL_DEPLOY.md](./CLOUDFLARE_PAGES_MANUAL_DEPLOY.md) and follow the guide!
