import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { url, format } = await request.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'Video URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get RapidAPI key from environment
    const rapidApiKey = locals?.runtime?.env?.RAPIDAPI_KEY || import.meta.env.RAPIDAPI_KEY;

    if (!rapidApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'API key not configured',
          message: 'RapidAPI key is missing. Please add RAPIDAPI_KEY to your environment variables.'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract video ID from URL
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid URL',
          message: 'Could not extract video ID from the provided URL.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Use YouTube MP3 downloader API (works for MP4 too)
    const apiUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com',
        'x-rapidapi-key': rapidApiKey
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('RapidAPI Error:', errorData);
      throw new Error(errorData.msg || errorData.error || `API returned status ${response.status}`);
    }

    const data = await response.json();

    // Check if we got a valid download link
    if (!data.link) {
      throw new Error('No download link available from API');
    }

    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: data.link,
        filename: `${data.title || 'video'}.${format}`,
        title: data.title || 'Downloaded Video'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
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

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle youtube.com/watch?v=ID
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('www.youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) return videoId;
    }
    
    // Handle youtu.be/ID
    if (urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.pathname.slice(1).split('/')[0];
      if (videoId) return videoId;
    }
    
    // Handle youtube.com/embed/ID
    if (urlObj.pathname.includes('/embed/')) {
      const videoId = urlObj.pathname.split('/embed/')[1]?.split('/')[0];
      if (videoId) return videoId;
    }
    
    return null;
  } catch {
    // If URL parsing fails, try to extract ID with regex
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }
}
