import { useState, useRef } from 'react';
import { Upload, Download, X, Trash2 } from 'lucide-react';
import { baseUrl } from '../lib/base-url';
import JSZip from 'jszip';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  originalSize: number;
  processedBlob: Blob | null;
  processedSize: number;
  isProcessing: boolean;
  outputFormat?: string;
}

type OutputFormat = 'png' | 'jpg' | 'webp';
type ResizeMode = 'none' | 'width' | 'height' | 'both' | 'crop';

export default function ImageCompressorTool() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpg');
  const [resizeMode, setResizeMode] = useState<ResizeMode>('none');
  const [resizeWidth, setResizeWidth] = useState<number>(1920);
  const [resizeHeight, setResizeHeight] = useState<number>(1080);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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

    const remaining = 20 - images.length;
    if (validFiles.length > remaining) {
      alert(`You can only upload ${remaining} more image(s). Maximum is 20 images.`);
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
          processedBlob: null,
          processedSize: 0,
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

  const processImage = async (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image || !image.preview) return;

    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, isProcessing: true } : img))
    );

    try {
      const img = new Image();
      img.src = image.preview;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      let width = img.width;
      let height = img.height;

      // Apply resize logic
      if (resizeMode === 'width') {
        const aspectRatio = height / width;
        width = resizeWidth;
        height = Math.round(width * aspectRatio);
      } else if (resizeMode === 'height') {
        const aspectRatio = width / height;
        height = resizeHeight;
        width = Math.round(height * aspectRatio);
      } else if (resizeMode === 'both') {
        width = resizeWidth;
        height = resizeHeight;
      } else if (resizeMode === 'crop') {
        // Crop to exact dimensions from center
        width = Math.min(resizeWidth, img.width);
        height = Math.min(resizeHeight, img.height);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (resizeMode === 'crop') {
        // Center crop
        const sourceX = (img.width - width) / 2;
        const sourceY = (img.height - height) / 2;
        ctx.drawImage(img, sourceX, sourceY, width, height, 0, 0, width, height);
      } else {
        ctx.drawImage(img, 0, 0, width, height);
      }

      const mimeType = outputFormat === 'png' ? 'image/png' : outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';
      const compressionQuality = quality / 100;

      const createBlob = (format: string, qual: number): Promise<Blob | null> => {
        return new Promise((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob),
            format,
            qual
          );
        });
      };

      const blob = await createBlob(mimeType, compressionQuality);

      if (!blob) {
        throw new Error('Failed to create blob');
      }

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                processedBlob: blob,
                processedSize: blob.size,
                isProcessing: false,
                outputFormat: mimeType
              }
            : img
        )
      );
    } catch (error) {
      console.error('Processing failed:', error);
      alert('Failed to process image. Please try again.');
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, isProcessing: false } : img))
      );
    }
  };

  const processAll = async () => {
    for (const image of images) {
      if (!image.processedBlob) {
        await processImage(image.id);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  };

  const downloadSingle = (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image?.processedBlob) return;

    const url = URL.createObjectURL(image.processedBlob);
    const link = document.createElement('a');
    link.href = url;
    
    const baseName = image.file.name.replace(/\.[^/.]+$/, '');
    link.download = `processed-${baseName}.${outputFormat}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    const processedImages = images.filter((img) => img.processedBlob);
    
    if (processedImages.length === 0) {
      alert('No processed images to download');
      return;
    }

    if (processedImages.length === 1) {
      downloadSingle(processedImages[0].id);
      return;
    }

    const zip = new JSZip();
    processedImages.forEach((image) => {
      if (image.processedBlob) {
        const baseName = image.file.name.replace(/\.[^/.]+$/, '');
        zip.file(`processed-${baseName}.${outputFormat}`, image.processedBlob);
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `processed-images-${Date.now()}.zip`;
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
    setQuality(80);
    setOutputFormat('jpg');
    setResizeMode('none');
    setResizeWidth(1920);
    setResizeHeight(1080);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasImages = images.length > 0;
  const allProcessed = images.length > 0 && images.every((img) => img.processedBlob);
  const someProcessed = images.some((img) => img.processedBlob);

  return (
    <>
      <style>{`
        .image-processor-container {
          font-family: 'Inter Tight', sans-serif;
          position: relative;
          height: 100vh;
          width: 100vw;
          padding: 20px;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        .img-back-button {
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
        
        .img-logo {
          display: none;
        }
        
        .img-grid {
          display: grid;
          grid-template-columns: ${!hasImages ? '1fr' : '1.5fr 1fr'};
          gap: 24px;
          height: 100%;
          padding-left: 40px;
        }
        
        .img-left-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          padding-right: 16px;
          height: 100%;
        }
        
        .img-right-column {
          position: sticky;
          top: 0;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .img-grid-preview {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          overflow-y: auto;
          padding: 4px;
        }
        
        @media (max-width: 768px) {
          .image-processor-container {
            padding: 12px;
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }
          
          .img-back-button {
            position: fixed;
            left: 12px;
            top: 12px;
            transform: none;
          }
          
          .img-logo {
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
          
          .img-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding-left: 0;
            padding-top: 50px;
            height: auto;
          }
          
          .img-left-column {
            padding-right: 0;
            height: auto;
            overflow: visible;
          }
          
          .img-right-column {
            position: relative;
            height: auto;
            overflow: visible;
          }
        }
      `}</style>
      
      <div className="image-processor-container">
        <a
          href={`${baseUrl}/`}
          className="img-back-button"
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

        <div className="img-logo">
          <img 
            src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
            alt="Miraka & Co."
            style={{ height: '18px', width: 'auto', display: 'block' }}
          />
        </div>

        <div className="img-grid">
          <div className="img-left-column">
            
            {/* Upload Area */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '32px',
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
                  padding: '64px 24px',
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
                <Upload size={56} color="#9CA3AF" style={{ margin: '0 auto 20px' }} />
                <p style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  marginBottom: '8px',
                  fontFamily: 'Inter Tight, sans-serif'
                }}>
                  Drop images here or click to browse
                </p>
                <p style={{
                  fontSize: '15px',
                  color: '#6B7280',
                  fontFamily: 'Inter Tight, sans-serif',
                  margin: 0
                }}>
                  Compress • Convert • Resize • Crop
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#9CA3AF',
                  fontFamily: 'Inter Tight, sans-serif',
                  margin: '8px 0 0 0'
                }}>
                  Supports JPG, PNG, WebP • Max 20 images
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
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, fontFamily: 'Inter Tight, sans-serif', fontWeight: 500 }}>
                    {images.length} / 20 images selected
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#F3F4F6',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'Inter Tight, sans-serif'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
                  >
                    <Trash2 size={16} />
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {hasImages && (
              <>
                {/* Output Format Selection */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '24px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
                }}>
                  <label style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    marginBottom: '16px',
                    fontFamily: 'Inter Tight, sans-serif'
                  }}>
                    Output Format
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {(['jpg', 'png', 'webp'] as OutputFormat[]).map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setOutputFormat(format)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: outputFormat === format ? '#1A1A1A' : '#F9FAFB',
                          color: outputFormat === format ? '#FFFFFF' : '#1A1A1A',
                          border: outputFormat === format ? 'none' : '1px solid #E5E7EB',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontFamily: 'Inter Tight, sans-serif',
                          textTransform: 'uppercase'
                        }}
                        onMouseEnter={(e) => {
                          if (outputFormat !== format) {
                            e.currentTarget.style.background = '#F3F4F6';
                            e.currentTarget.style.borderColor = '#D1D5DB';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (outputFormat !== format) {
                            e.currentTarget.style.background = '#F9FAFB';
                            e.currentTarget.style.borderColor = '#E5E7EB';
                          }
                        }}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider */}
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
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    marginBottom: '16px',
                    fontFamily: 'Inter Tight, sans-serif'
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
                    fontFamily: 'Inter Tight, sans-serif',
                    fontWeight: 500
                  }}>
                    <span>Lower</span>
                    <span>Higher</span>
                  </div>
                </div>

                {/* Resize Options */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '24px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
                }}>
                  <label style={{
                    display: 'block',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    marginBottom: '16px',
                    fontFamily: 'Inter Tight, sans-serif'
                  }}>
                    Resize Mode
                  </label>
                  <select
                    value={resizeMode}
                    onChange={(e) => setResizeMode(e.target.value as ResizeMode)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      cursor: 'pointer',
                      fontFamily: 'Inter Tight, sans-serif',
                      marginBottom: resizeMode !== 'none' ? '16px' : '0'
                    }}
                  >
                    <option value="none">No Resize</option>
                    <option value="width">Resize by Width</option>
                    <option value="height">Resize by Height</option>
                    <option value="both">Resize Both (Stretch)</option>
                    <option value="crop">Crop to Dimensions</option>
                  </select>

                  {resizeMode !== 'none' && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {(resizeMode === 'width' || resizeMode === 'both' || resizeMode === 'crop') && (
                        <div style={{ flex: 1 }}>
                          <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#6B7280',
                            marginBottom: '8px',
                            fontFamily: 'Inter Tight, sans-serif'
                          }}>
                            Width (px)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10000"
                            value={resizeWidth}
                            onChange={(e) => setResizeWidth(Number(e.target.value))}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              background: '#F9FAFB',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#1A1A1A',
                              fontFamily: 'Inter Tight, sans-serif'
                            }}
                          />
                        </div>
                      )}
                      {(resizeMode === 'height' || resizeMode === 'both' || resizeMode === 'crop') && (
                        <div style={{ flex: 1 }}>
                          <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#6B7280',
                            marginBottom: '8px',
                            fontFamily: 'Inter Tight, sans-serif'
                          }}>
                            Height (px)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10000"
                            value={resizeHeight}
                            onChange={(e) => setResizeHeight(Number(e.target.value))}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              background: '#F9FAFB',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#1A1A1A',
                              fontFamily: 'Inter Tight, sans-serif'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '24px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: someProcessed ? '1fr 1fr' : '1fr',
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
                        marginBottom: '6px',
                        fontFamily: 'Inter Tight, sans-serif',
                        fontWeight: 600
                      }}>
                        Original Size
                      </p>
                      <p style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#1A1A1A',
                        margin: 0,
                        fontFamily: 'Inter Tight, sans-serif'
                      }}>
                        {formatFileSize(images.reduce((sum, img) => sum + img.originalSize, 0))}
                      </p>
                    </div>
                    {someProcessed && (
                      <div style={{
                        padding: '16px',
                        background: '#D1FAE5',
                        borderRadius: '10px',
                        border: '1px solid #6EE7B7'
                      }}>
                        <p style={{
                          fontSize: '12px',
                          color: '#065F46',
                          marginBottom: '6px',
                          fontFamily: 'Inter Tight, sans-serif',
                          fontWeight: 600
                        }}>
                          Processed
                        </p>
                        <p style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#065F46',
                          margin: 0,
                          fontFamily: 'Inter Tight, sans-serif'
                        }}>
                          {formatFileSize(images.reduce((sum, img) => sum + img.processedSize, 0))}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#065F46',
                          marginTop: '4px',
                          margin: '4px 0 0 0',
                          fontFamily: 'Inter Tight, sans-serif',
                          fontWeight: 600
                        }}>
                          {Math.round((1 - images.reduce((sum, img) => sum + img.processedSize, 0) / images.reduce((sum, img) => sum + img.originalSize, 0)) * 100)}% reduction
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '24px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={processAll}
                      disabled={allProcessed}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        height: '48px',
                        padding: '0 24px',
                        background: allProcessed ? '#E5E7EB' : '#1A1A1A',
                        color: allProcessed ? '#9CA3AF' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '15px',
                        fontWeight: 700,
                        cursor: allProcessed ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'Inter Tight, sans-serif'
                      }}
                      onMouseEnter={(e) => {
                        if (!allProcessed) {
                          e.currentTarget.style.background = '#2A2A2A';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!allProcessed) {
                          e.currentTarget.style.background = '#1A1A1A';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {allProcessed ? 'All Images Processed' : 'Process All Images'}
                    </button>
                    {someProcessed && (
                      <button
                        type="button"
                        onClick={downloadAll}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          height: '48px',
                          padding: '0 24px',
                          background: '#F37021',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '15px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontFamily: 'Inter Tight, sans-serif'
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
                        <Download size={20} strokeWidth={2.5} />
                        Download {images.filter(img => img.processedBlob).length > 1 ? 'All (ZIP)' : 'Processed'}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN - Preview Grid */}
          {hasImages && (
            <div className="img-right-column">
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
                <div className="img-grid-preview">
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
                      
                      <button
                        type="button"
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

                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '8px',
                        right: '8px',
                        background: image.processedBlob 
                          ? 'rgba(16, 185, 129, 0.95)' 
                          : image.isProcessing 
                          ? 'rgba(243, 112, 33, 0.95)' 
                          : 'rgba(107, 114, 128, 0.95)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          fontFamily: 'Inter Tight, sans-serif'
                        }}>
                          {image.processedBlob 
                            ? `${formatFileSize(image.processedSize)}` 
                            : image.isProcessing 
                            ? 'Processing...' 
                            : formatFileSize(image.originalSize)}
                        </span>
                        {image.processedBlob && (
                          <button
                            type="button"
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
