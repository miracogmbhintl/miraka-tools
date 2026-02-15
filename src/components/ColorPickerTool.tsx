import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Copy, Check } from 'lucide-react';
import { baseUrl } from '../lib/base-url';

export default function ColorPickerTool() {
  const [color, setColor] = useState('#F37021');
  const [copied, setCopied] = useState<string | null>(null);

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

  const hexToHsl = (hex: string): { h: number; s: number; l: number } | null => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

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

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map((x) => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const rgb = hexToRgb(color) || { r: 0, g: 0, b: 0 };
  const hsl = hexToHsl(color) || { h: 0, s: 0, l: 0 };

  const handleRgbChange = (component: 'r' | 'g' | 'b', value: string) => {
    const num = parseInt(value) || 0;
    const clamped = Math.max(0, Math.min(255, num));
    const newRgb = { ...rgb, [component]: clamped };
    setColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const colorFormats = [
    { label: 'HEX', value: color.toUpperCase() },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
  ];

  return (
    <>
      <style>{`
        .color-picker-container {
          font-family: Inter, sans-serif;
          position: relative;
          height: 100vh;
          width: 100vw;
          padding: 20px;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        .color-picker-back-button {
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
        
        .color-picker-logo {
          display: none;
        }
        
        .color-picker-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          height: 100%;
          width: 100%;
          padding-left: 40px;
        }
        
        .color-picker-left-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 16px;
          height: 100%;
        }
        
        .color-picker-right-column {
          position: sticky;
          top: 0;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        @media (max-width: 768px) {
          .color-picker-container {
            padding: 12px;
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
            display: flex;
            align-items: flex-start;
            justify-content: center;
          }
          
          .color-picker-back-button {
            position: fixed;
            left: 12px;
            top: 12px;
            transform: none;
          }
          
          .color-picker-logo {
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
          
          .color-picker-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding-left: 0;
            padding-top: 50px;
            height: auto;
            width: 90vw;
            max-width: 90vw;
          }
          
          .color-picker-left-column {
            padding-right: 0;
            height: auto;
            overflow: visible;
          }
          
          .color-picker-right-column {
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
          #color-print-area,
          #color-print-area * {
            visibility: visible;
          }
          #color-print-area {
            position: absolute;
            left: 0;
            top: 0;
            background: white;
            padding: 40px;
            font-family: 'Inter Tight', sans-serif;
          }
        }
      `}</style>
      
      <div className="color-picker-container">
        {/* Back Button */}
        <a
          href={`${baseUrl}/`}
          className="color-picker-back-button"
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
        <div className="color-picker-logo">
          <img 
            src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
            alt="Miraka & Co."
            style={{ height: '18px', width: 'auto', display: 'block' }}
          />
        </div>

        <div className="color-picker-grid">
          
          {/* LEFT COLUMN - Scrollable Controls */}
          <div className="color-picker-left-column">
            
            {/* Color Picker */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Inline Color Picker */}
                <div style={{ 
                  width: '100%',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <HexColorPicker 
                    color={color} 
                    onChange={setColor}
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
                      value={color}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('#')) setColor(val.toUpperCase());
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
                        value={rgb[component]}
                        onChange={(e) => handleRgbChange(component, e.target.value)}
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

            {/* Copy Formats */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
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

          {/* RIGHT COLUMN - Fixed Preview */}
          <div className="color-picker-right-column">
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
                <div style={{
                  backgroundColor: color,
                  width: '100%',
                  height: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }} />
              </div>
            </div>

            {/* Color Info */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{
                padding: '16px',
                background: '#FAFAFA',
                borderRadius: '10px',
                border: '1px solid #E5E7EB'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#6B7280', fontWeight: 500 }}>HEX</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1A1A1A' }}>{color.toUpperCase()}</span>
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
          </div>
        </div>
      </div>
    </>
  );
}



