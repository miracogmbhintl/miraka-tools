import type { APIRoute } from 'astro';
import { jsonResponse } from '../../lib/api-security';

export const POST: APIRoute = async () => {
  return jsonResponse(
    {
      error: 'Video Downloader is unavailable.',
      message: 'The experimental provider has been disabled until a reliable and compliant implementation is available.',
    },
    410,
  );
};
