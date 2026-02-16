import { useState } from 'react';
import { Download, Link as LinkIcon, Video, Music, AlertCircle, Loader2, Play } from 'lucide-react';
import { baseUrl } from '../lib/base-url';

type VideoFormat = 'mp4' | 'mp3';
type VideoQuality = 'best' | '1080' | '720' | '480' | '360';

interface DownloadProgress {
  status: 'idle' | 'processing' | 'ready' | 'error';
  message: string;
  downloadUrl?: string;
  error?: string;
}

export default function VideoDownloaderTool() {
  const [videoUrl, setVideoUrl] = useState('');
  const [format, setFormat] = useState<VideoFormat>('mp4');
  const [quality, setQuality] = useState<VideoQuality>('best');
  const [progress, setProgress] = useState<DownloadProgress>({
    status: 'idle',
    message: ''
  });

  const handleDownload = async () => {
    if (!videoUrl.trim()) {
      setProgress({
        status: 'error',
        message: 'Please enter a valid video URL',
        error: 'URL is required'
      });
      return;
    }

    setProgress({
      status: 'processing',
      message: 'Processing your request...'
    });

    try {
      const response = await fetch(`${baseUrl}/api/download-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: videoUrl,
          format,
          quality
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Download failed');
      }

      setProgress({
        status: 'ready',
        message: 'Ready to download!',
        downloadUrl: data.downloadUrl
      });

      // Auto-trigger download
      if (data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename || `video.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (error) {
      setProgress({
        status: 'error',
        message: 'Failed to download video',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  const resetTool = () => {
    setVideoUrl('');
    setFormat('mp4');
    setQuality('best');
    setProgress({ status: 'idle', message: '' });
  };

  const getSupportedPlatforms = () => [
    'YouTube', 'Vimeo', 'Instagram', 'LinkedIn', 'Facebook',
    'TikTok', 'Twitter/X', 'Dailymotion', 'SoundCloud'
  ];

  return (
    <>
      <style>{`
        .video-downloader-container {
          font-family: Inter, sans-serif;
          position: relative;
          height: 100vh;
          width: 100vw;
          padding: 20px;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        .video-back-button {
          position: fixed;
          left: calc((40px + 24px) / 2);
          top: 50%;
          transform: translate(-50%, -50%);
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
        
        .video-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          height: 100%;
          padding-left: 40px;
        }
        
        .video-left-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          padding-right: 16px;
          height: 100%;
        }
        
        .video-right-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          padding-left: 8px;
          height: 100%;
        }
        
        @media (max-width: 768px) {
          .video-downloader-container {
            padding: 12px;
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
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
          
          .video-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding-left: 0;
            padding-top: 50px;
            height: auto;
          }
          
          .video-left-column {
            padding: 0;
            height: auto;
            overflow: visible;
          }
          
          .video-right-column {
            padding: 0;
            height: auto;
            overflow: visible;
          }
          
          .video-preview-card,
          .video-platforms-card {
            display: none;
          }
        }
      `}</style>
      
      <div className="video-downloader-container">
        <a
          href={`${baseUrl}/`}
          className="video-back-button"
          onMouseEnter={(e) => {
            const svg = e.currentTarget.querySelector('svg');
            if (svg) svg.setAttribute('stroke', '#1A1A1A');
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

        <div className="video-logo">
          <img 
            src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
            alt="Miraka & Co."
            style={{ height: '18px', width: 'auto', display: 'block' }}
          />
        </div>

        <div className="video-grid">
          {/* LEFT COLUMN */}
          <div className="video-left-column">
            {/* URL Input Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={progress.status === 'processing'}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                  color: '#1A1A1A',
                  background: '#FFFFFF',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#1A1A1A';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26, 26, 26, 0.05)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Format Selection Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px 0', fontWeight: 500 }}>
                Format
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['mp4', 'mp3'] as const).map((fmt) => (
                  <label
                    key={fmt}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 12px',
                      background: format === fmt ? '#F3F4F6' : 'transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: format === fmt ? '2px solid #1A1A1A' : '2px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (format !== fmt) e.currentTarget.style.background = '#FAFAFA';
                    }}
                    onMouseLeave={(e) => {
                      if (format !== fmt) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={fmt}
                      checked={format === fmt}
                      onChange={(e) => setFormat(e.target.value as VideoFormat)}
                      disabled={progress.status === 'processing'}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1A1A1A' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', textTransform: 'uppercase' }}>
                      {fmt}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quality Selection Card (only for MP4) */}
            {format === 'mp4' && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
              }}>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px 0', fontWeight: 500 }}>
                  Quality
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(['best', '1080', '720', '480', '360'] as const).map((qual) => (
                    <label
                      key={qual}
                      style={{
                        flex: '1 1 auto',
                        minWidth: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 12px',
                        background: quality === qual ? '#F3F4F6' : 'transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: quality === qual ? '2px solid #1A1A1A' : '2px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (quality !== qual) e.currentTarget.style.background = '#FAFAFA';
                      }}
                      onMouseLeave={(e) => {
                        if (quality !== qual) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <input
                        type="radio"
                        name="quality"
                        value={qual}
                        checked={quality === qual}
                        onChange={(e) => setQuality(e.target.value as VideoQuality)}
                        disabled={progress.status === 'processing'}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1A1A1A' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A' }}>
                        {qual === 'best' ? 'Best' : `${qual}p`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Status Message Card */}
            {progress.status !== 'idle' && (
              <div style={{
                background: progress.status === 'error' 
                  ? '#FEF2F2' 
                  : progress.status === 'ready'
                  ? '#F0FDF4'
                  : '#F3F4F6',
                borderRadius: '14px',
                padding: '24px',
                border: `1px solid ${
                  progress.status === 'error' 
                    ? '#FCA5A5' 
                    : progress.status === 'ready'
                    ? '#86EFAC'
                    : '#E5E7EB'
                }`,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {progress.status === 'error' && <AlertCircle size={20} style={{ color: '#991B1B', flexShrink: 0 }} />}
                {progress.status === 'ready' && <Download size={20} style={{ color: '#166534', flexShrink: 0 }} />}
                {progress.status === 'processing' && (
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                )}
                <span style={{ 
                  fontSize: '14px', 
                  color: progress.status === 'error' ? '#991B1B' : '#1A1A1A',
                  fontWeight: 500
                }}>
                  {progress.message}
                </span>
              </div>
            )}

            {/* Download Button Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              {(progress.status === 'ready' || progress.status === 'error') ? (
                <button
                  onClick={resetTool}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    height: '44px',
                    padding: '0 24px',
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
                  Download Another Video
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  disabled={progress.status === 'processing' || !videoUrl.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    height: '44px',
                    padding: '0 24px',
                    background: (progress.status === 'processing' || !videoUrl.trim()) ? '#E5E7EB' : '#1A1A1A',
                    color: (progress.status === 'processing' || !videoUrl.trim()) ? '#9CA3AF' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: (progress.status === 'processing' || !videoUrl.trim()) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    if (progress.status !== 'processing' && videoUrl.trim()) {
                      e.currentTarget.style.background = '#2A2A2A';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (progress.status !== 'processing' && videoUrl.trim()) {
                      e.currentTarget.style.background = '#1A1A1A';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {progress.status === 'processing' ? (
                    <>
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      {format === 'mp4' ? <Video size={18} /> : <Music size={18} />}
                      Download {format.toUpperCase()}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="video-right-column">
            {/* Preview Card */}
            <div className="video-preview-card" style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                <Play size={64} strokeWidth={1.5} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ fontSize: '14px', margin: 0, fontWeight: 500 }}>Video preview unavailable</p>
              </div>
            </div>

            {/* Supported Platforms Card */}
            <div className="video-platforms-card" style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                marginBottom: '16px',
                color: '#1A1A1A',
                margin: '0 0 16px 0'
              }}>
                Supported Platforms
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                {getSupportedPlatforms().map((platform) => (
                  <div
                    key={platform}
                    style={{
                      padding: '10px 14px',
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#374151',
                      textAlign: 'center'
                    }}
                  >
                    {platform}
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Notice Card */}
            <div style={{ 
              background: '#FEF3C7',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #FCD34D',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <AlertCircle size={18} style={{ color: '#92400E', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h3 style={{ 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    marginBottom: '6px',
                    color: '#92400E',
                    margin: '0 0 6px 0'
                  }}>
                    Legal Notice
                  </h3>
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#78350F',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    Only download content you own or have permission to download. Downloading copyrighted material without permission may violate terms of service and copyright laws.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
