import { useState } from 'react';
import { Images, PanelsTopLeft } from 'lucide-react';
import InstagramCarouselMakerTool from './InstagramCarouselMakerTool';
import SeamlessCarouselMakerTool from './SeamlessCarouselMakerTool';

type EditorMode = 'slides' | 'seamless';

export default function InstagramCarouselWorkspace() {
  const [mode, setMode] = useState<EditorMode>('slides');

  return (
    <div className="carousel-workspace-root">
      <style>{`
        .carousel-workspace-root {
          min-height: 100vh;
          background: #f3f4f6;
        }

        .carousel-mode-bar {
          position: sticky;
          top: 0;
          z-index: 1000;
          display: flex;
          justify-content: center;
          padding: 10px 16px;
          border-bottom: 1px solid #e5e7eb;
          background: rgba(255,255,255,.94);
          backdrop-filter: blur(14px);
        }

        .carousel-mode-switch {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 4px;
          width: min(480px, 100%);
          padding: 4px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          background: #f3f4f6;
          box-shadow: 0 1px 2px rgba(17,24,39,.05);
        }

        .carousel-mode-button {
          min-height: 42px;
          border: 0;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px 14px;
          background: transparent;
          color: #4b5563;
          font: 650 13px/1 Inter, Arial, sans-serif;
          cursor: pointer;
        }

        .carousel-mode-button.active {
          background: #1a1a1a;
          color: #fff;
          box-shadow: 0 3px 10px rgba(17,24,39,.16);
        }

        .carousel-mode-button:focus-visible {
          outline: 3px solid rgba(26,26,26,.18);
          outline-offset: 2px;
        }

        @media (max-width: 560px) {
          .carousel-mode-bar { padding: 8px; }
          .carousel-mode-button { padding-inline: 8px; font-size: 12px; }
        }
      `}</style>

      <div className="carousel-mode-bar" aria-label="Carousel editor mode">
        <div className="carousel-mode-switch">
          <button
            type="button"
            className={`carousel-mode-button ${mode === 'slides' ? 'active' : ''}`}
            onClick={() => setMode('slides')}
            aria-pressed={mode === 'slides'}
          >
            <PanelsTopLeft size={17} />
            Slide editor
          </button>
          <button
            type="button"
            className={`carousel-mode-button ${mode === 'seamless' ? 'active' : ''}`}
            onClick={() => setMode('seamless')}
            aria-pressed={mode === 'seamless'}
          >
            <Images size={17} />
            Seamless strip
          </button>
        </div>
      </div>

      {mode === 'slides' ? <InstagramCarouselMakerTool /> : <SeamlessCarouselMakerTool />}
    </div>
  );
}
