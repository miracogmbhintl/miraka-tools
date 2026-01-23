# How to Get Your Cloudflare API Token

## What You Currently Have

The value you added to `.env` appears to be a **Cloudflare Account ID** (37 characters), not an API Token.

- **Account ID**: Short identifier (32-37 chars) - Used for identifying your account
- **API Token**: Long secret key (40+ chars) - Used for authentication

## Getting the Correct API Token

### Step 1: Go to Cloudflare Dashboard

Visit: **https://dash.cloudflare.com/profile/api-tokens**

### Step 2: Create API Token

1. Click **"Create Token"**
2. Find **"Edit Cloudflare Workers"** template
3. Click **"Use template"**

### Step 3: Configure Token (Optional)

The default settings are good, but you can customize:

- **Permissions**: 
  - Account → Cloudflare Workers Scripts → Edit ✅
  - User → User Details → Read ✅

- **Account Resources**:
  - Include → All accounts (or select specific account)

- **Zone Resources** (if using custom domain):
  - Include → All zones (or select specific zone)

### Step 4: Create and Copy Token

1. Click **"Continue to summary"**
2. Review permissions
3. Click **"Create Token"**
4. **⚠️ COPY THE TOKEN NOW** - You won't see it again!

The token will look like:
```
y8KHLTqVxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Add to .env

Replace your current `CLOUDFLARE_API_TOKEN` value in `.env`:

```bash
CLOUDFLARE_API_TOKEN=y8KHLTqVxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Alternative: Find Your Account ID

If you need your Account ID for other purposes:

1. Go to: https://dash.cloudflare.com/
2. Click on "Workers & Pages"
3. Look at the URL - the Account ID is in the path:
   ```
   https://dash.cloudflare.com/ACCOUNT_ID_HERE/workers
   ```

Or on the right sidebar under "Account ID"

---

## Two Ways to Deploy

### Option A: Using API Token in .env (Automated)

Once you have the correct API token in `.env`:

```bash
# Build the app
npm run build

# Set the OpenAI secret (one-time)
export $(cat .env | grep -v '^#' | grep -v '^\s*$' | xargs)
echo "$OPENAI_API_KEY" | npx wrangler secret put OPENAI_API_KEY

# Deploy
npx wrangler deploy
```

### Option B: Interactive Login (Easier)

Skip the token entirely and use interactive login:

```bash
# Login (opens browser)
npx wrangler login

# Set OpenAI secret
npx wrangler secret put OPENAI_API_KEY
# (Paste your OpenAI key when prompted)

# Build and deploy
npm run build
npx wrangler deploy
```

---

## Complete Deployment Commands

Once you have the correct token OR logged in:

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Build the app
npm run build

# 3. Set OpenAI API key (one-time)
npx wrangler secret put OPENAI_API_KEY
# Paste: sk-your-openai-key-here

# 4. Deploy
npx wrangler deploy

# 5. Get your live URL
# Output will show: https://astro.your-account.workers.dev
```

---

## Troubleshooting

### "Invalid format for Authorization header"
❌ You're using an Account ID or Global API Key  
✅ Create a new API Token (see Step 2 above)

### "Authentication error"
- Make sure you created the token with "Edit Cloudflare Workers" permissions
- Token should be 40+ characters long
- Try `npx wrangler login` instead

### "Token not found"
```bash
# Check .env file
cat .env | grep CLOUDFLARE_API_TOKEN

# Make sure to export it
export $(cat .env | grep -v '^#' | grep -v '^\s*$' | xargs)
echo $CLOUDFLARE_API_TOKEN
```

---

## Security Reminder

⚠️ **Your Cloudflare API token has full access to your Workers!**

- Never commit `.env` to Git
- Never share tokens publicly
- Rotate tokens if exposed
- Use token with minimal required permissions

---

## Next Steps

1. ✅ Get correct API Token from Cloudflare dashboard
2. ✅ Update `.env` file with the token
3. ✅ Run deployment commands above
4. ✅ Visit your live app!

Need help? Let me know which error you're seeing and I'll help troubleshoot! 😊
