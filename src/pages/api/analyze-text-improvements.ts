import type { APIRoute } from 'astro';

interface TextImprovementRequest {
  businessName: string;
  businessType: string;
  targetAudience: string;
  title: string;
  description: string;
  headings: string[];
  paragraphs: string[];
}

interface TextComparison {
  location: string;
  currentText: string;
  suggestedText: string;
  reason: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get OpenAI API key
    let openaiKey = null;
    
    if (locals?.runtime?.env?.OPENAI_API_KEY) {
      openaiKey = locals.runtime.env.OPENAI_API_KEY;
    } else if (import.meta.env.OPENAI_API_KEY) {
      openaiKey = import.meta.env.OPENAI_API_KEY;
    }
    
    if (!openaiKey) {
      return new Response(JSON.stringify({
        error: 'OpenAI API key not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body: TextImprovementRequest = await request.json();

    const prompt = `You are a professional copywriter analyzing website text. Review the following website content and suggest SELECTIVE improvements.

IMPORTANT GUIDELINES:
- ONLY suggest changes where there is a clear, meaningful improvement
- If the existing text is already good, suggest keeping it (suggestedText = currentText)
- Focus on clarity, specificity, and user benefit
- Avoid generic marketing speak
- Consider the business context: ${body.businessName} (${body.businessType}) serving ${body.targetAudience}
- Maximum 4-5 suggestions total - quality over quantity
- Be specific with your reasoning

Website Content:
Title: ${body.title}
Description: ${body.description}
Main Headings: ${body.headings.slice(0, 5).join(' | ')}
Sample Text: ${body.paragraphs.slice(0, 3).join(' ')}

Analyze and return ONLY valid JSON (no markdown) with selective text improvements:

{
  "improvements": [
    {
      "location": "Specific location (e.g., 'Homepage title', 'Main headline', 'Meta description')",
      "currentText": "The actual current text from the website",
      "suggestedText": "Your suggested improvement OR the same text if it's already good",
      "reason": "Brief, specific explanation of why this change helps (or why current text is effective)"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional copywriter. Return only valid JSON, no markdown. Be selective and thoughtful with suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/g, '');
    }
    
    const result = JSON.parse(content);
    
    return new Response(JSON.stringify({
      success: true,
      improvements: result.improvements || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Text Improvements] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Analysis failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
