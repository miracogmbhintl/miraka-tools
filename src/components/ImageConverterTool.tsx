import { useState, useRef } from 'react';
import { Upload, Download, X, ArrowRight, Trash2 } from 'lucide-react';
import { baseUrl } from '../lib/base-url';
import JSZip from 'jszip';

type ImageFormat = 'png' | 'jpeg' | 'webp';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  originalFormat: string;
  convertedBlob: Blob | null;
  convertedSize: number;
  isProcessing: boolean;
}

export default function ImageConverterTool() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('webp');
  const [quality, setQuality] = useState<number>(90);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFormatFromFile = (file: File): string => {
    const type = file.type.split('/')[1];
    if (type === 'jpg') return 'jpeg';
    return type;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        validFiles.push(files[i]);
      }
    }

    if (validFiles.length === 0) {
      alert('Please select valid image files');
      return;
    }

    const remaining = 10 - images.length;
    if (validFiles.length > remaining) {
      alert(`You can only upload ${remaining} more image(s). Maximum is 10 images.`);
      validFiles.splice(remaining);
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: ImageFile = {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: e.target?.result as string,
          originalSize: file.size,
          originalFormat: getFormatFromFile(file),
          convertedBlob: null,
          convertedSize: 0,
          isProcessing: false
        };
        setImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const convertImage = async (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image || !image.preview) return;

    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, isProcessing: true } : img))
    );

    try {
      const img = new Image();
      img.src = image.preview;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      ctx.drawImage(img, 0, 0);

      const mimeType = `image/${targetFormat}`;
      const qualityValue = targetFormat === 'png' ? undefined : quality / 100;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setImages((prev) =>
              prev.map((img) =>
                img.id === imageId
                  ? {
                      ...img,
                      convertedBlob: blob,
                      convertedSize: blob.size,
                      isProcessing: false
                    }
                  : img
              )
            );
          }
        },
        mimeType,
        qualityValue
      );
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Failed to convert image');
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, isProcessing: false } : img))
      );
    }
  };

  const convertAll = async () => {
    for (const image of images) {
      if (!image.convertedBlob) {
        await convertImage(image.id);
        // Small delay to prevent UI freezing
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  };

  const downloadSingle = (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image?.convertedBlob) return;

    const url = URL.createObjectURL(image.convertedBlob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = image.file.name.split('.').slice(0, -1).join('.');
    link.download = `${baseName || 'converted'}.${targetFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    const convertedImages = images.filter((img) => img.convertedBlob);
    
    if (convertedImages.length === 0) {
      alert('No converted images to download');
      return;
    }

    if (convertedImages.length === 1) {
      downloadSingle(convertedImages[0].id);
      return;
    }

    // Create ZIP file
    const zip = new JSZip();
    convertedImages.forEach((image) => {
      if (image.convertedBlob) {
        const baseName = image.file.name.split('.').slice(0, -1).join('.');
        zip.file(`${baseName}.${targetFormat}`, image.convertedBlob);
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted-images-${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const reset = () => {
    setImages([]);
    setTargetFormat('webp');
    setQuality(90);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasImages = images.length > 0;
  const allConverted = images.length > 0 && images.every((img) => img.convertedBlob);
  const someConverted = images.some((img) => img.convertedBlob);

  return (
    <>
      <style>{`
        .image-converter-container {
          font-family: Inter, sans-serif;
          position: relative;
          height: 100vh;
          width: 100vw;
          padding: 20px;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        .imgconv-back-button {
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
        
        .imgconv-logo {
          display: none;
        }
        
        .imgconv-grid {
          display: grid;
          grid-template-columns: ${!hasImages ? '1fr' : '1fr 1fr'};
          gap: 24px;
          height: 100%;
          padding-left: 40px;
        }
        
        .imgconv-left-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          padding-right: 16px;
          height: 100%;
        }
        
        .imgconv-right-column {
          position: sticky;
          top: 0;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .imgconv-grid-preview {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          overflow-y: auto;
          padding: 4px;
        }
        
        @media (max-width: 768px) {
          .image-converter-container {
            padding: 12px;
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }
          
          .imgconv-back-button {
            position: fixed;
            left: 12px;
            top: 12px;
            transform: none;
          }
          
          .imgconv-logo {
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
          
          .imgconv-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding-left: 0;
            padding-top: 50px;
            height: auto;
          }
          
          .imgconv-left-column {
            padding-right: 0;
            height: auto;
            overflow: visible;
          }
          
          .imgconv-right-column {
            position: relative;
            height: auto;
            overflow: visible;
          }
        }
      `}</style>
      
      <div className="image-converter-container">
        {/* Back Button */}
        <a
          href={`${baseUrl}/`}
          className="imgconv-back-button"
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
        <div className="imgconv-logo">
          <img 
            src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
            alt="Miraka & Co."
            style={{ height: '18px', width: 'auto', display: 'block' }}
          />
        </div>

        <div className="imgconv-grid">
          {/* LEFT COLUMN - Controls */}
          <div className="imgconv-left-column">
            
            {/* Upload Area */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
            }}>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #E5E7EB',
                  borderRadius: '12px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: '#F9FAFB'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#F37021';
                  e.currentTarget.style.background = '#FFF7F3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.background = '#F9FAFB';
                }}
              >
                <Upload size={48} color="#9CA3AF" style={{ margin: '0 auto 16px' }} />
                <p style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  marginBottom: '8px',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Drop images here or click to browse
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0
                }}>
                  Supports JPG, PNG, WebP • Max 10 images
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  style={{ display: 'none' }}
                />
              </div>
              
              {hasImages && (
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                    {images.length} / 10 images selected
                  </p>
                  <button
                    onClick={reset}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: '#F3F4F6',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#1A1A1A',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
                  >
                    <Trash2 size={14} />
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* Format Selection */}
            {hasImages && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
              }}>
                <p style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  marginBottom: '12px',
                  fontWeight: 500,
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Convert all images to
                </p>
                <select
                  value={targetFormat}
                  onChange={(e) => {
                    setTargetFormat(e.target.value as ImageFormat);
                    // Reset converted state when format changes
                    setImages(prev => prev.map(img => ({ ...img, convertedBlob: null, convertedSize: 0 })));
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: '2px solid #F37021',
                    borderRadius: '10px',
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    background: '#FFFFFF',
                    textTransform: 'uppercase'
                  }}
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
            )}

            {/* Quality Slider (not for PNG) */}
            {hasImages && targetFormat !== 'png' && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
              }}>
                <label style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  marginBottom: '16px',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  <span>Quality</span>
                  <span style={{ color: '#F37021' }}>{quality}%</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    outline: 'none',
                    background: `linear-gradient(to right, #F37021 0%, #F37021 ${quality}%, #E5E7EB ${quality}%, #E5E7EB 100%)`,
                    cursor: 'pointer'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '12px',
                  fontSize: '12px',
                  color: '#6B7280',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  <span>Lower quality</span>
                  <span>Higher quality</span>
                </div>
              </div>
            )}

            {/* Total File Sizes */}
            {hasImages && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: someConverted ? '1fr 1fr' : '1fr',
                  gap: '16px'
                }}>
                  <div style={{
                    padding: '16px',
                    background: '#F9FAFB',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB'
                  }}>
                    <p style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      marginBottom: '4px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500
                    }}>
                      Total Original Size
                    </p>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1A1A1A',
                      margin: 0,
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {formatFileSize(images.reduce((sum, img) => sum + img.originalSize, 0))}
                    </p>
                  </div>
                  {someConverted && (
                    <div style={{
                      padding: '16px',
                      background: '#FFF7F3',
                      borderRadius: '10px',
                      border: '1px solid #F37021'
                    }}>
                      <p style={{
                        fontSize: '12px',
                        color: '#F37021',
                        marginBottom: '4px',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500
                      }}>
                        Total Converted
                      </p>
                      <p style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#1A1A1A',
                        margin: 0,
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {formatFileSize(images.reduce((sum, img) => sum + img.convertedSize, 0))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {hasImages && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={convertAll}
                    disabled={allConverted}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      height: '44px',
                      padding: '0 24px',
                      background: allConverted ? '#E5E7EB' : '#1A1A1A',
                      color: allConverted ? '#9CA3AF' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: allConverted ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      if (!allConverted) {
                        e.currentTarget.style.background = '#2A2A2A';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!allConverted) {
                        e.currentTarget.style.background = '#1A1A1A';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {allConverted ? `All Images Converted to ${targetFormat.toUpperCase()}` : `Convert All to ${targetFormat.toUpperCase()}`}
                  </button>
                  {someConverted && (
                    <button
                      onClick={downloadAll}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        height: '44px',
                        padding: '0 24px',
                        background: '#F37021',
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
                        e.currentTarget.style.background = '#E56820';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F37021';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Download size={18} strokeWidth={2} />
                      Download {images.filter(img => img.convertedBlob).length > 1 ? 'All (ZIP)' : targetFormat.toUpperCase()}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Preview Grid */}
          {hasImages && (
            <div className="imgconv-right-column">
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
              }}>
                <div className="imgconv-grid-preview">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundImage: 'linear-gradient(45deg, #E5E5E5 25%, transparent 25%), linear-gradient(-45deg, #E5E5E5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #E5E5E5 75%), linear-gradient(-45deg, transparent 75%, #E5E5E5 75%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                        backgroundColor: '#FAFAFA',
                        border: '1px solid #E5E7EB'
                      }}
                    >
                      <img
                        src={image.preview}
                        alt={image.file.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      
                      {/* Remove button */}
                      <button
                        onClick={() => removeImage(image.id)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: '#1A1A1A',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.9,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                      >
                        <X size={16} color="#FFFFFF" />
                      </button>

                      {/* Format badge */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'rgba(26, 26, 26, 0.9)',
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          fontFamily: 'Inter, sans-serif',
                          textTransform: 'uppercase'
                        }}>
                          {image.originalFormat}
                        </span>
                      </div>

                      {/* Status badge */}
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        right: '8px',
                        background: image.convertedBlob 
                          ? 'rgba(243, 112, 33, 0.95)' 
                          : image.isProcessing 
                          ? 'rgba(243, 112, 33, 0.95)' 
                          : 'rgba(107, 114, 128, 0.95)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          fontFamily: 'Inter, sans-serif'
                        }}>
                          {image.convertedBlob 
                            ? `${targetFormat.toUpperCase()} • ${formatFileSize(image.convertedSize)}` 
                            : image.isProcessing 
                            ? 'Converting...' 
                            : formatFileSize(image.originalSize)}
                        </span>
                        {image.convertedBlob && (
                          <button
                            onClick={() => downloadSingle(image.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Download size={14} color="#FFFFFF" strokeWidth={2.5} />
                          </button>
                        )}
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
