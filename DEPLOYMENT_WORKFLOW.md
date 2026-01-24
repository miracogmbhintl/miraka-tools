# 🚀 Deployment Workflow for Miraka & Co. Tools

## Current Setup
- **Code Editor**: Webflow Sandbox (where AI makes changes)
- **Version Control**: GitHub (private repo: `miraka-tools-app`)
- **Hosting**: Cloudflare Pages (connected to GitHub)

## How to Deploy Changes

### Step 1: Check What Changed
```bash
cd /app
git status
```

### Step 2: Stage All Changes
```bash
git add .
```

### Step 3: Commit with a Message
```bash
git commit -m "Updated favicon and app icons"
```

### Step 4: Push to GitHub
```bash
git push origin main
```

### Step 5: Cloudflare Automatically Deploys
- Cloudflare Pages detects the push
- Builds your app automatically
- Deploys to `tools.miraka.ch`
- Takes ~2-3 minutes

## Quick Deploy Script

Run this one-liner to deploy everything:

```bash
cd /app && git add . && git commit -m "Deploy updates" && git push origin main
```

## Check Deployment Status

Visit your Cloudflare Pages dashboard:
1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages**
3. Click on your **miraka-tools-app** project
4. View the **Deployments** tab to see build progress

## Common Issues

### Authentication Error
If you get "Authentication failed", regenerate your Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Delete old token, create new one
3. Use new token as password when pushing

### Build Failed
Check the Cloudflare deployment logs to see what went wrong.

## Environment Variables

Remember to set these in Cloudflare Pages (not in code):
- `OPENAI_API_KEY` - For Website Intelligence tool
- `WEBFLOW_CMS_SITE_API_TOKEN` - If using CMS features

---

**Questions?** Just ask in Webflow chat!
