import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { url, format, quality } = await request.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'Video URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // BACKEND NOT YET CONFIGURED
    // ============================================
    // This is a placeholder API route. To make this work, you need to:
    // 
    // 1. Deploy yt-dlp backend service (see instructions below)
    // 2. Set YTDLP_API_URL in your .env file
    // 3. Uncomment the backend integration code below
    //
    // Example backend services:
    // - Railway.app (recommended)
    // - Render.com
    // - DigitalOcean App Platform
    // - Your own VPS
    // ============================================

    const YTDLP_API_URL = import.meta.env.YTDLP_API_URL;

    if (!YTDLP_API_URL) {
      return new Response(
        JSON.stringify({ 
          error: 'Backend not configured',
          message: 'The video download backend is not yet set up. Please configure YTDLP_API_URL in your environment variables.',
          documentation: 'See API_SETUP.md for deployment instructions'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // BACKEND INTEGRATION (uncomment when ready)
    // ============================================
    /*
    const backendResponse = await fetch(`${YTDLP_API_URL}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        format,
        quality
      })
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(errorData.error || 'Download failed');
    }

    const data = await backendResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: data.downloadUrl,
        filename: data.filename
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    */

    // Temporary response for testing
    return new Response(
      JSON.stringify({ 
        error: 'Backend not configured',
        message: 'Please set up the yt-dlp backend service and configure YTDLP_API_URL environment variable.'
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Video download error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Download failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
