





import { useState, useRef, useEffect } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { Download } from 'lucide-react';
import { baseUrl } from '../lib/base-url';

export default function HTMLPreviewTool() {
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 2rem;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Edit the HTML to see live preview.</p>
</body>
</html>`);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [leftWidth, setLeftWidth] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const updatePreview = () => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlCode);
        iframeDoc.close();
        
        setTimeout(() => {
          const links = iframeDoc.querySelectorAll('a');
          links.forEach((link) => {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              const href = link.getAttribute('href');
              if (href) {
                window.open(href, '_blank', 'noopener,noreferrer');
              }
            });
          });
        }, 100);
      }
    }
  };

  const downloadPNG = async () => {
    if (!iframeRef.current?.contentDocument?.body) return;
    
    try {
      const canvas = await html2canvas(iframeRef.current.contentDocument.body, {
        useCORS: true,
        allowTaint: true,
        scrollY: 0,
        scrollX: 0
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'preview.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('PNG export failed:', error);
      alert('Failed to export PNG. Please try again.');
    }
  };

  const downloadHTML = () => {
    try {
      const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'preview.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('HTML download failed:', error);
      alert('Failed to download HTML. Please try again.');
    }
  };

  const downloadTXT = () => {
    try {
      const blob = new Blob([htmlCode], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'preview.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('TXT download failed:', error);
      alert('Failed to download TXT. Please try again.');
    }
  };

  const downloadZIP = async () => {
    try {
      const zip = new JSZip();
      zip.file('index.html', htmlCode);
      
      const blob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9
        }
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'preview.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('ZIP creation failed:', error);
      alert('Failed to create ZIP. Please try again.');
    }
  };

  useEffect(() => {
    updatePreview();
  }, [htmlCode]);

  // Auto-resize iframe height on mobile
  useEffect(() => {
    const resizeIframe = () => {
      if (iframeRef.current && window.innerWidth <= 768) {
        const iframe = iframeRef.current;
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc && iframeDoc.body) {
            // Get the full scrollable height of the content
            const contentHeight = Math.max(
              iframeDoc.body.scrollHeight,
              iframeDoc.body.offsetHeight,
              iframeDoc.documentElement.scrollHeight,
              iframeDoc.documentElement.offsetHeight
            );
            // Add a small buffer to ensure all content is visible
            iframe.style.height = `${contentHeight + 20}px`;
          }
        } catch (e) {
          // Cross-origin or access error, ignore
        }
      } else if (iframeRef.current) {
        // Reset to 100% on desktop
        iframeRef.current.style.height = '100%';
      }
    };

    // Resize after content loads - multiple times to catch dynamic content
    const timer1 = setTimeout(resizeIframe, 100);
    const timer2 = setTimeout(resizeIframe, 300);
    const timer3 = setTimeout(resizeIframe, 600);
    const timer4 = setTimeout(resizeIframe, 1000);
    
    // Also resize on window resize
    window.addEventListener('resize', resizeIframe);
    
    // Watch for iframe load events
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', resizeIframe);
    }
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      window.removeEventListener('resize', resizeIframe);
      if (iframe) {
        iframe.removeEventListener('load', resizeIframe);
      }
    };
  }, [htmlCode]);

  // Scroll chaining behavior for mobile
  useEffect(() => {
    const handleScrollChaining = (container: HTMLElement | null) => {
      if (!container) return;

      const onWheel = (e: WheelEvent) => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isScrollingDown = e.deltaY > 0;
        const isScrollingUp = e.deltaY < 0;

        const isAtTop = scrollTop === 0;
        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;

        // Allow page scroll when at limits
        if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
          return; // Let the event bubble to parent
        }

        // Prevent page scroll when scrolling within container
        e.stopPropagation();
      };

      const onTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        container.dataset.touchStartY = touch.clientY.toString();
      };

      const onTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        const startY = parseFloat(container.dataset.touchStartY || '0');
        const deltaY = startY - touch.clientY;
        
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isScrollingDown = deltaY > 0;
        const isScrollingUp = deltaY < 0;

        const isAtTop = scrollTop === 0;
        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;

        // Allow page scroll when at limits
        if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
          return; // Let the event bubble to parent
        }

        // Prevent page scroll when scrolling within container
        e.stopPropagation();
      };

      container.addEventListener('wheel', onWheel, { passive: true });
      container.addEventListener('touchstart', onTouchStart, { passive: true });
      container.addEventListener('touchmove', onTouchMove, { passive: true });

      return () => {
        container.removeEventListener('wheel', onWheel);
        container.removeEventListener('touchstart', onTouchStart);
        container.removeEventListener('touchmove', onTouchMove);
      };
    };

    const cleanupEditor = handleScrollChaining(editorContainerRef.current);
    const cleanupPreview = handleScrollChaining(previewContainerRef.current);

    return () => {
      cleanupEditor?.();
      cleanupPreview?.();
    };
  }, []);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left - 52;
      const percentage = (offsetX / (containerRect.width - 52)) * 100;
      
      const clampedPercentage = Math.max(20, Math.min(80, percentage));
      setLeftWidth(clampedPercentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <>
      <style>{`
        .html-preview-container {
          font-family: Inter, sans-serif;
          width: 100vw;
          height: 100vh;
          padding: 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow: hidden;
          position: relative;
        }
        
        .html-back-button {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          z-index: 1000;
          transition: all 0.2s ease;
        }
        
        .html-logo {
          display: none;
        }
        
        .html-main-grid {
          display: flex;
          gap: 0;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          padding-left: 52px;
          position: relative;
        }
        
        .html-resizer {
          width: 16px;
          cursor: col-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
          user-select: none;
          z-index: 10;
        }
        
        @media (max-width: 768px) {
          .html-preview-container {
            width: 100vw;
            min-height: 100vh;
            height: auto;
            padding: 12px;
            overflow: visible;
            display: block;
          }
          
          .html-back-button {
            position: fixed;
            left: 12px;
            top: 12px;
            transform: none;
          }
          
          .html-logo {
            display: block;
            position: fixed;
            right: 12px;
            top: 12px;
            z-index: 1000;
            font-family: 'Inter Tight', sans-serif;
            font-size: 16px;
            font-weight: 700;
            color: #1A1A1A;
          }
          
          .html-main-grid {
            flex-direction: column;
            padding-left: 0;
            padding-top: 50px;
            gap: 16px;
            overflow: visible;
            flex: none;
            min-height: auto;
            display: flex;
          }
          
          .html-resizer {
            display: none;
          }
          
          .html-left-column,
          .html-right-column {
            width: 100% !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 16px !important;
            flex: none !important;
            min-height: 0 !important;
          }
          
          .html-left-column > div:first-child,
          .html-right-column > div:first-child {
            min-height: 300px;
            padding: 24px !important;
          }
          
          .html-right-column > div:first-child {
            min-height: auto !important;
          }
          
          .html-left-column > div:last-child,
          .html-right-column > div:last-child {
            padding: 16px !important;
          }
        }
      `}</style>
      <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #html-print-area,
              #html-print-area * {
                visibility: visible;
              }
              #html-print-area {
                position: absolute;
                left: 0;
                top: 0;
                background: white;
                padding: 40px;
                font-family: 'Inter Tight', sans-serif;
              }
            }
          `}</style>
      
      <div ref={containerRef} className="html-preview-container">
        <a
          href={`${baseUrl}/`}
          className="html-back-button"
          onMouseEnter={(e) => {
            const svg = e.currentTarget.querySelector('svg');
            if (svg) svg.setAttribute('stroke', '#F37021');
          }}
          onMouseLeave={(e) => {
            const svg = e.currentTarget.querySelector('svg');
            if (svg) svg.setAttribute('stroke', '#1A1A1A');
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </a>

        {/* Logo - Mobile Only */}
        <div className="html-logo">
          <img 
            src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
            alt="Miraka & Co."
            style={{ height: '18px', width: 'auto', display: 'block' }}
          />
        </div>

        <div className="html-main-grid">
          
          <div className="html-left-column" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            minHeight: '0',
            overflow: 'hidden',
            width: `${leftWidth}%`,
            paddingRight: '8px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              flex: '1',
              minHeight: '0',
              overflow: 'hidden'
            }}>
              
              <div style={{
                flex: '1',
                overflow: 'auto',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                background: '#FFFFFF'
              }}
              ref={editorContainerRef}
              >
                <CodeEditor
                  value={htmlCode}
                  language="html"
                  placeholder="Enter your HTML code..."
                  onChange={(e) => setHtmlCode(e.target.value)}
                  onKeyUp={updatePreview}
                  padding={16}
                  data-color-mode="light"
                  style={{
                    fontSize: '12px',
                    fontFamily: "'Monaco', 'Menlo', 'Courier New', monospace",
                    backgroundColor: '#FFFFFF',
                    minHeight: '100%',
                    lineHeight: '1.6',
                    tabSize: 2,
                    color: '#1A1A1A',
                  } as React.CSSProperties}
                />
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              flexShrink: '0'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={downloadHTML}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '40px',
                    flex: 1,
                    padding: '0 16px',
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2A2A2A';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1A1A1A';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Download size={18} strokeWidth={2} />
                  Download HTML
                </button>

                <button
                  onClick={downloadTXT}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '40px',
                    flex: 1,
                    padding: '0 16px',
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2A2A2A';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1A1A1A';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Download size={18} strokeWidth={2} />
                  Download TXT
                </button>
              </div>
            </div>
          </div>

          <div
            className="html-resizer"
            onMouseDown={handleMouseDown}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              alignItems: 'center'
            }}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    background: isDragging ? '#F37021' : '#D1D5DB',
                    transform: isDragging ? 'scale(1.3)' : 'scale(1)',
                    transition: isDragging ? 'none' : 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="html-right-column" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            minHeight: '0',
            overflow: 'hidden',
            width: `${100 - leftWidth}%`,
            paddingLeft: '8px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              flex: '1',
              minHeight: '0',
              display: 'flex',
              flexDirection: 'column'
            }}>
              
              <div style={{
                flex: '1',
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #E5E7EB',
                background: '#FFFFFF'
              }}
              ref={previewContainerRef}
              >
                <iframe
                  ref={iframeRef}
                  title="HTML Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: '#FFFFFF'
                  }}
                />
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              flexShrink: '0'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={downloadPNG}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '40px',
                    flex: 1,
                    padding: '0 16px',
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2A2A2A';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1A1A1A';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Download size={18} strokeWidth={2} />
                  Download PNG
                </button>

                <button
                  onClick={downloadZIP}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '40px',
                    flex: 1,
                    padding: '0 16px',
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2A2A2A';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1A1A1A';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Download size={18} strokeWidth={2} />
                  Download ZIP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}






















