# Deployment Setup Guide for Webflow Apps

## Important: Environment Variables in Webflow Apps

This app is deployed through **Webflow's native Cloudflare integration**, which means environment variables need to be configured differently than standard Cloudflare Workers.

## Setting Environment Variables in Webflow Apps

### Method 1: Through Webflow Dashboard (Recommended)

1. **Go to Webflow Apps Dashboard**
   - Navigate to your Webflow workspace
   - Go to "Apps" or "Developer" section
   - Find your deployed app

2. **Add Environment Variables**
   - Look for "Settings" or "Environment Variables" section
   - Add the following variable:
     - **Name**: `OPENAI_API_KEY`
     - **Value**: Your OpenAI API key (starts with `sk-`)
     - **Environment**: Select "Production" (and "Development" if available)

3. **Redeploy**
   - After saving, trigger a new deployment
   - This is typically automatic, but you may need to push a change or manually redeploy

### Method 2: Contact Webflow Support

If you can't find environment variable settings in the dashboard:

1. **Contact Webflow Support**
   - Email: support@webflow.com
   - In the message, request to add environment variables to your Webflow App
   - Provide:
     - Your app name/ID
     - Environment variable name: `OPENAI_API_KEY`
     - The value (your OpenAI API key)

2. **Alternative: Webflow Community/Forum**
   - Visit: https://forum.webflow.com/
   - Search for "environment variables" or "secrets"
   - Post your question if needed

### Method 3: Using .env File (Local Development Only)

For **local development** only, add to your `.env` file:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

⚠️ **Important**: The `.env` file only works locally. For production, you must use Method 1 or 2.

---

## Environment Variables Needed

| Variable Name | Description | Required | Environment |
|--------------|-------------|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes (for Website Intelligence) | Production + Development |
| `WEBFLOW_API_HOST` | Webflow API host (if using custom) | No | Auto-configured by Webflow |
| `WEBFLOW_SITE_API_TOKEN` | Webflow site token | No | Auto-configured by Webflow |
| `WEBFLOW_CMS_SITE_API_TOKEN` | Webflow CMS token | No | Auto-configured by Webflow |

---

## Getting an OpenAI API Key

If you don't have an OpenAI API key yet:

1. **Sign Up / Log In**
   - Go to https://platform.openai.com/
   - Create an account or sign in

2. **Create API Key**
   - Navigate to "API Keys" section
   - Click "Create new secret key"
   - Name it something like "Webflow-Website-Intelligence"
   - Copy the key (starts with `sk-`)
   - **Important**: Save it securely - you won't see it again!

3. **Add Credits**
   - Go to "Billing" section
   - Add payment method
   - Add credits (minimum $5-10 recommended)
   - The Website Intelligence tool uses `gpt-4o-mini` which is very cost-effective

4. **Test Your Key**
   - Use the test script included in the project:
   ```bash
   node test-api.js
   ```

---

## Cost Estimation

**Using GPT-4o-mini:**
- **Cost per analysis**: ~$0.0006 (less than a cent!)
- **Budget example**: $10 = ~16,600 website analyses
- **Monthly estimate**: For 100 analyses/month = ~$0.06

---

## Verifying the Setup

### 1. Check Local Development

```bash
# Add to .env file
OPENAI_API_KEY=sk-your-key-here

# Start dev server
npm run dev

# Visit http://localhost:4321/analysis
# Test with a URL
```

### 2. Check Production Deployment

After setting environment variables in Webflow:

1. Visit your deployed app URL
2. Navigate to the Website Intelligence tool
3. Enter a test URL (e.g., `https://example.com`)
4. Click "Analyze Website"
5. If it works, you'll see the analysis results
6. If it fails, check the error message

### 3. Debug Error Messages

The API now provides detailed debug information. If you see:

**"OpenAI API key not configured"**
- The environment variable is not set in Webflow
- Follow Method 1 or 2 above to set it

**"Failed to scrape website"**
- The target website may be blocking requests
- Try a different website (like `https://example.com`)
- Check if the URL is correct and publicly accessible

**"OpenAI API error: 401"**
- Your API key is invalid or expired
- Check that you copied the full key including `sk-`
- Verify the key is active in OpenAI dashboard

**"Failed to fetch" or timeout**
- Some websites take longer to analyze
- Try a smaller website first
- The API has a 10-second timeout for scraping

---

## Troubleshooting Webflow Apps Deployment

### Environment Variables Not Working

1. **Verify Variable Name**
   - Must be exactly: `OPENAI_API_KEY`
   - No extra spaces or characters

2. **Check Variable Scope**
   - Ensure it's set for "Production" environment
   - Some systems require both "Production" and "Preview"

3. **Trigger New Deployment**
   - Environment changes may require a fresh deployment
   - Make a small change and commit/push
   - Or use Webflow's redeploy function

4. **Wait for Propagation**
   - Changes may take 1-5 minutes to propagate
   - Try again after waiting a bit

### Still Not Working?

**Option A: Temporary Workaround**
You can temporarily hardcode the API key for testing (NOT recommended for production):

```typescript
// In src/pages/api/analyze-website.ts
// TEMPORARY - REMOVE BEFORE COMMITTING
const openaiKey = 'sk-your-key-here' || locals?.runtime?.env?.OPENAI_API_KEY;
```

⚠️ **Warning**: Remove this before committing to Git!

**Option B: Use Webflow Support**
Contact Webflow support with:
- Your app name/ID
- Screenshot of the error
- Request help setting environment variables

---

## Security Best Practices

1. **Never Commit Secrets**
   - `.env` file is in `.gitignore`
   - Never hardcode API keys in source code
   - Never share API keys publicly

2. **Monitor Usage**
   - Check OpenAI usage dashboard regularly
   - Set usage limits in OpenAI dashboard
   - Enable email alerts for high usage

3. **Rotate Keys Regularly**
   - Generate new keys every 3-6 months
   - Immediately rotate if exposed
   - Keep old key active during transition

4. **Restrict API Key Permissions**
   - Use separate keys for dev/prod if possible
   - Set rate limits in OpenAI dashboard
   - Monitor for suspicious activity

---

## Next Steps After Setup

Once environment variables are configured:

1. **Test the Website Intelligence Tool**
   - Analyze a few different websites
   - Verify the AI responses are accurate
   - Check the PDF download feature

2. **Monitor Costs**
   - Check OpenAI usage dashboard after first week
   - Adjust budget if needed
   - Consider adding rate limiting if usage is high

3. **Share with Team**
   - Provide access to the tool
   - Document any custom workflows
   - Gather feedback for improvements

---

## Additional Resources

- **OpenAI Documentation**: https://platform.openai.com/docs
- **Webflow Apps Documentation**: https://developers.webflow.com/
- **Project Documentation**: See `API_SETUP.md` for technical details
- **Webflow Support**: https://university.webflow.com/

---

## Need Help?

If you're still having issues after following this guide:

1. Check the browser console for detailed error messages
2. Look at the network tab to see the API request/response
3. Test locally first with `.env` file to verify the API works
4. Contact Webflow support for help with environment variables in their platform

The Website Intelligence tool will show a helpful error message if the API key is not configured, including debug information about the environment.
