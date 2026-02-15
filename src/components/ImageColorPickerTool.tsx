import { useState, useRef } from 'react';
import { Upload, Copy, Check, X } from 'lucide-react';
import { baseUrl } from '../lib/base-url';

export default function ImageColorPickerTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState('#F37021');
  const [copied, setCopied] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [previewColor, setPreviewColor] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageSrc(result);
        
        setTimeout(() => {
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                const maxWidth = 800;
                const maxHeight = 600;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                  height = (height * maxWidth) / width;
                  width = maxWidth;
                }
                if (height > maxHeight) {
                  width = (width * maxHeight) / height;
                  height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
              }
            }
          };
          img.src = result;
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const getColorAtPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '#000000';

    const ctx = canvas.getContext('2d');
    if (!ctx) return '#000000';

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const imageData = ctx.getImageData(x, y, 1, 1);
    const [r, g, b] = imageData.data;

    return rgbToHex(r, g, b);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const color = getColorAtPosition(e);
    setPickedColor(color);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const color = getColorAtPosition(e);
    setPickedColor(color);
    setPreviewColor(color);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
    const color = getColorAtPosition(e);
    setPreviewColor(color);
  };

  const handleCanvasMouseLeave = () => {
    setPreviewColor(null);
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map((x) => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    const rgb = hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const rgb = hexToRgb(pickedColor);
  const hsl = hexToHsl(pickedColor);

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const colorFormats = [
    { label: 'HEX', value: pickedColor.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
  ];

  const removeImage = () => {
    setImageSrc(null);
    setPreviewColor(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <style>{`
        .image-picker-container {
          font-family: Inter, sans-serif;
          position: relative;
          width: 100vw;
          height: 100vh;
          padding: 20px;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        .image-picker-back-button {
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
        
        .image-picker-logo {
          display: none;
        }
        
        .image-picker-grid {
          display: grid;
          grid-template-columns: ${imageSrc ? '1fr 400px' : '1fr'};
          gap: 24px;
          height: 100%;
          padding-left: 40px;
        }
        
        @media (max-width: 768px) {
          .image-picker-container {
            padding: 12px;
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }
          
          .image-picker-back-button {
            position: fixed;
            left: 12px;
            top: 12px;
            transform: none;
          }
          
          .image-picker-logo {
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
          
          .image-picker-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding-left: 0;
            padding-top: 50px;
          }
        }
      `}</style>
      <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #image-color-print-area,
              #image-color-print-area * {
                visibility: visible;
              }
              #image-color-print-area {
                position: absolute;
                left: 0;
                top: 0;
                background: white;
                padding: 40px;
                font-family: 'Inter Tight', sans-serif;
              }
            }
          `}</style>
      
      <div className="image-picker-container">
        <a
          href={`${baseUrl}/`}
          className="image-picker-back-button"
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
        <div className="image-picker-logo">
          <img 
            src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
            alt="Miraka & Co."
            style={{ height: '18px', width: 'auto', display: 'block' }}
          />
        </div>

        <div className="image-picker-grid">
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            height: '100%',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {imageSrc && (
                    <>
                      <button
                        onClick={removeImage}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          background: '#EF4444',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#DC2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#EF4444';
                        }}
                      >
                        <X size={16} strokeWidth={2} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                border: '2px dashed #E5E7EB',
                background: '#FAFAFA',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {!imageSrc ? (
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '40px',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#E5E7EB';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F3F4F6';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    >
                      <Upload size={32} strokeWidth={2} color="#6B7280" />
                    </div>
                    <div>
                      <p style={{ 
                        fontSize: '16px', 
                        fontWeight: 600, 
                        color: '#1A1A1A', 
                        margin: '0 0 8px 0' 
                      }}>
                        Upload an image
                      </p>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#6B7280', 
                        margin: 0 
                      }}>
                        Click to browse or drag and drop
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#9CA3AF', 
                        margin: '8px 0 0 0' 
                      }}>
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                ) : (
                  <div style={{ 
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    padding: '20px'
                  }}>
                    <canvas
                      ref={canvasRef}
                      onClick={handleCanvasClick}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseLeave={handleCanvasMouseLeave}
                      onTouchStart={handleCanvasTouchStart}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        cursor: 'crosshair',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        touchAction: 'none'
                      }}
                    />
                    
                    {previewColor && window.innerWidth > 768 && (
                      <div style={{
                        position: 'fixed',
                        left: cursorPosition.x + 20,
                        top: cursorPosition.y + 20,
                        pointerEvents: 'none',
                        zIndex: 1000
                      }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          backgroundColor: previewColor,
                          border: '3px solid white',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        }} />
                        <div style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          background: 'rgba(0, 0, 0, 0.8)',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          textAlign: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          {previewColor.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {imageSrc && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto',
              height: '100%'
            }}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
              }}>
                
                <div style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '12px',
                  backgroundColor: pickedColor,
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(45deg, #E5E5E5 25%, transparent 25%), linear-gradient(-45deg, #E5E5E5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E5E5E5 75%), linear-gradient(-45deg, transparent 75%, #E5E5E5 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    backgroundColor: '#FAFAFA',
                    zIndex: 0
                  }} />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: pickedColor,
                    zIndex: 1
                  }} />
                </div>

                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: '#FAFAFA',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#6B7280', fontWeight: 500 }}>HEX</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1A1A1A' }}>{pickedColor.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#6B7280', fontWeight: 500 }}>RGB</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1A1A1A' }}>{rgb.r}, {rgb.g}, {rgb.b}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#6B7280', fontWeight: 500 }}>HSL</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1A1A1A' }}>{hsl.h}°, {hsl.s}%, {hsl.l}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {colorFormats.map((format) => (
                    <div key={format.label}>
                      <label style={{ 
                        display: 'block', 
                        fontSize: '12px', 
                        color: '#6B7280', 
                        marginBottom: '8px', 
                        fontWeight: 500 
                      }}>
                        {format.label}
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={format.value}
                          readOnly
                          style={{
                            flex: 1,
                            height: '44px',
                            padding: '0 16px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            background: '#FAFAFA',
                            color: '#1A1A1A',
                            outline: 'none'
                          }}
                        />
                        <button
                          onClick={() => copyToClipboard(format.value, format.label)}
                          style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: copied === format.label ? '#10B981' : '#1A1A1A',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            flexShrink: 0
                          }}
                          onMouseEnter={(e) => {
                            if (copied !== format.label) {
                              e.currentTarget.style.background = '#2A2A2A';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (copied !== format.label) {
                              e.currentTarget.style.background = '#1A1A1A';
                            }
                          }}
                        >
                          {copied === format.label ? (
                            <Check size={18} strokeWidth={2.5} />
                          ) : (
                            <Copy size={18} strokeWidth={2} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}






