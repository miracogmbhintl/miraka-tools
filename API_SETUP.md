# Website Intelligence API Setup

## Overview

The Website Intelligence tool uses OpenAI's GPT-4o-mini to analyze websites and provide business insights.

## Architecture

### Flow
1. **Frontend** → User enters URL and clicks "Analyze Website"
2. **API Endpoint** (`/api/analyze-website`) → Receives URL
3. **Web Scraper** → Fetches and extracts website content (meta tags, headings, content)
4. **AI Analysis** → Sends extracted data to OpenAI for structured analysis
5. **Response** → Returns business intelligence data to frontend

### Components

#### 1. API Endpoint
- **File**: `src/pages/api/analyze-website.ts`
- **Method**: POST
- **Input**: `{ url: string }`
- **Output**: Structured business intelligence JSON

#### 2. Web Scraper
- Uses `node-html-parser` to extract:
  - Title and meta description
  - Headings (H1, H2, H3)
  - Paragraph content
  - Technical indicators (forms, images, links)
  - Feature detection (pricing, testimonials, blog, contact)

#### 3. AI Analyzer
- **Model**: GPT-4o-mini (cost-effective, fast)
- **Input**: Structured website data
- **Output**: Business intelligence including:
  - Executive Snapshot (business type, market scope, goals, clarity score)
  - Core Variables (9 key business metrics)
  - Strategic Signals (4 actionable observations)
  - Next Moves (prioritized recommendations)

## Setup Instructions

### 1. Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-...`)

### 2. Configure Environment Variable

**For Local Development:**
Add to your `.env` file:
```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**For Cloudflare Workers (Production):**
Add the secret via Wrangler CLI:
```bash
npx wrangler secret put OPENAI_API_KEY
```
Or add via Cloudflare Dashboard:
1. Go to Workers & Pages → Your App
2. Settings → Variables
3. Add Environment Variable: `OPENAI_API_KEY` = `sk-...`

### 3. Install Dependencies
Already included in package.json:
```bash
npm install
```

Dependencies:
- `openai` - OpenAI API client
- `node-html-parser` - Fast HTML parsing
- `cheerio` - jQuery-like HTML manipulation (fallback)

## API Usage

### Request
```bash
POST /api/analyze-website
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Response (Success)
```json
{
  "success": true,
  "data": {
    "executiveSnapshot": {
      "businessType": "B2B SaaS",
      "marketScope": "Global",
      "primaryGoal": "Lead Gen",
      "clarityScore": 82
    },
    "coreVariables": {
      "businessType": "Project management software for teams",
      "targetAudience": "Software development teams, 10-100 employees",
      "offerStructure": "Tiered subscription model",
      "pricingPositioning": "Mid-market competitive pricing",
      "conversionFocus": "Free trial signup, Demo requests",
      "contentDepth": "Comprehensive product documentation",
      "trustSignals": "Customer logos, testimonials, case studies",
      "structuralWeaknesses": "Limited pricing transparency on homepage"
    },
    "strategicSignals": [
      "Strong product-led growth indicators present",
      "Missing social proof above the fold",
      "Clear value proposition but delayed CTA",
      "Mobile optimization needs attention"
    ],
    "nextMoves": [
      {
        "title": "Optimize Above-the-Fold Conversion",
        "priority": "high",
        "description": "Move primary CTA higher and add social proof..."
      }
    ]
  },
  "metadata": {
    "analyzedUrl": "https://example.com",
    "timestamp": "2026-01-23T18:00:00.000Z"
  }
}
```

### Response (Error)
```json
{
  "error": "Failed to scrape website: 404 Not Found"
}
```

## Cost Estimation

Using GPT-4o-mini:
- **Input**: ~1,500 tokens per analysis (website data + prompt)
- **Output**: ~800 tokens (structured JSON response)
- **Cost**: ~$0.0006 per analysis
- **Budget**: $10 = ~16,600 analyses

## Rate Limits

OpenAI API limits (default tier):
- **Requests**: 500 per minute
- **Tokens**: 200,000 per minute
- Should handle typical usage without issues

## Error Handling

The API handles:
1. **Invalid URLs** - Returns 400 error
2. **Failed Scraping** - Website unreachable, blocked, or invalid
3. **OpenAI API Errors** - Rate limits, invalid API key, timeouts
4. **Parsing Errors** - Malformed HTML or AI response

## Security Considerations

1. **API Key Protection**
   - Never commit API keys to Git
   - Use environment variables only
   - Rotate keys if exposed

2. **Rate Limiting** (Recommended to add)
   - Limit requests per IP
   - Add Cloudflare rate limiting rules

3. **URL Validation**
   - Only HTTP/HTTPS protocols allowed
   - Validates URL format before processing

4. **CORS** (If needed)
   - Currently server-side only
   - Add CORS headers if calling from external domains

## Monitoring & Debugging

**Check Logs:**
```bash
# Local development
npm run dev

# Production (Cloudflare)
npx wrangler tail
```

**Test API Directly:**
```bash
curl -X POST http://localhost:4321/api/analyze-website \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

## Future Enhancements

1. **Caching** - Cache results for same URL (24h TTL)
2. **Rate Limiting** - Prevent abuse
3. **Screenshot Analysis** - Add visual analysis
4. **Competitor Analysis** - Compare multiple sites
5. **Historical Tracking** - Track changes over time
6. **Export Options** - PDF, CSV reports
7. **Webhook Integration** - Notify when analysis complete
8. **Batch Analysis** - Analyze multiple URLs at once

## Troubleshooting

### "OpenAI API key not configured"
- Verify `.env` file exists with `OPENAI_API_KEY`
- Restart dev server after adding environment variable

### "Failed to scrape website"
- Check if website is publicly accessible
- Some sites block scrapers (use user-agent headers)
- Try different URL format (www. vs non-www)

### "Failed to analyze with AI"
- Check OpenAI API key is valid
- Verify account has credits
- Check OpenAI status page for outages

### Timeout errors
- Large websites take longer to scrape
- Consider increasing timeout limits
- Reduce amount of content sent to AI

## Support

For issues or questions:
1. Check error messages in browser console
2. Check server logs in terminal
3. Verify environment variables are set
4. Test with simple websites first (e.g., example.com)
