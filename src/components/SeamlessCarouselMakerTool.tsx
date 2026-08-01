import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Grid3X3,
  ImagePlus,
  Move,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import JSZip from 'jszip';
import { baseUrl } from '../lib/base-url';

type AspectPreset = 'portrait' | 'square' | 'landscape';
type ExportFormat = 'png' | 'jpg';

interface CanvasSize {
  width: number;
  height: number;
  label: string;
  ratioLabel: string;
}

interface StripImage {
  file: File;
  source: string;
  name: string;
  naturalWidth: number;
  naturalHeight: number;
}

interface DragState {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startOffsetX: number;
  startOffsetY: number;
  segmentWidth: number;
  segmentHeight: number;
}

const PRESETS: Record<AspectPreset, CanvasSize> = {
  portrait: { width: 1080, height: 1350, label: 'Portrait', ratioLabel: '4:5' },
  square: { width: 1080, height: 1080, label: 'Square', ratioLabel: '1:1' },
  landscape: { width: 1080, height: 566, label: 'Landscape', ratioLabel: '1.91:1' },
};

const PREVIEW_SEGMENT_WIDTH = 360;
const MIN_SLIDES = 2;
const MAX_STRIP_SLIDES = 10;
const MAX_FILE_BYTES = 50 * 1024 * 1024;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const canvasToBlob = (canvas: HTMLCanvasElement, format: ExportFormat, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Unable to create the exported image.'))),
      format === 'png' ? 'image/png' : 'image/jpeg',
      format === 'png' ? undefined : quality,
    );
  });

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export default function SeamlessCarouselMakerTool() {
  const [stripImage, setStripImage] = useState<StripImage | null>(null);
  const [preset, setPreset] = useState<AspectPreset>('portrait');
  const [slideCount, setSlideCount] = useState(3);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [background, setBackground] = useState('#FFFFFF');
  const [showGuides, setShowGuides] = useState(true);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportQuality, setExportQuality] = useState(0.92);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const sourceRef = useRef<string | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const canvasSize = PRESETS[preset];
  const previewHeight = useMemo(
    () => Math.round(PREVIEW_SEGMENT_WIDTH * (canvasSize.height / canvasSize.width)),
    [canvasSize],
  );

  const resetTransform = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const removeImage = () => {
    if (sourceRef.current) URL.revokeObjectURL(sourceRef.current);
    sourceRef.current = null;
    imageElementRef.current = null;
    setStripImage(null);
    resetTransform();
  };

  useEffect(() => () => {
    if (sourceRef.current) URL.revokeObjectURL(sourceRef.current);
  }, []);

  useEffect(() => {
    setSelectedSlide((current) => clamp(current, 0, slideCount - 1));
    previewCanvasRefs.current.length = slideCount;
  }, [slideCount]);

  const drawSegment = (
    canvas: HTMLCanvasElement,
    segmentWidth: number,
    segmentHeight: number,
    segmentIndex: number,
    includeGuides: boolean,
  ) => {
    const image = imageElementRef.current;
    if (!image) return;

    canvas.width = segmentWidth;
    canvas.height = segmentHeight;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not supported in this browser.');

    context.clearRect(0, 0, segmentWidth, segmentHeight);
    context.fillStyle = background;
    context.fillRect(0, 0, segmentWidth, segmentHeight);

    const stripWidth = segmentWidth * slideCount;
    const radians = (rotation * Math.PI) / 180;
    const rotatedWidth = Math.abs(stripImage!.naturalWidth * Math.cos(radians))
      + Math.abs(stripImage!.naturalHeight * Math.sin(radians));
    const rotatedHeight = Math.abs(stripImage!.naturalWidth * Math.sin(radians))
      + Math.abs(stripImage!.naturalHeight * Math.cos(radians));
    const coverScale = Math.max(stripWidth / rotatedWidth, segmentHeight / rotatedHeight);
    const scale = coverScale * zoom;
    const globalCenterX = stripWidth / 2 + (offsetX / 100) * stripWidth;
    const localCenterX = globalCenterX - segmentIndex * segmentWidth;
    const centerY = segmentHeight / 2 + (offsetY / 100) * segmentHeight;

    context.save();
    context.translate(localCenterX, centerY);
    context.rotate(radians);
    context.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      image,
      (-stripImage!.naturalWidth * scale) / 2,
      (-stripImage!.naturalHeight * scale) / 2,
      stripImage!.naturalWidth * scale,
      stripImage!.naturalHeight * scale,
    );
    context.restore();
    context.filter = 'none';

    if (includeGuides && showGuides) {
      const insetX = segmentWidth * 0.06;
      const insetY = segmentHeight * 0.05;
      context.save();
      context.strokeStyle = 'rgba(255,255,255,.9)';
      context.lineWidth = Math.max(1, segmentWidth / 240);
      context.setLineDash([segmentWidth / 45, segmentWidth / 70]);
      context.strokeRect(insetX, insetY, segmentWidth - insetX * 2, segmentHeight - insetY * 2);
      context.setLineDash([]);
      context.strokeStyle = 'rgba(255,255,255,.5)';
      context.beginPath();
      context.moveTo(segmentWidth / 2, 0);
      context.lineTo(segmentWidth / 2, segmentHeight);
      context.moveTo(0, segmentHeight / 2);
      context.lineTo(segmentWidth, segmentHeight / 2);
      context.stroke();
      context.restore();
    }
  };

  useEffect(() => {
    if (!stripImage || !imageElementRef.current) return;

    previewCanvasRefs.current.forEach((canvas, index) => {
      if (canvas && index < slideCount) {
        drawSegment(canvas, PREVIEW_SEGMENT_WIDTH, previewHeight, index, true);
      }
    });
  }, [
    stripImage,
    previewHeight,
    slideCount,
    zoom,
    offsetX,
    offsetY,
    rotation,
    brightness,
    contrast,
    saturation,
    background,
    showGuides,
  ]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      window.alert('Please choose an image file.');
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      window.alert('The image is larger than 50 MB. Please use a smaller file.');
      return;
    }

    const source = URL.createObjectURL(file);
    const image = new Image();

    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Unable to load the selected image.'));
        image.src = source;
      });

      if (sourceRef.current) URL.revokeObjectURL(sourceRef.current);
      sourceRef.current = source;
      imageElementRef.current = image;
      setStripImage({
        file,
        source,
        name: file.name,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      });
      resetTransform();
    } catch (error) {
      URL.revokeObjectURL(source);
      console.error(error);
      window.alert('The selected image could not be loaded.');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>, index: number) => {
    if (!stripImage) return;
    setSelectedSlide(index);
    const rect = event.currentTarget.getBoundingClientRect();
    dragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startOffsetX: offsetX,
      startOffsetY: offsetY,
      segmentWidth: rect.width,
      segmentHeight: rect.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = ((event.clientX - drag.startClientX) / (drag.segmentWidth * slideCount)) * 100;
    const deltaY = ((event.clientY - drag.startClientY) / drag.segmentHeight) * 100;
    setOffsetX(clamp(drag.startOffsetX + deltaX, -100, 100));
    setOffsetY(clamp(drag.startOffsetY + deltaY, -100, 100));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const renderSegmentToBlob = async (index: number) => {
    const canvas = document.createElement('canvas');
    drawSegment(canvas, canvasSize.width, canvasSize.height, index, false);
    return canvasToBlob(canvas, exportFormat, exportQuality);
  };

  const downloadCurrentSlide = async () => {
    if (!stripImage) return;
    setIsExporting(true);
    setExportProgress(`Rendering slide ${selectedSlide + 1}`);
    try {
      const blob = await renderSegmentToBlob(selectedSlide);
      const extension = exportFormat === 'png' ? 'png' : 'jpg';
      downloadBlob(blob, `seamless-carousel-${String(selectedSlide + 1).padStart(2, '0')}.${extension}`);
    } catch (error) {
      console.error(error);
      window.alert('The selected slide could not be exported.');
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  const downloadAllAsZip = async () => {
    if (!stripImage) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const extension = exportFormat === 'png' ? 'png' : 'jpg';
      for (let index = 0; index < slideCount; index += 1) {
        setExportProgress(`Rendering ${index + 1} of ${slideCount}`);
        const blob = await renderSegmentToBlob(index);
        zip.file(`seamless-carousel-${String(index + 1).padStart(2, '0')}.${extension}`, blob);
      }
      setExportProgress('Creating ZIP');
      const archive = await zip.generateAsync({ type: 'blob' });
      downloadBlob(archive, 'seamless-instagram-carousel.zip');
    } catch (error) {
      console.error(error);
      window.alert('The seamless carousel could not be exported.');
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  const recommendedWidth = canvasSize.width * slideCount;

  return (
    <div className="seamless-page">
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f3f4f6; color: #1a1a1a; }
        button, input, select { font: inherit; }
        .seamless-page { min-height: calc(100vh - 63px); padding: 20px; font-family: Inter, Arial, sans-serif; background: #f3f4f6; }
        .seamless-back { position: fixed; left: 18px; top: 50%; transform: translateY(-50%); z-index: 60; width: 44px; height: 44px; border-radius: 999px; display: flex; align-items: center; justify-content: center; color: #1a1a1a; background: #fff; border: 1px solid #e5e7eb; box-shadow: 0 8px 24px rgba(0,0,0,.08); text-decoration: none; }
        .seamless-shell { width: min(1600px, calc(100vw - 76px)); margin-left: auto; display: grid; grid-template-columns: minmax(0,1fr) 390px; gap: 20px; }
        .seamless-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
        .seamless-editor { min-width: 0; overflow: hidden; }
        .seamless-header { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 24px 26px; border-bottom: 1px solid #e5e7eb; }
        .seamless-eyebrow { margin: 0 0 6px; color: #6b7280; font-size: 11px; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; }
        .seamless-title { margin: 0; font-family: 'Inter Tight',Inter,sans-serif; font-size: clamp(25px,2.7vw,40px); line-height: 1; letter-spacing: -.035em; }
        .seamless-subtitle { max-width: 690px; margin: 10px 0 0; color: #6b7280; font-size: 13px; line-height: 1.55; }
        .seamless-button { min-height: 40px; border: 1px solid #d1d5db; border-radius: 10px; padding: 9px 13px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #fff; color: #1a1a1a; font-size: 13px; font-weight: 650; cursor: pointer; }
        .seamless-button:hover:not(:disabled) { transform: translateY(-1px); border-color: #9ca3af; }
        .seamless-button:disabled { opacity: .45; cursor: not-allowed; }
        .seamless-button.primary { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
        .seamless-button.danger { color: #b91c1c; }
        .seamless-workspace { min-height: 650px; padding: 28px; overflow: hidden; background: linear-gradient(45deg,#eceff2 25%,transparent 25%),linear-gradient(-45deg,#eceff2 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eceff2 75%),linear-gradient(-45deg,transparent 75%,#eceff2 75%); background-size: 24px 24px; background-position: 0 0,0 12px,12px -12px,-12px 0; }
        .seamless-empty { min-height: 590px; border: 2px dashed #cbd5e1; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 38px; text-align: center; background: rgba(255,255,255,.82); cursor: pointer; }
        .seamless-empty-icon { width: 74px; height: 74px; border-radius: 22px; display: flex; align-items: center; justify-content: center; background: #1a1a1a; color: #fff; }
        .seamless-empty h2 { margin: 2px 0 0; font-size: 29px; letter-spacing: -.03em; }
        .seamless-empty p { max-width: 610px; margin: 0; color: #6b7280; line-height: 1.6; }
        .seamless-board-scroll { width: 100%; overflow-x: auto; overflow-y: hidden; padding: 30px 0 34px; scrollbar-width: thin; }
        .seamless-board { width: max-content; min-width: 100%; display: flex; align-items: center; justify-content: flex-start; padding-inline: max(4px, calc((100% - 720px) / 2)); }
        .seamless-segment { position: relative; flex: 0 0 clamp(260px,31vw,360px); border: 0; padding: 0; background: #fff; box-shadow: 0 20px 55px rgba(17,24,39,.2); cursor: grab; }
        .seamless-segment:active { cursor: grabbing; }
        .seamless-segment + .seamless-segment { box-shadow: 1px 0 0 #ef4444 inset, 0 20px 55px rgba(17,24,39,.2); }
        .seamless-segment.selected { z-index: 2; outline: 4px solid #1a1a1a; outline-offset: 4px; }
        .seamless-canvas { display: block; width: 100%; height: auto; touch-action: none; }
        .seamless-cut-line { position: absolute; top: 0; bottom: 0; left: 0; width: 2px; background: #ef4444; transform: translateX(-1px); pointer-events: none; }
        .seamless-slide-badge { position: absolute; left: 12px; bottom: 12px; min-width: 34px; height: 34px; padding: 0 10px; border-radius: 999px; display: flex; align-items: center; justify-content: center; background: rgba(26,26,26,.9); color: #fff; font-size: 12px; font-weight: 750; pointer-events: none; }
        .seamless-board-note { margin: 16px 0 0; text-align: center; color: #6b7280; font-size: 12px; }
        .seamless-settings { min-height: calc(100vh - 103px); max-height: calc(100vh - 103px); overflow-y: auto; padding: 20px; }
        .seamless-section { padding: 18px 0; border-bottom: 1px solid #e5e7eb; }
        .seamless-section:first-child { padding-top: 0; }
        .seamless-section:last-child { border-bottom: 0; padding-bottom: 0; }
        .seamless-section-title { margin: 0 0 13px; display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 750; }
        .seamless-field { display: grid; gap: 7px; margin-top: 13px; }
        .seamless-label { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: #4b5563; font-size: 12px; font-weight: 650; }
        .seamless-value { color: #111827; font-variant-numeric: tabular-nums; }
        .seamless-select, .seamless-text { width: 100%; height: 40px; border: 1px solid #d1d5db; border-radius: 9px; padding: 0 11px; background: #fff; color: #1a1a1a; outline: none; }
        .seamless-range { width: 100%; accent-color: #1a1a1a; }
        .seamless-grid-two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .seamless-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .seamless-help { margin: 11px 0 0; color: #6b7280; font-size: 12px; line-height: 1.55; }
        .seamless-summary { margin: 0 0 12px; padding: 11px 12px; border-radius: 9px; background: #f3f4f6; color: #4b5563; font-size: 12px; line-height: 1.55; }
        .seamless-checkbox { display: flex; align-items: center; gap: 9px; margin-top: 13px; color: #374151; font-size: 13px; cursor: pointer; }
        .seamless-hidden { display: none; }
        @media (max-width: 1050px) { .seamless-back { top: 82px; left: 16px; transform: none; } .seamless-page { padding: 74px 14px 14px; } .seamless-shell { width: 100%; grid-template-columns: 1fr; } .seamless-settings { min-height: auto; max-height: none; overflow: visible; } .seamless-workspace { min-height: 520px; } .seamless-empty { min-height: 460px; } }
        @media (max-width: 640px) { .seamless-header { align-items: flex-start; flex-direction: column; padding: 20px; } .seamless-workspace { padding: 12px; min-height: 480px; } .seamless-empty { min-height: 430px; padding: 28px 18px; } .seamless-segment { flex-basis: 78vw; } .seamless-settings { padding: 17px; } }
      `}</style>

      <a href={`${baseUrl}/`} className="seamless-back" aria-label="Back to tools"><ArrowLeft size={19} /></a>

      <input
        ref={fileInputRef}
        className="seamless-hidden"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = '';
        }}
      />

      <main className="seamless-shell">
        <section className="seamless-card seamless-editor">
          <header className="seamless-header">
            <div>
              <p className="seamless-eyebrow">Continuous carousel canvas</p>
              <h1 className="seamless-title">Seamless Instagram Strip</h1>
              <p className="seamless-subtitle">Position one image across several posts. The red boundaries are the exact cuts used for export, so every transition remains aligned.</p>
            </div>
            <button className="seamless-button" type="button" onClick={() => fileInputRef.current?.click()}><ImagePlus size={17} /> {stripImage ? 'Replace image' : 'Choose image'}</button>
          </header>

          <div className="seamless-workspace" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
            {!stripImage ? (
              <div
                className="seamless-empty"
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click();
                }}
              >
                <div className="seamless-empty-icon"><ImagePlus size={31} /></div>
                <h2>Add one wide image</h2>
                <p>The image will be displayed across all slides on one continuous board. Drag it across the cut lines, adjust the framing, then export perfectly aligned individual posts.</p>
                <button className="seamless-button primary" type="button"><ImagePlus size={17} /> Choose seamless image</button>
              </div>
            ) : (
              <>
                <div className="seamless-board-scroll">
                  <div className="seamless-board">
                    {Array.from({ length: slideCount }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`seamless-segment ${selectedSlide === index ? 'selected' : ''}`}
                        onPointerDown={(event) => handlePointerDown(event, index)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        aria-label={`Edit seamless slide ${index + 1}`}
                      >
                        {index > 0 && <span className="seamless-cut-line" aria-hidden="true" />}
                        <canvas
                          ref={(node) => {
                            previewCanvasRefs.current[index] = node;
                          }}
                          className="seamless-canvas"
                        />
                        <span className="seamless-slide-badge">{index + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <p className="seamless-board-note">Drag on any slide to move the same image across the entire strip. Red lines mark the export cuts.</p>
              </>
            )}
          </div>
        </section>

        <aside className="seamless-card seamless-settings">
          <section className="seamless-section">
            <h2 className="seamless-section-title"><Grid3X3 size={17} /> Strip setup</h2>
            <div className="seamless-field">
              <label className="seamless-label" htmlFor="seamless-format">Instagram size</label>
              <select id="seamless-format" className="seamless-select" value={preset} onChange={(event) => setPreset(event.target.value as AspectPreset)}>
                {Object.entries(PRESETS).map(([key, value]) => <option key={key} value={key}>{value.label} · {value.ratioLabel} · {value.width} × {value.height}</option>)}
              </select>
            </div>
            <div className="seamless-field">
              <label className="seamless-label" htmlFor="seamless-count"><span>Number of slides</span><span className="seamless-value">{slideCount}</span></label>
              <input id="seamless-count" className="seamless-range" type="range" min={MIN_SLIDES} max={MAX_STRIP_SLIDES} step="1" value={slideCount} onChange={(event) => setSlideCount(Number(event.target.value))} />
            </div>
            <p className="seamless-help">Recommended source size: at least {recommendedWidth} × {canvasSize.height}px for this {slideCount}-slide strip.</p>
          </section>

          <section className="seamless-section">
            <h2 className="seamless-section-title"><Move size={17} /> Image framing</h2>
            {!stripImage ? (
              <p className="seamless-help">Choose a wide image to activate framing controls.</p>
            ) : (
              <>
                <div className="seamless-summary">{stripImage.name}<br />{stripImage.naturalWidth} × {stripImage.naturalHeight}px · {(stripImage.file.size / 1024 / 1024).toFixed(1)} MB</div>
                <div className="seamless-field"><div className="seamless-label"><span>Zoom</span><span className="seamless-value">{zoom.toFixed(2)}×</span></div><input className="seamless-range" type="range" min="0.45" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></div>
                <div className="seamless-field"><div className="seamless-label"><span>Horizontal position</span><span className="seamless-value">{offsetX.toFixed(1)}%</span></div><input className="seamless-range" type="range" min="-100" max="100" step="0.1" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} /></div>
                <div className="seamless-field"><div className="seamless-label"><span>Vertical position</span><span className="seamless-value">{offsetY.toFixed(1)}%</span></div><input className="seamless-range" type="range" min="-100" max="100" step="0.1" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} /></div>
                <div className="seamless-field"><div className="seamless-label"><span>Rotation</span><span className="seamless-value">{rotation}°</span></div><input className="seamless-range" type="range" min="-45" max="45" step="1" value={rotation} onChange={(event) => setRotation(Number(event.target.value))} /></div>
                <div className="seamless-field"><div className="seamless-label"><span>Brightness</span><span className="seamless-value">{brightness}%</span></div><input className="seamless-range" type="range" min="40" max="160" step="1" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} /></div>
                <div className="seamless-field"><div className="seamless-label"><span>Contrast</span><span className="seamless-value">{contrast}%</span></div><input className="seamless-range" type="range" min="40" max="160" step="1" value={contrast} onChange={(event) => setContrast(Number(event.target.value))} /></div>
                <div className="seamless-field"><div className="seamless-label"><span>Saturation</span><span className="seamless-value">{saturation}%</span></div><input className="seamless-range" type="range" min="0" max="200" step="1" value={saturation} onChange={(event) => setSaturation(Number(event.target.value))} /></div>
                <div className="seamless-field"><label className="seamless-label" htmlFor="seamless-background">Background</label><div className="seamless-grid-two"><input id="seamless-background" className="seamless-text" type="color" value={background} onChange={(event) => setBackground(event.target.value)} /><input className="seamless-text" type="text" value={background} onChange={(event) => setBackground(event.target.value)} /></div></div>
                <label className="seamless-checkbox"><input type="checkbox" checked={showGuides} onChange={(event) => setShowGuides(event.target.checked)} /> Show center and safe-zone guides</label>
                <button className="seamless-button" type="button" style={{ width: '100%', marginTop: 14 }} onClick={resetTransform}><RotateCcw size={15} /> Reset framing</button>
                <button className="seamless-button danger" type="button" style={{ width: '100%', marginTop: 8 }} onClick={removeImage}><Trash2 size={15} /> Remove image</button>
              </>
            )}
          </section>

          <section className="seamless-section">
            <h2 className="seamless-section-title"><Download size={17} /> Export</h2>
            <p className="seamless-summary">{slideCount} files · {canvasSize.width} × {canvasSize.height}px each · exact edge-to-edge cuts</p>
            <div className="seamless-field"><label className="seamless-label" htmlFor="seamless-export-format">File format</label><select id="seamless-export-format" className="seamless-select" value={exportFormat} onChange={(event) => setExportFormat(event.target.value as ExportFormat)}><option value="png">PNG · maximum quality</option><option value="jpg">JPG · smaller files</option></select></div>
            {exportFormat === 'jpg' && <div className="seamless-field"><div className="seamless-label"><span>JPG quality</span><span className="seamless-value">{Math.round(exportQuality * 100)}%</span></div><input className="seamless-range" type="range" min="0.5" max="1" step="0.01" value={exportQuality} onChange={(event) => setExportQuality(Number(event.target.value))} /></div>}
            {exportProgress && <p className="seamless-help" aria-live="polite">{exportProgress}</p>}
            <div className="seamless-actions" style={{ marginTop: 14 }}>
              <button className="seamless-button" type="button" disabled={!stripImage || isExporting} onClick={() => void downloadCurrentSlide()} style={{ flex: 1 }}><Download size={15} /> Slide {selectedSlide + 1}</button>
              <button className="seamless-button primary" type="button" disabled={!stripImage || isExporting} onClick={() => void downloadAllAsZip()} style={{ flex: 1 }}><Download size={15} /> {isExporting ? 'Preparing…' : 'ZIP all'}</button>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
