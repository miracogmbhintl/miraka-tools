import React from 'react';
import { ToolCard } from './ToolCard';

export default function HomePage() {
  const tools = [
    {
      category: 'Generators',
      headline: 'QR Code Generator',
      description: 'Create custom QR codes for any URL or text. Simple, fast, and reliable generation for print or digital use.',
      href: '/qr'
    },
    {
      category: 'Color Tools',
      headline: 'Color Picker',
      description: 'Extract and manipulate color values with precision. Convert between formats, adjust tones, build palettes.',
      href: '/color-picker'
    },
    {
      category: 'Color Tools',
      headline: 'Image Color Picker',
      description: 'Extract dominant colors from any image. Upload, analyze, and capture the exact palette from visual references.',
      href: '/image-color-picker'
    },
    {
      category: 'Development',
      headline: 'HTML Preview',
      description: 'Write HTML and see results instantly. A clean environment for testing markup, styles, and quick experiments.',
      href: '/html'
    },
    {
      category: 'Media Tools',
      headline: 'Video Downloader',
      description: 'Download videos from YouTube, Vimeo, Instagram, and more. Convert to MP4 or extract audio as MP3.',
      href: '/video-downloader'
    },
    {
      category: 'AI-powered',
      headline: 'Website Intelligence',
      description: 'Structured analysis of business clarity, positioning and conversion logic.',
      href: '/analysis'
    },
    {
      category: 'Games',
      headline: 'Tic Tac Toe',
      description: 'Classic two-player game with scoreboard. Challenge a friend in this timeless strategy game.',
      href: '/tictactoe'
    },
    {
      category: 'Games',
      headline: 'Snake',
      description: 'Classic snake game with smooth controls. Eat food, grow longer, and avoid hitting yourself or the walls.',
      href: '/snake'
    }
  ];

  return (
    <div className="home-container" style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="tools-grid">
        {tools.map((tool, index) => (
          <ToolCard
            key={index}
            category={tool.category}
            headline={tool.headline}
            description={tool.description}
            href={tool.href}
          />
        ))}
      </div>
    </div>
  );
}
