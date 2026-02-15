
import type { APIRoute } from 'astro';
import { parse } from 'node-html-parser';

// Types for our analysis
interface WebsiteAnalysis {
  executiveSnapshot: {
    businessName: string;
    industry: string;
    businessType: string;
    marketScope: string;
    primaryGoal: string;
    clarityScore: number;
  };
  coreVariables: {
    businessType: string;
    targetAudience: string;
    offerStructure: string;
    pricingNote?: string;
    pricingPositioning: string;
    conversionFocus: string;
    contentDepth: string;
    trustSignals: string;
    structuralWeaknesses: string;
  };
  strategicSignals: string[];
  strengthsHighlights: string[]; // NEW: What's working well
  nextMoves: Array<{
    title: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }>;
}

interface WebsiteData {
  url: string;
  title: string;
  description: string;
  headings: string[];
  paragraphs: string[];
  links: number;
  images: number;
  hasContactForm: boolean;
  hasPricing: boolean;
  hasTestimonials: boolean;
  hasBlog: boolean;
  metaKeywords?: string;
  structuredData?: any;
}

// Extract website content
async function scrapeWebsite(url: string): Promise<WebsiteData> {
  try {
    console.log('[Scrape] Starting for:', url);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MirakaBot/1.0; +https://miraka.ch)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log('[Scrape] HTML received, length:', html.length);
    
    const root = parse(html);

    // Extract meta information
    const title = root.querySelector('title')?.text || '';
    const description = root.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const metaKeywords = root.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';

    // Extract headings
    const headings = [
      ...root.querySelectorAll('h1, h2, h3').map(h => h.text.trim()).filter(Boolean)
    ].slice(0, 20); // Limit to first 20 headings

    // Extract paragraphs
    const paragraphs = [
      ...root.querySelectorAll('p').map(p => p.text.trim()).filter(Boolean)
    ].slice(0, 30); // Limit to first 30 paragraphs

    // Count elements
    const links = root.querySelectorAll('a').length;
    const images = root.querySelectorAll('img').length;

    // Detect features (simple keyword matching)
    const bodyText = root.querySelector('body')?.text.toLowerCase() || '';
    const hasContactForm = /contact|get in touch|reach out|send.*message/i.test(bodyText) || root.querySelectorAll('form').length > 0;
    const hasPricing = /pricing|price|\$|cost|plan/i.test(bodyText);
    const hasTestimonials = /testimonial|review|client.*say|customer.*story/i.test(bodyText);
    const hasBlog = /blog|article|news|post/i.test(bodyText);

    console.log('[Scrape] Extraction complete:', { title, headings: headings.length, paragraphs: paragraphs.length });

    return {
      url,
      title,
      description,
      headings,
      paragraphs,
      links,
      images,
      hasContactForm,
      hasPricing,
      hasTestimonials,
      hasBlog,
      metaKeywords
    };
  } catch (error) {
    console.error('[Scrape] Error:', error);
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Analyze with OpenAI
async function analyzeWithAI(websiteData: WebsiteData, apiKey: string): Promise<WebsiteAnalysis> {
  const prompt = `You are a business intelligence analyst specializing in website analysis. Analyze the following website data and provide structured business intelligence.

Website URL: ${websiteData.url}
Title: ${websiteData.title}
Meta Description: ${websiteData.description}

Key Headings:
${websiteData.headings.slice(0, 10).join('\n')}

Sample Content:
${websiteData.paragraphs.slice(0, 5).join('\n\n')}

Technical Indicators:
- Links: ${websiteData.links}
- Images: ${websiteData.images}
- Has Contact Form: ${websiteData.hasContactForm}
- Has Pricing: ${websiteData.hasPricing}
- Has Testimonials: ${websiteData.hasTestimonials}
- Has Blog: ${websiteData.hasBlog}

Provide a comprehensive business intelligence analysis in the following JSON format (return ONLY valid JSON, no markdown):

IMPORTANT CATEGORIZATION GUIDELINES:
- Business Name: Extract the actual company/brand name from title, headings, or branding elements
- Industry: Identify the specific industry sector (e.g., "Management Consulting", "Web Design", "E-commerce", "Healthcare", "Financial Services")
- Business Type: Use ONE of these standardized categories based on the business model:
  * "B2B Service Provider" - Professional services targeting businesses
  * "B2C Service Provider" - Services targeting individual consumers
  * "E-commerce" - Online retail/product sales
  * "SaaS Platform" - Software as a service
  * "Agency" - Marketing, design, or creative agency
  * "Consultancy" - Strategy, management, or specialized consulting
  * "Marketplace" - Platform connecting buyers and sellers
  * "Educational" - Courses, training, or educational content
  * "Non-profit" - Charitable or cause-driven organization
  * "Local Business" - Physical location-based service (restaurant, retail, etc.)

{
  "executiveSnapshot": {
    "businessName": "The actual business/company name",
    "industry": "Specific industry sector (e.g., 'Management Consulting', 'Digital Marketing')",
    "businessType": "Use ONE standardized category from the list above",
    "marketScope": "Market scope (e.g., 'Regional', 'National', 'Global', 'Local')",
    "primaryGoal": "Primary goal (e.g., 'Lead Generation', 'E-commerce Sales', 'Brand Awareness', 'User Acquisition')",
    "clarityScore": 75
  },
  "coreVariables": {
    "businessType": "Detailed business type description with specifics",
    "targetAudience": "Target audience description",
    "offerStructure": "Offer structure description",
    "pricingNote": "Optional pricing note if relevant",
    "pricingPositioning": "Pricing positioning",
    "conversionFocus": "Primary conversion methods",
    "contentDepth": "Content depth assessment",
    "trustSignals": "Trust signals present",
    "structuralWeaknesses": "Main structural weakness"
  },
  "strategicSignals": [
    "Signal 1 - clear, actionable observation",
    "Signal 2 - clear, actionable observation",
    "Signal 3 - clear, actionable observation",
    "Signal 4 - clear, actionable observation"
  ],
  "strengthsHighlights": [
    "Positive observation 1 - what's working well",
    "Positive observation 2 - effective elements to maintain",
    "Positive observation 3 - strong aspects of the site"
  ],
  "nextMoves": [
    {
      "title": "Action title",
      "priority": "high",
      "description": "Detailed description of recommended action"
    },
    {
      "title": "Action title",
      "priority": "high",
      "description": "Detailed description"
    },
    {
      "title": "Action title",
      "priority": "medium",
      "description": "Detailed description"
    }
  ]
}`;

  try {
    console.log('[OpenAI] Starting analysis...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a business intelligence analyst. Return only valid JSON in your responses, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[OpenAI] API error:', response.status, error);
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    console.log('[OpenAI] Response received, parsing...');
    
    // Remove markdown code blocks if present
    let jsonContent = content;
    if (content.startsWith('```json')) {
      jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (content.startsWith('```')) {
      jsonContent = content.replace(/```\n?/g, '');
    }
    
    const analysis = JSON.parse(jsonContent);
    console.log('[OpenAI] Analysis complete');
    return analysis;
  } catch (error) {
    console.error('[OpenAI] Error:', error);
    throw new Error(`Failed to analyze with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    console.log('[API] Request received');
    
    // Get OpenAI API key from environment - try multiple sources
    let openaiKey = null;
    
    // Try Cloudflare Workers env first (deployment)
    if (locals?.runtime?.env?.OPENAI_API_KEY) {
      openaiKey = locals.runtime.env.OPENAI_API_KEY;
      console.log('[API] Using OpenAI key from Cloudflare env');
    }
    // Then try Astro import.meta.env (local dev)
    else if (import.meta.env.OPENAI_API_KEY) {
      openaiKey = import.meta.env.OPENAI_API_KEY;
      console.log('[API] Using OpenAI key from import.meta.env');
    }
    
    if (!openaiKey) {
      console.error('[API] OpenAI API key not found in environment');
      return new Response(JSON.stringify({
        error: 'OpenAI API key not configured. Please contact the administrator.',
        debug: {
          hasLocals: !!locals,
          hasRuntime: !!locals?.runtime,
          hasRuntimeEnv: !!locals?.runtime?.env,
          envKeys: locals?.runtime?.env ? Object.keys(locals.runtime.env) : []
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json();
    const { url } = body;

    if (!url) {
      console.error('[API] URL missing from request');
      return new Response(JSON.stringify({
        error: 'URL is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[API] Analyzing URL:', url);

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch (e) {
      console.error('[API] Invalid URL format:', url);
      return new Response(JSON.stringify({
        error: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Step 1: Scrape website
    console.log('[API] Step 1: Scraping website...');
    const websiteData = await scrapeWebsite(validUrl.toString());

    // Step 2: Analyze with AI
    console.log('[API] Step 2: Analyzing with AI...');
    const analysis = await analyzeWithAI(websiteData, openaiKey);

    console.log('[API] Analysis complete, returning results');
    
    // Return analysis WITH raw website data
    return new Response(JSON.stringify({
      success: true,
      data: analysis,
      websiteData: {
        url: websiteData.url,
        title: websiteData.title,
        description: websiteData.description,
        headings: websiteData.headings,
        paragraphs: websiteData.paragraphs,
        links: websiteData.links,
        images: websiteData.images,
        hasContactForm: websiteData.hasContactForm,
        hasPricing: websiteData.hasPricing,
        hasTestimonials: websiteData.hasTestimonials,
        hasBlog: websiteData.hasBlog
      },
      metadata: {
        analyzedUrl: validUrl.toString(),
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API] Fatal error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Analysis failed',
      details: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};






