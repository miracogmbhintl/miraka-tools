import React from 'react';
import { baseUrl } from '../lib/base-url';

interface ToolCardProps {
  category: string;
  headline: string;
  description: string;
  href: string;
  badge?: string;
}

export function ToolCard({ category, headline, description, href, badge }: ToolCardProps) {
  return (
    <a
      href={`${baseUrl}${href}`}
      className="tool-panel"
    >
      <div className="tool-panel-inner">
        {badge && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#EF4444',
            color: '#FFFFFF',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'Inter Tight, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            zIndex: 10
          }}>
            {badge}
          </div>
        )}
        
        <div className="tool-panel-category">
          {category}
        </div>
        
        <h2 className="tool-panel-headline">
          {headline}
        </h2>
        
        <p className="tool-panel-description">
          {description}
        </p>
        
        <div className="tool-panel-footer">
          <img 
            src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
            alt="Miraka & Co."
            className="tool-panel-logo"
          />
        </div>
      </div>
    </a>
  );
}



