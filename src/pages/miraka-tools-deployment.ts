import type { APIRoute } from 'astro';
import { readFileSync } from 'fs';
import { join } from 'path';

export const GET: APIRoute = async () => {
  try {
    // Read the deployment zip file from the project root
    const zipPath = join(process.cwd(), 'miraka-tools-deployment.zip');
    const fileBuffer = readFileSync(zipPath);
    
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="miraka-tools-deployment.zip"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    return new Response('File not found', { status: 404 });
  }
};
