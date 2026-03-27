import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { baseUrl } from '../lib/base-url';

type Format = 'mp4' | 'mp3';
type Quality = 'best' | 'worst' | '720p' | '480p' | '360p';

export default function VideoDownloaderTool() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<Format>('mp4');
  const [quality, setQuality] = useState<Quality>('best');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDownload = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${baseUrl}/api/download-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, format, quality }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `video.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess('Download started successfully!');
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .video-downloader-container {
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
        
        .video-back-button {
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
        
        .video-logo {
          display: none;
        }
        
        .video-main-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          flex: 1;
          padding-left: 52px;
          overflow-y: auto;
        }
        
        @media (max-width: 768px) {
          .video-downloader-container {
            width: 100vw;
            min-height: 100vh;
            height: auto;
            padding: 12px;
            overflow: visible;
          }
          
          .video-back-button {
            position: fixed;
            left: 12px;
            top: 12px;
            transform: none;
          }
          
          .video-logo {
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
          
          .video-main-content {
            padding-left: 0;
            padding-top: 50px;
            overflow: visible;
          }
        }
      `}</style>
      
      <div className="video-downloader-container">
        <a
          href={`${baseUrl}/`}
          className="video-back-button"
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
        <div className="video-logo">
          <img 
            src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
            alt="Miraka & Co."
            style={{ height: '18px', width: 'auto', display: 'block' }}
          />
        </div>

        <div className="video-main-content">
          {/* Main Input Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            padding: '32px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: '8px',
              fontFamily: 'Inter Tight, sans-serif'
            }}>
              Video Downloader
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              marginBottom: '24px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Download videos from YouTube, Vimeo, Instagram, and more
            </p>

            {/* URL Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1A1A1A',
                marginBottom: '8px'
              }}>
                Video URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'Inter, sans-serif',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#F37021'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
              />
            </div>

            {/* Format Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1A1A1A',
                marginBottom: '8px'
              }}>
                Format
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setFormat('mp4')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: format === 'mp4' ? '2px solid #F37021' : '1px solid #E5E7EB',
                    borderRadius: '10px',
                    background: format === 'mp4' ? '#FFF7F3' : '#FFFFFF',
                    color: format === 'mp4' ? '#F37021' : '#6B7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    if (format !== 'mp4') {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (format !== 'mp4') {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                    }
                  }}
                >
                  Video (MP4)
                </button>
                <button
                  onClick={() => setFormat('mp3')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: format === 'mp3' ? '2px solid #F37021' : '1px solid #E5E7EB',
                    borderRadius: '10px',
                    background: format === 'mp3' ? '#FFF7F3' : '#FFFFFF',
                    color: format === 'mp3' ? '#F37021' : '#6B7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    if (format !== 'mp3') {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (format !== 'mp3') {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                    }
                  }}
                >
                  Audio (MP3)
                </button>
              </div>
            </div>

            {/* Quality Selection (only for MP4) */}
            {format === 'mp4' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  marginBottom: '8px'
                }}>
                  Quality
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as Quality)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    background: '#FFFFFF'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#F37021'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
                >
                  <option value="best">Best Quality</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                  <option value="360p">360p</option>
                  <option value="worst">Lowest Quality</option>
                </select>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isLoading || !url.trim()}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 600,
                background: isLoading || !url.trim() ? '#E5E7EB' : '#1A1A1A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                cursor: isLoading || !url.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'Inter, sans-serif'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && url.trim()) {
                  e.currentTarget.style.background = '#2A2A2A';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && url.trim()) {
                  e.currentTarget.style.background = '#1A1A1A';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download {format.toUpperCase()}
                </>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                color: '#991B1B',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif'
              }}>
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: '#D1FAE5',
                border: '1px solid #6EE7B7',
                borderRadius: '10px',
                color: '#065F46',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif'
              }}>
                {success}
              </div>
            )}
          </div>

          {/* Info Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: '12px',
              fontFamily: 'Inter Tight, sans-serif'
            }}>
              Supported Platforms
            </h2>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '8px'
            }}>
              {['YouTube', 'Vimeo', 'Instagram', 'Facebook', 'Twitter', 'TikTok'].map((platform) => (
                <li key={platform} style={{
                  padding: '8px 12px',
                  background: '#F9FAFB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  • {platform}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
