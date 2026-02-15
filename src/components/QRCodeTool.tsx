

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { HexColorPicker } from 'react-colorful';
import { Download, QrCode } from 'lucide-react';
import { baseUrl } from '../lib/base-url';

type BackgroundType = 'transparent' | 'white' | 'custom';

export default function QRCodeTool() {
  const [qrContent, setQrContent] = useState('https://miraka.ch');
  const [qrColor, setQrColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('transparent');
  const [showQrPicker, setShowQrPicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Hex validation and conversion helpers
  const isValidHex = (hex: string) => /^#[0-9A-Fa-f]{6}$/.test(hex);

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    if (!isValidHex(hex)) return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map((x) => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Color state for inputs
  const qrColorRgb = hexToRgb(qrColor) || { r: 0, g: 0, b: 0 };
  const bgColorRgb = hexToRgb(backgroundColor) || { r: 255, g: 255, b: 255 };

  // Handle RGB changes for QR color
  const handleQrRgbChange = (component: 'r' | 'g' | 'b', value: string) => {
    const num = parseInt(value) || 0;
    const clamped = Math.max(0, Math.min(255, num));
    const newRgb = { ...qrColorRgb, [component]: clamped };
    setQrColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  // Handle RGB changes for background color
  const handleBgRgbChange = (component: 'r' | 'g' | 'b', value: string) => {
    const num = parseInt(value) || 0;
    const clamped = Math.max(0, Math.min(255, num));
    const newRgb = { ...bgColorRgb, [component]: clamped };
    setBackgroundColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  // Get the actual background for preview
  const getPreviewBackground = () => {
    if (backgroundType === 'transparent') return 'transparent';
    if (backgroundType === 'white') return '#FFFFFF';
    return backgroundColor;
  };

  // Download SVG
  const downloadSVG = () => {
    if (!qrContent.trim()) return;
    
    try {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) {
        alert('Unable to find QR code. Please try again.');
        return;
      }

      const svgClone = svg.cloneNode(true) as SVGElement;
      
      let bgFill = 'transparent';
      if (backgroundType === 'white') {
        bgFill = '#FFFFFF';
      } else if (backgroundType === 'custom') {
        bgFill = backgroundColor;
      }
      
      if (bgFill !== 'transparent') {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', bgFill);
        svgClone.insertBefore(rect, svgClone.firstChild);
      }

      const svgData = new XMLSerializer().serializeToString(svgClone);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qrcode.svg';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('SVG download failed:', error);
      alert('Failed to download SVG. Please try again.');
    }
  };

  // Download PNG
  const downloadPNG = () => {
    if (!qrContent.trim()) return;
    
    try {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) {
        alert('Unable to find QR code. Please try again.');
        return;
      }

      const svgClone = svg.cloneNode(true) as SVGElement;
      
      let bgFill = 'transparent';
      if (backgroundType === 'white') {
        bgFill = '#FFFFFF';
      } else if (backgroundType === 'custom') {
        bgFill = backgroundColor;
      }
      
      if (bgFill !== 'transparent') {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', bgFill);
        svgClone.insertBefore(rect, svgClone.firstChild);
      }

      const svgData = new XMLSerializer().serializeToString(svgClone);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        alert('Unable to create canvas. Please try again.');
        return;
      }

      const img = new Image();

      img.onload = () => {
        canvas.width = 1024;
        canvas.height = 1024;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) {
            alert('Failed to create PNG. Please try again.');
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'qrcode.png';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
        }, 'image/png');
      };

      img.onerror = () => {
        alert('Failed to load QR code image. Please try again.');
      };

      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      img.src = url;
    } catch (error) {
      console.error('PNG download failed:', error);
      alert('Failed to download PNG. Please try again.');
    }
  };

  return (
    <>
      <style>{`
        .qr-tool-container {
          font-family: Inter, sans-serif;
          position: relative;
          height: 100vh;
          width: 100vw;
          padding: 20px;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        .qr-back-button {
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
        
        .qr-logo {
          display: none;
        }
        
        .qr-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          height: 100%;
          padding-left: 40px;
        }
        
        .qr-left-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow: hidden;
          padding-right: 16px;
          height: 100%;
        }
        
        .qr-right-column {
          position: sticky;
          top: 0;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        @media (max-width: 768px) {
          .qr-tool-container {
            padding: 12px;
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }
          
          .qr-back-button {
            position: fixed;
            left: 12px;
            top: 12px;
            transform: none;
          }
          
          .qr-logo {
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
          
          .qr-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding-left: 0;
            padding-top: 50px;
            height: auto;
          }
          
          .qr-left-column {
            padding-right: 0;
            height: auto;
            overflow: visible;
          }
          
          .qr-right-column {
            position: relative;
            height: auto;
            overflow: visible;
          }
        }
      `}</style>
      <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #qr-print-area,
              #qr-print-area * {
                visibility: visible;
              }
              #qr-print-area {
                position: absolute;
                left: 0;
                top: 0;
                background: white;
                padding: 40px;
                font-family: 'Inter Tight', sans-serif;
              }
            }
          `}</style>
      
      <div className="qr-tool-container">
        {/* Back Button */}
        <a
          href={`${baseUrl}/`}
          className="qr-back-button"
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
        <div className="qr-logo">
          <img 
            src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
            alt="Miraka & Co."
            style={{ height: '18px', width: 'auto', display: 'block' }}
          />
        </div>

        <div className="qr-grid">
          
          {/* LEFT COLUMN - Scrollable Controls */}
          <div className="qr-left-column">
            
            {/* QR Content Input */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              <textarea
                value={qrContent}
                onChange={(e) => setQrContent(e.target.value)}
                placeholder="Enter URL or text..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '14px 16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                  color: '#1A1A1A',
                  background: '#FFFFFF',
                  resize: 'vertical',
                  lineHeight: '1.5',
                  transition: 'all 0.2s ease',
                  outline: 'none'
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

            {/* QR Color Picker */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Inline Color Picker - No Popup */}
                <div style={{ 
                  width: '100%',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <HexColorPicker 
                    color={qrColor} 
                    onChange={setQrColor}
                    style={{ width: '100%', height: '200px' }}
                  />
                </div>

                {/* Compact Inputs Row */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                  {/* HEX Input */}
                  <div style={{ flex: '0 0 110px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '4px', fontWeight: 500 }}>
                      HEX
                    </label>
                    <input
                      type="text"
                      value={qrColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('#')) setQrColor(val.toUpperCase());
                      }}
                      maxLength={7}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '0 10px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontFamily: 'monospace',
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

                  {/* RGB Inputs */}
                  {(['r', 'g', 'b'] as const).map((component) => (
                    <div key={component} style={{ flex: '1' }}>
                      <label style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '4px', fontWeight: 500 }}>
                        {component.toUpperCase()}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={qrColorRgb[component]}
                        onChange={(e) => handleQrRgbChange(component, e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '0 8px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          fontSize: '13px',
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
                  ))}
                </div>
              </div>
            </div>

            {/* Background Options */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 12px 0', fontWeight: 500 }}>
                Background (PNG only)
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Radio Options - Horizontal */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['transparent', 'white', 'custom'] as const).map((type) => (
                    <label
                      key={type}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 12px',
                        background: backgroundType === type ? '#F3F4F6' : 'transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        border: backgroundType === type ? '2px solid #1A1A1A' : '2px solid transparent',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (backgroundType !== type) e.currentTarget.style.background = '#FAFAFA';
                      }}
                      onMouseLeave={(e) => {
                        if (backgroundType !== type) e.currentTarget.style.background = 'transparent';
                      }}
                      onClick={(e) => {
                        if (type === 'custom' && backgroundType === 'custom') {
                          e.preventDefault();
                          setShowBgPicker(!showBgPicker);
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name="background"
                        value={type}
                        checked={backgroundType === type}
                        onChange={(e) => {
                          setBackgroundType(e.target.value as BackgroundType);
                          if (e.target.value === 'custom') {
                            setShowBgPicker(true);
                          } else {
                            setShowBgPicker(false);
                          }
                        }}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1A1A1A' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                        {type === 'custom' ? 'Custom' : type}
                      </span>
                      
                      {/* Popup for Custom */}
                      {type === 'custom' && showBgPicker && (
                        <div 
                          style={{
                            position: 'absolute',
                            bottom: '52px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1000,
                            background: 'white',
                            padding: '12px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                            border: '1px solid #E5E7EB'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} />
                          <input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.startsWith('#')) setBackgroundColor(val.toUpperCase());
                            }}
                            maxLength={7}
                            placeholder="HEX"
                            style={{
                              width: '100%',
                              marginTop: '8px',
                              height: '36px',
                              padding: '0 10px',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontFamily: 'monospace',
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
                          <button
                            onClick={() => setShowBgPicker(false)}
                            style={{
                              marginTop: '8px',
                              width: '100%',
                              padding: '6px',
                              background: '#F3F4F6',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Fixed Preview */}
          <div className="qr-right-column">
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              
              <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                borderRadius: '12px',
                backgroundImage: 'linear-gradient(45deg, #E5E5E5 25%, transparent 25%), linear-gradient(-45deg, #E5E5E5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E5E5E5 75%), linear-gradient(-45deg, transparent 75%, #E5E5E5 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                backgroundColor: '#FAFAFA',
                minHeight: 0
              }}>
                {qrContent.trim() ? (
                  <div
                    ref={qrRef}
                    style={{
                      backgroundColor: getPreviewBackground(),
                      padding: '20px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                  >
                    <QRCodeSVG
                      value={qrContent}
                      size={320}
                      level="H"
                      fgColor={qrColor}
                      bgColor="transparent"
                    />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                    <QrCode size={64} strokeWidth={1.5} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p style={{ fontSize: '14px', margin: 0, fontWeight: 500 }}>Enter content to generate QR code</p>
                  </div>
                )}
              </div>
            </div>

            {/* Export Actions */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={downloadSVG}
                  disabled={!qrContent.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '44px',
                    padding: '0 24px',
                    background: qrContent.trim() ? '#1A1A1A' : '#E5E7EB',
                    color: qrContent.trim() ? '#FFFFFF' : '#9CA3AF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: qrContent.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    if (qrContent.trim()) {
                      e.currentTarget.style.background = '#2A2A2A';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (qrContent.trim()) {
                      e.currentTarget.style.background = '#1A1A1A';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <Download size={18} strokeWidth={2} />
                  Download SVG
                </button>
                <button
                  onClick={downloadPNG}
                  disabled={!qrContent.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '44px',
                    padding: '0 24px',
                    background: qrContent.trim() ? '#1A1A1A' : '#E5E7EB',
                    color: qrContent.trim() ? '#FFFFFF' : '#9CA3AF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: qrContent.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    if (qrContent.trim()) {
                      e.currentTarget.style.background = '#2A2A2A';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (qrContent.trim()) {
                      e.currentTarget.style.background = '#1A1A1A';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <Download size={18} strokeWidth={2} />
                  Download PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}






