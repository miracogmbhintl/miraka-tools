import { useEffect, useState } from 'react';
import { DevLinkProvider } from '../site-components/DevLinkProvider';
import HomePage from './HomePage';

const LOADER_DURATION_MS = 2450;

export default function HomePageWithLoader() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const duration = prefersReducedMotion ? 150 : LOADER_DURATION_MS;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      setShowLoader(false);
      document.body.style.overflow = previousOverflow;
    }, duration);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <DevLinkProvider>
      {showLoader && (
        <div
          className="mco-load-screen"
          role="status"
          aria-label="Loading Miraka & Co. Tools"
        >
          <div className="mco-load-indicator" aria-hidden="true">
            <div className="mco-load-indicator-fill" />
          </div>

          <div className="mco-load-logo-window">
            <div className="mco-load-logo-motion">
              <img
                className="mco-load-logo"
                src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
                alt="Miraka & Co."
                loading="eager"
                decoding="sync"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      )}

      <HomePage />

      <style>{`
        .mco-load-screen {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          display: grid;
          place-items: center;
          width: 100%;
          min-height: 100%;
          overflow: hidden;
          background: var(--background, #f2f2f2);
          opacity: 1;
          isolation: isolate;
          animation: mco-load-screen-out 600ms ease-in-out 1800ms forwards;
        }

        .mco-load-indicator {
          position: absolute;
          inset: 0 0 auto;
          height: 8px;
          overflow: hidden;
          background: transparent;
        }

        .mco-load-indicator-fill {
          width: 100%;
          height: 100%;
          background: var(--text, #1a1a1a);
          transform: translate3d(-100%, 0, 0);
          animation: mco-load-progress 1500ms
            cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform;
        }

        .mco-load-logo-window {
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          padding: 12px;
        }

        .mco-load-logo-motion {
          transform: translate3d(0, 115%, 0);
          animation: mco-load-logo-in 1000ms
            cubic-bezier(0.16, 1, 0.3, 1) 100ms forwards;
          will-change: transform;
        }

        .mco-load-logo {
          display: block;
          width: clamp(135px, 13vw, 190px);
          max-width: 55vw;
          height: auto;
          object-fit: contain;
        }

        @keyframes mco-load-progress {
          from {
            transform: translate3d(-100%, 0, 0);
          }

          to {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes mco-load-logo-in {
          from {
            transform: translate3d(0, 115%, 0);
          }

          to {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes mco-load-screen-out {
          from {
            opacity: 1;
            visibility: visible;
          }

          to {
            opacity: 0;
            visibility: hidden;
          }
        }

        @media (max-width: 767px) {
          .mco-load-indicator {
            height: 6px;
          }

          .mco-load-logo {
            width: 145px;
            max-width: 62vw;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mco-load-screen,
          .mco-load-indicator-fill,
          .mco-load-logo-motion {
            animation: none;
          }

          .mco-load-logo-motion {
            transform: none;
          }
        }
      `}</style>
    </DevLinkProvider>
  );
}
