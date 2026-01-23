# Quick Start - Deploy Your App

## 🚀 Easiest Way to Deploy

The simplest way to deploy is using interactive login:

### Step 1: Login to Cloudflare

```bash
npx wrangler login
```

This will open your browser and authenticate you automatically.

### Step 2: Build Your App

```bash
npm run build
```

### Step 3: Set Your OpenAI API Key (One-time)

```bash
npx wrangler secret put OPENAI_API_KEY
```

When prompted, paste your OpenAI API key from `.env`

### Step 4: Deploy!

```bash
npx wrangler deploy
```

That's it! 🎉

---

## 📋 All Commands in Order

Copy and paste these one at a time:

```bash
# 1. Login
npx wrangler login

# 2. Build
npm run build

# 3. Set OpenAI secret (paste your key when prompted)
npx wrangler secret put OPENAI_API_KEY

# 4. Deploy
npx wrangler deploy
```

---

## 🔍 Check Your Deployment

After deployment, Wrangler will show you:

```
Published astro (X.XX sec)
  https://astro.your-username.workers.dev
```

Visit that URL to see your live app!

---

## 🐛 Troubleshooting API Token Issues

If the API token in `.env` isn't working, here's why:

### Common Issues:

1. **Wrong Token Type**
   - ❌ Account ID (32-37 chars)
   - ❌ Global API Key
   - ✅ API Token from https://dash.cloudflare.com/profile/api-tokens

2. **Insufficient Permissions**
   - Token needs "Edit Cloudflare Workers" permissions
   - Use the "Edit Cloudflare Workers" template when creating

3. **Token Expired or Revoked**
   - Create a new token
   - Make sure you copied it completely

### To Create Correct Token:

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Select "Edit Cloudflare Workers" template
4. Click "Continue to summary"
5. Click "Create Token"
6. Copy the ENTIRE token (should be 40+ characters)

---

## 🔐 Using API Token (Alternative Method)

If you want to use the token in `.env` instead of interactive login:

### Step 1: Verify Token Works

```bash
export $(cat .env | grep -v '^#' | grep -v '^\s*$' | xargs)
npx wrangler whoami
```

If you see your account info, the token works! ✅

If you see an error, create a new token (see above).

### Step 2: Deploy with Token

```bash
# Build
npm run build

# Set secret (loads token from .env automatically)
export $(cat .env | grep -v '^#' | grep -v '^\s*$' | xargs)
echo "$OPENAI_API_KEY" | npx wrangler secret put OPENAI_API_KEY

# Deploy
npx wrangler deploy
```

---

## 📝 What Gets Deployed

When you deploy, Cloudflare Workers will:

1. ✅ Upload your built Astro app
2. ✅ Set environment variables
3. ✅ Store secrets securely (OPENAI_API_KEY)
4. ✅ Give you a live URL

---

## 🔄 Updating Your Deployment

To deploy updates:

```bash
npm run build
npx wrangler deploy
```

That's it! No need to set secrets again.

---

## ❓ Need Help?

### Check Deployment Status
```bash
npx wrangler deployments list
```

### View Logs (Real-time)
```bash
npx wrangler tail
```

### Test Locally First
```bash
npm run preview
```

---

## 📚 More Info

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)

---

Ready to deploy? Start with `npx wrangler login` 🚀
