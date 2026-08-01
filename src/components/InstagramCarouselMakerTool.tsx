import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  GripVertical,
  ImagePlus,
  Layers3,
  Plus,
  RotateCcw,
  Trash2,
  Type,
  Upload,
  X,
} from 'lucide-react';
import JSZip from 'jszip';
import { baseUrl } from '../lib/base-url';

type AspectPreset = 'portrait' | 'square' | 'landscape';
type ExportFormat = 'png' | 'jpg';
type TextAlign = 'left' | 'center' | 'right';
type FontWeight = 400 | 600 | 700;

interface CanvasSize {
  width: number;
  height: number;
  label: string;
  ratioLabel: string;
}

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: FontWeight;
  color: string;
  background: string;
  backgroundOpacity: number;
  align: TextAlign;
  maxWidth: number;
}

interface CarouselSlide {
  id: string;
  file: File;
  name: string;
  source: string;
  naturalWidth: number;
  naturalHeight: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
  background: string;
  textLayers: TextLayer[];
}

interface TextHitBox {
  id: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

type DragState =
  | {
      mode: 'image';
      pointerId: number;
      startClientX: number;
      startClientY: number;
      startX: number;
      startY: number;
    }
  | {
      mode: 'text';
      pointerId: number;
      textId: string;
      startClientX: number;
      startClientY: number;
      startX: number;
      startY: number;
    };

const PRESETS: Record<AspectPreset, CanvasSize> = {
  portrait: { width: 1080, height: 1350, label: 'Portrait', ratioLabel: '4:5' },
  square: { width: 1080, height: 1080, label: 'Square', ratioLabel: '1:1' },
  landscape: { width: 1080, height: 566, label: 'Landscape', ratioLabel: '1.91:1' },
};

const MAX_SLIDES = 20;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const canvasToBlob = (canvas: HTMLCanvasElement, format: ExportFormat, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Unable to create image file.'))),
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
  URL.revokeObjectURL(url);
};

const hexToRgba = (hex: string, opacity: number) => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((character) => character + character).join('')
    : normalized.padEnd(6, '0').slice(0, 6);
  const number = Number.parseInt(value, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return `rgba(${red}, ${green}, ${blue}, ${clamp(opacity, 0, 1)})`;
};

const wrapText = (context: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
    } else {
      let currentLine = words[0];
      for (let index = 1; index < words.length; index += 1) {
        const testLine = `${currentLine} ${words[index]}`;
        if (context.measureText(testLine).width <= maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = words[index];
        }
      }
      lines.push(currentLine);
    }

    if (paragraphIndex < paragraphs.length - 1 && paragraph.trim() !== '') lines.push('');
  });

  return lines.length ? lines : [''];
};

export default function InstagramCarouselMakerTool() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [preset, setPreset] = useState<AspectPreset>('portrait');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [exportQuality, setExportQuality] = useState(0.92);
  const [isExporting, setIsExporting] = useState(false);
  const [draggedSlideId, setDraggedSlideId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slidesRef = useRef<CarouselSlide[]>([]);
  const imageCacheRef = useRef<Map<string, Promise<HTMLImageElement>>>(new Map());
  const textHitBoxesRef = useRef<TextHitBox[]>([]);
  const dragStateRef = useRef<DragState | null>(null);

  const canvasSize = PRESETS[preset];
  const selectedSlide = useMemo(
    () => slides.find((slide) => slide.id === selectedSlideId) ?? null,
    [slides, selectedSlideId],
  );
  const selectedText = useMemo(
    () => selectedSlide?.textLayers.find((layer) => layer.id === selectedTextId) ?? null,
    [selectedSlide, selectedTextId],
  );
  const selectedIndex = selectedSlide ? slides.findIndex((slide) => slide.id === selectedSlide.id) : -1;

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => () => {
    slidesRef.current.forEach((slide) => URL.revokeObjectURL(slide.source));
  }, []);

  const getImage = (source: string) => {
    const cached = imageCacheRef.current.get(source);
    if (cached) return cached;

    const imagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Unable to load image.'));
      image.src = source;
    });

    imageCacheRef.current.set(source, imagePromise);
    return imagePromise;
  };

  const drawSlide = async (
    slide: CarouselSlide,
    canvas: HTMLCanvasElement,
    size: CanvasSize,
    showSelection: boolean,
  ) => {
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not supported in this browser.');

    context.clearRect(0, 0, size.width, size.height);
    context.fillStyle = slide.background;
    context.fillRect(0, 0, size.width, size.height);

    const image = await getImage(slide.source);
    const radians = (slide.rotation * Math.PI) / 180;
    const rotatedWidth = Math.abs(slide.naturalWidth * Math.cos(radians)) + Math.abs(slide.naturalHeight * Math.sin(radians));
    const rotatedHeight = Math.abs(slide.naturalWidth * Math.sin(radians)) + Math.abs(slide.naturalHeight * Math.cos(radians));
    const coverScale = Math.max(size.width / rotatedWidth, size.height / rotatedHeight);
    const scale = coverScale * slide.zoom;

    context.save();
    context.beginPath();
    context.rect(0, 0, size.width, size.height);
    context.clip();
    context.translate(
      size.width / 2 + (slide.offsetX / 100) * size.width,
      size.height / 2 + (slide.offsetY / 100) * size.height,
    );
    context.rotate(radians);
    context.filter = `brightness(${slide.brightness}%) contrast(${slide.contrast}%) saturate(${slide.saturation}%)`;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      image,
      (-slide.naturalWidth * scale) / 2,
      (-slide.naturalHeight * scale) / 2,
      slide.naturalWidth * scale,
      slide.naturalHeight * scale,
    );
    context.restore();
    context.filter = 'none';

    const hitBoxes: TextHitBox[] = [];

    slide.textLayers.forEach((layer) => {
      const fontSize = layer.fontSize;
      const lineHeight = fontSize * 1.16;
      const textX = (layer.x / 100) * size.width;
      const textY = (layer.y / 100) * size.height;
      const maxWidth = (layer.maxWidth / 100) * size.width;

      context.save();
      context.font = `${layer.fontWeight} ${fontSize}px Inter, Arial, sans-serif`;
      context.textAlign = layer.align;
      context.textBaseline = 'middle';

      const lines = wrapText(context, layer.text || 'Text', maxWidth);
      const lineWidths = lines.map((line) => context.measureText(line || ' ').width);
      const widestLine = Math.max(...lineWidths, fontSize * 0.4);
      const totalHeight = Math.max(lineHeight, lines.length * lineHeight);
      const paddingX = Math.max(18, fontSize * 0.32);
      const paddingY = Math.max(12, fontSize * 0.22);

      let left = textX;
      if (layer.align === 'center') left -= widestLine / 2;
      if (layer.align === 'right') left -= widestLine;
      const top = textY - totalHeight / 2;
      const boxLeft = left - paddingX;
      const boxTop = top - paddingY;
      const boxWidth = widestLine + paddingX * 2;
      const boxHeight = totalHeight + paddingY * 2;

      if (layer.backgroundOpacity > 0) {
        context.fillStyle = hexToRgba(layer.background, layer.backgroundOpacity);
        context.fillRect(boxLeft, boxTop, boxWidth, boxHeight);
      }

      context.fillStyle = layer.color;
      lines.forEach((line, index) => {
        const lineY = top + lineHeight * index + lineHeight / 2;
        context.fillText(line || ' ', textX, lineY, maxWidth);
      });

      if (showSelection && layer.id === selectedTextId) {
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 4;
        context.setLineDash([12, 10]);
        context.strokeRect(boxLeft - 4, boxTop - 4, boxWidth + 8, boxHeight + 8);
        context.setLineDash([]);
        context.strokeStyle = '#1A1A1A';
        context.lineWidth = 2;
        context.strokeRect(boxLeft - 7, boxTop - 7, boxWidth + 14, boxHeight + 14);
      }

      hitBoxes.push({ id: layer.id, left: boxLeft, top: boxTop, right: boxLeft + boxWidth, bottom: boxTop + boxHeight });
      context.restore();
    });

    if (showSelection) textHitBoxesRef.current = hitBoxes;
  };

  useEffect(() => {
    if (!selectedSlide || !canvasRef.current) {
      textHitBoxesRef.current = [];
      return;
    }

    drawSlide(selectedSlide, canvasRef.current, canvasSize, true).catch(console.error);
  }, [selectedSlide, canvasSize, selectedTextId]);

  const createSlide = async (file: File): Promise<CarouselSlide> => {
    const source = URL.createObjectURL(file);
    try {
      const image = await getImage(source);
      return {
        id: createId('slide'),
        file,
        name: file.name,
        source,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        background: '#FFFFFF',
        textLayers: [],
      };
    } catch (error) {
      URL.revokeObjectURL(source);
      imageCacheRef.current.delete(source);
      throw error;
    }
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (!files.length) {
      window.alert('Please select image files.');
      return;
    }

    const availableSlots = MAX_SLIDES - slides.length;
    if (availableSlots <= 0) {
      window.alert(`This editor supports up to ${MAX_SLIDES} slides.`);
      return;
    }

    const acceptedFiles = files.slice(0, availableSlots);
    if (acceptedFiles.length < files.length) window.alert(`Only the first ${availableSlots} image(s) were added.`);

    try {
      const newSlides = await Promise.all(acceptedFiles.map(createSlide));
      setSlides((current) => [...current, ...newSlides]);
      setSelectedSlideId((current) => current ?? newSlides[0]?.id ?? null);
      setSelectedTextId(null);
    } catch (error) {
      console.error(error);
      window.alert('One or more images could not be loaded.');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    void handleFiles(event.dataTransfer.files);
  };

  const updateSlide = (slideId: string, changes: Partial<CarouselSlide>) => {
    setSlides((current) => current.map((slide) => (slide.id === slideId ? { ...slide, ...changes } : slide)));
  };

  const updateSelectedSlide = (changes: Partial<CarouselSlide>) => {
    if (selectedSlideId) updateSlide(selectedSlideId, changes);
  };

  const updateTextLayer = (textId: string, changes: Partial<TextLayer>) => {
    if (!selectedSlideId) return;
    setSlides((current) => current.map((slide) => {
      if (slide.id !== selectedSlideId) return slide;
      return {
        ...slide,
        textLayers: slide.textLayers.map((layer) => (layer.id === textId ? { ...layer, ...changes } : layer)),
      };
    }));
  };

  const addTextLayer = () => {
    if (!selectedSlide) return;
    const layer: TextLayer = {
      id: createId('text'),
      text: 'Add your message',
      x: 50,
      y: 50,
      fontSize: 74,
      fontWeight: 700,
      color: '#FFFFFF',
      background: '#000000',
      backgroundOpacity: 0.35,
      align: 'center',
      maxWidth: 76,
    };
    updateSelectedSlide({ textLayers: [...selectedSlide.textLayers, layer] });
    setSelectedTextId(layer.id);
  };

  const deleteTextLayer = (textId: string) => {
    if (!selectedSlide) return;
    updateSelectedSlide({ textLayers: selectedSlide.textLayers.filter((layer) => layer.id !== textId) });
    setSelectedTextId((current) => (current === textId ? null : current));
  };

  const removeSlide = (slideId: string) => {
    const index = slides.findIndex((slide) => slide.id === slideId);
    const slide = slides[index];
    if (!slide) return;

    URL.revokeObjectURL(slide.source);
    imageCacheRef.current.delete(slide.source);
    const remaining = slides.filter((item) => item.id !== slideId);
    setSlides(remaining);
    if (selectedSlideId === slideId) {
      setSelectedSlideId(remaining[Math.min(index, remaining.length - 1)]?.id ?? null);
      setSelectedTextId(null);
    }
  };

  const clearAll = () => {
    slides.forEach((slide) => {
      URL.revokeObjectURL(slide.source);
      imageCacheRef.current.delete(slide.source);
    });
    setSlides([]);
    setSelectedSlideId(null);
    setSelectedTextId(null);
  };

  const duplicateSelectedSlide = () => {
    if (!selectedSlide) return;
    if (slides.length >= MAX_SLIDES) {
      window.alert(`This editor supports up to ${MAX_SLIDES} slides.`);
      return;
    }

    const source = URL.createObjectURL(selectedSlide.file);
    const duplicated: CarouselSlide = {
      ...selectedSlide,
      id: createId('slide'),
      source,
      name: `${selectedSlide.name.replace(/\.[^/.]+$/, '')}-copy`,
      textLayers: selectedSlide.textLayers.map((layer) => ({ ...layer, id: createId('text') })),
    };
    const insertAt = selectedIndex + 1;
    setSlides((current) => [...current.slice(0, insertAt), duplicated, ...current.slice(insertAt)]);
    setSelectedSlideId(duplicated.id);
    setSelectedTextId(null);
  };

  const moveSelectedSlide = (direction: -1 | 1) => {
    if (selectedIndex < 0) return;
    const targetIndex = selectedIndex + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const reordered = [...slides];
    const [moved] = reordered.splice(selectedIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setSlides(reordered);
  };

  const reorderSlides = (targetId: string) => {
    if (!draggedSlideId || draggedSlideId === targetId) return;
    const fromIndex = slides.findIndex((slide) => slide.id === draggedSlideId);
    const toIndex = slides.findIndex((slide) => slide.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    const reordered = [...slides];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setSlides(reordered);
    setDraggedSlideId(null);
  };

  const resetImageAdjustments = () => {
    updateSelectedSlide({ zoom: 1, offsetX: 0, offsetY: 0, rotation: 0, brightness: 100, contrast: 100, saturation: 100 });
  };

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selectedSlide || !canvasRef.current) return;
    const point = getCanvasPoint(event);
    if (!point) return;

    const hitText = [...textHitBoxesRef.current].reverse().find((box) => (
      point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom
    ));

    if (hitText) {
      const layer = selectedSlide.textLayers.find((item) => item.id === hitText.id);
      if (!layer) return;
      setSelectedTextId(layer.id);
      dragStateRef.current = {
        mode: 'text', pointerId: event.pointerId, textId: layer.id,
        startClientX: event.clientX, startClientY: event.clientY, startX: layer.x, startY: layer.y,
      };
    } else {
      setSelectedTextId(null);
      dragStateRef.current = {
        mode: 'image', pointerId: event.pointerId,
        startClientX: event.clientX, startClientY: event.clientY,
        startX: selectedSlide.offsetX, startY: selectedSlide.offsetY,
      };
    }

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const dragState = dragStateRef.current;
    const canvas = canvasRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const deltaX = ((event.clientX - dragState.startClientX) / rect.width) * 100;
    const deltaY = ((event.clientY - dragState.startClientY) / rect.height) * 100;

    if (dragState.mode === 'image') {
      updateSelectedSlide({
        offsetX: clamp(dragState.startX + deltaX, -100, 100),
        offsetY: clamp(dragState.startY + deltaY, -100, 100),
      });
    } else {
      updateTextLayer(dragState.textId, {
        x: clamp(dragState.startX + deltaX, 0, 100),
        y: clamp(dragState.startY + deltaY, 0, 100),
      });
    }
  };

  const handleCanvasPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const renderSlideToBlob = async (slide: CarouselSlide) => {
    const exportCanvas = document.createElement('canvas');
    await drawSlide(slide, exportCanvas, canvasSize, false);
    return canvasToBlob(exportCanvas, exportFormat, exportQuality);
  };

  const downloadSlide = async (slide: CarouselSlide, index: number) => {
    setIsExporting(true);
    try {
      const blob = await renderSlideToBlob(slide);
      const extension = exportFormat === 'png' ? 'png' : 'jpg';
      downloadBlob(blob, `instagram-carousel-${String(index + 1).padStart(2, '0')}.${extension}`);
    } catch (error) {
      console.error(error);
      window.alert('The slide could not be exported.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadAllAsZip = async () => {
    if (!slides.length) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const extension = exportFormat === 'png' ? 'png' : 'jpg';
      for (let index = 0; index < slides.length; index += 1) {
        const blob = await renderSlideToBlob(slides[index]);
        zip.file(`instagram-carousel-${String(index + 1).padStart(2, '0')}.${extension}`, blob);
      }
      const archive = await zip.generateAsync({ type: 'blob' });
      downloadBlob(archive, 'instagram-carousel.zip');
    } catch (error) {
      console.error(error);
      window.alert('The carousel could not be exported.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="carousel-maker-page">
      <style>{`
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #F3F4F6; color: #1A1A1A; }
        button, input, textarea, select { font: inherit; }
        .carousel-maker-page { min-height: 100vh; padding: 20px; font-family: Inter, Arial, sans-serif; background: #F3F4F6; }
        .carousel-back-button { position: fixed; left: 18px; top: 50%; transform: translateY(-50%); z-index: 50; width: 44px; height: 44px; border-radius: 999px; display: flex; align-items: center; justify-content: center; color: #1A1A1A; background: #FFF; border: 1px solid #E5E7EB; box-shadow: 0 8px 24px rgba(0,0,0,.08); text-decoration: none; }
        .carousel-shell { width: min(1500px, calc(100vw - 76px)); min-height: calc(100vh - 40px); margin-left: auto; display: grid; grid-template-columns: minmax(0,1fr) 390px; gap: 20px; }
        .carousel-card { background: #FFF; border: 1px solid #E5E7EB; border-radius: 14px; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
        .carousel-editor-card { min-width: 0; min-height: calc(100vh - 40px); display: flex; flex-direction: column; overflow: hidden; }
        .carousel-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px 26px; border-bottom: 1px solid #E5E7EB; }
        .carousel-eyebrow { margin: 0 0 6px; font-family: 'Inter Tight',Inter,sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .11em; text-transform: uppercase; color: #6B7280; }
        .carousel-title { margin: 0; font-family: 'Inter Tight',Inter,sans-serif; font-size: clamp(24px,2.6vw,38px); line-height: 1; letter-spacing: -.035em; }
        .carousel-header-actions, .carousel-inline-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .carousel-button { appearance: none; border: 1px solid #D1D5DB; background: #FFF; color: #1A1A1A; border-radius: 10px; min-height: 40px; padding: 9px 13px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; font-weight: 650; cursor: pointer; transition: .15s ease; }
        .carousel-button:hover:not(:disabled) { transform: translateY(-1px); border-color: #9CA3AF; }
        .carousel-button:disabled { cursor: not-allowed; opacity: .45; }
        .carousel-button.primary { background: #1A1A1A; color: #FFF; border-color: #1A1A1A; }
        .carousel-button.danger { color: #B91C1C; }
        .carousel-button.icon-only { width: 40px; padding: 0; }
        .carousel-workspace { flex: 1; min-height: 0; padding: 22px; display: flex; align-items: center; justify-content: center; background: linear-gradient(45deg,#ECEFF2 25%,transparent 25%),linear-gradient(-45deg,#ECEFF2 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ECEFF2 75%),linear-gradient(-45deg,transparent 75%,#ECEFF2 75%); background-size: 24px 24px; background-position: 0 0,0 12px,12px -12px,-12px 0; }
        .carousel-empty-state { width: min(720px,100%); min-height: 440px; border: 2px dashed #D1D5DB; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 38px; text-align: center; background: rgba(255,255,255,.82); cursor: pointer; }
        .carousel-empty-icon { width: 72px; height: 72px; border-radius: 20px; display: flex; align-items: center; justify-content: center; background: #1A1A1A; color: #FFF; }
        .carousel-empty-state h2 { margin: 4px 0 0; font-family: 'Inter Tight',Inter,sans-serif; font-size: 28px; letter-spacing: -.03em; }
        .carousel-empty-state p { max-width: 520px; margin: 0; color: #6B7280; line-height: 1.55; }
        .carousel-canvas-wrap { width: 100%; height: 100%; min-height: 420px; display: flex; align-items: center; justify-content: center; }
        .carousel-canvas { display: block; width: auto; height: auto; max-width: 100%; max-height: calc(100vh - 300px); background: #FFF; box-shadow: 0 18px 50px rgba(17,24,39,.18); touch-action: none; cursor: grab; }
        .carousel-canvas:active { cursor: grabbing; }
        .carousel-slide-strip { border-top: 1px solid #E5E7EB; padding: 14px 18px 16px; background: #FFF; }
        .carousel-strip-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; color: #6B7280; font-size: 12px; }
        .carousel-thumbnails { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; }
        .carousel-thumbnail { position: relative; flex: 0 0 92px; height: 92px; padding: 0; border: 2px solid transparent; border-radius: 11px; background: #F3F4F6; overflow: hidden; cursor: pointer; }
        .carousel-thumbnail.selected { border-color: #1A1A1A; }
        .carousel-thumbnail img { width: 100%; height: 100%; display: block; object-fit: cover; }
        .carousel-thumbnail-number { position: absolute; left: 6px; bottom: 6px; min-width: 23px; height: 23px; padding: 0 6px; border-radius: 999px; display: flex; align-items: center; justify-content: center; background: rgba(26,26,26,.88); color: #FFF; font-size: 11px; font-weight: 700; }
        .carousel-thumbnail-grip { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 7px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.9); color: #1A1A1A; }
        .carousel-settings { min-height: calc(100vh - 40px); max-height: calc(100vh - 40px); overflow-y: auto; padding: 20px; }
        .carousel-panel-section { padding: 18px 0; border-bottom: 1px solid #E5E7EB; }
        .carousel-panel-section:first-child { padding-top: 0; }
        .carousel-panel-section:last-child { border-bottom: 0; padding-bottom: 0; }
        .carousel-section-title { margin: 0 0 13px; display: flex; align-items: center; gap: 8px; font-family: 'Inter Tight',Inter,sans-serif; font-size: 15px; font-weight: 700; }
        .carousel-field { display: grid; gap: 7px; margin-top: 13px; }
        .carousel-label-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 12px; font-weight: 650; color: #4B5563; }
        .carousel-value { color: #111827; font-variant-numeric: tabular-nums; }
        .carousel-select, .carousel-text-input, .carousel-textarea { width: 100%; border: 1px solid #D1D5DB; border-radius: 9px; background: #FFF; color: #1A1A1A; outline: none; }
        .carousel-select, .carousel-text-input { height: 40px; padding: 0 11px; }
        .carousel-textarea { min-height: 82px; padding: 10px 11px; resize: vertical; line-height: 1.45; }
        .carousel-select:focus, .carousel-text-input:focus, .carousel-textarea:focus { border-color: #1A1A1A; box-shadow: 0 0 0 3px rgba(26,26,26,.08); }
        .carousel-range { width: 100%; accent-color: #1A1A1A; }
        .carousel-color-row { display: grid; grid-template-columns: 44px 1fr; gap: 8px; }
        .carousel-color-input { width: 44px; height: 40px; border: 1px solid #D1D5DB; border-radius: 9px; padding: 3px; background: #FFF; cursor: pointer; }
        .carousel-segmented { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; }
        .carousel-segmented button.active { background: #1A1A1A; color: #FFF; border-color: #1A1A1A; }
        .carousel-text-layer-list { display: grid; gap: 7px; margin-top: 10px; }
        .carousel-text-layer-row { display: grid; grid-template-columns: minmax(0,1fr) 36px; gap: 7px; }
        .carousel-text-layer-button { min-width: 0; height: 38px; border: 1px solid #D1D5DB; border-radius: 9px; padding: 0 10px; background: #FFF; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
        .carousel-text-layer-button.active { border-color: #1A1A1A; box-shadow: inset 0 0 0 1px #1A1A1A; }
        .carousel-help { margin: 12px 0 0; color: #6B7280; font-size: 12px; line-height: 1.5; }
        .carousel-export-summary { margin: 0 0 12px; padding: 11px 12px; border-radius: 9px; background: #F3F4F6; color: #4B5563; font-size: 12px; line-height: 1.5; }
        .carousel-empty-settings { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px; color: #6B7280; text-align: center; }
        .carousel-hidden-input { display: none; }
        @media (max-width: 1050px) { .carousel-back-button { top: 16px; left: 16px; transform: none; } .carousel-maker-page { padding: 74px 14px 14px; } .carousel-shell { width: 100%; grid-template-columns: 1fr; } .carousel-editor-card, .carousel-settings { min-height: auto; max-height: none; } .carousel-settings { overflow: visible; } .carousel-canvas { max-height: 62vh; } }
        @media (max-width: 640px) { .carousel-header { align-items: flex-start; flex-direction: column; padding: 20px; } .carousel-header-actions { width: 100%; } .carousel-header-actions .carousel-button { flex: 1; } .carousel-workspace { padding: 12px; } .carousel-empty-state { min-height: 360px; padding: 28px 18px; } .carousel-canvas-wrap { min-height: 320px; } .carousel-canvas { max-height: 56vh; } .carousel-settings { padding: 17px; } .carousel-thumbnail { flex-basis: 80px; height: 80px; } }
      `}</style>

      <a href={`${baseUrl}/`} className="carousel-back-button" aria-label="Back to tools"><ArrowLeft size={19} /></a>

      <input
        ref={fileInputRef}
        className="carousel-hidden-input"
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => {
          if (event.target.files) void handleFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <main className="carousel-shell">
        <section className="carousel-card carousel-editor-card">
          <header className="carousel-header">
            <div>
              <p className="carousel-eyebrow">Image Tools</p>
              <h1 className="carousel-title">Instagram Carousel Maker</h1>
            </div>
            <div className="carousel-header-actions">
              <button className="carousel-button" type="button" onClick={() => fileInputRef.current?.click()}><ImagePlus size={17} /> Add photos</button>
              <button className="carousel-button primary" type="button" disabled={!selectedSlide || isExporting} onClick={() => selectedSlide && void downloadSlide(selectedSlide, selectedIndex)}>
                <Download size={17} /> {isExporting ? 'Preparing…' : 'Download slide'}
              </button>
            </div>
          </header>

          <div className="carousel-workspace" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
            {selectedSlide ? (
              <div className="carousel-canvas-wrap">
                <canvas
                  ref={canvasRef}
                  className="carousel-canvas"
                  aria-label="Carousel slide editor"
                  onPointerDown={handleCanvasPointerDown}
                  onPointerMove={handleCanvasPointerMove}
                  onPointerUp={handleCanvasPointerUp}
                  onPointerCancel={handleCanvasPointerUp}
                />
              </div>
            ) : (
              <div
                className="carousel-empty-state"
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click();
                }}
              >
                <div className="carousel-empty-icon"><Upload size={30} /></div>
                <h2>Drop your carousel photos here</h2>
                <p>Upload up to {MAX_SLIDES} images. Reorder every slide, reposition the photo, apply adjustments, place text, and export at Instagram-ready dimensions.</p>
                <button className="carousel-button primary" type="button"><ImagePlus size={17} /> Choose photos</button>
              </div>
            )}
          </div>

          {slides.length > 0 && (
            <div className="carousel-slide-strip">
              <div className="carousel-strip-heading">
                <span>{slides.length} slide{slides.length === 1 ? '' : 's'} · drag thumbnails to reorder</span>
                <button className="carousel-button danger" type="button" onClick={clearAll}><Trash2 size={15} /> Clear all</button>
              </div>
              <div className="carousel-thumbnails">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    draggable
                    className={`carousel-thumbnail ${selectedSlideId === slide.id ? 'selected' : ''}`}
                    onClick={() => { setSelectedSlideId(slide.id); setSelectedTextId(null); }}
                    onDragStart={() => setDraggedSlideId(slide.id)}
                    onDragEnd={() => setDraggedSlideId(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => reorderSlides(slide.id)}
                    aria-label={`Select slide ${index + 1}`}
                  >
                    <img src={slide.source} alt="" />
                    <span className="carousel-thumbnail-number">{index + 1}</span>
                    <span className="carousel-thumbnail-grip"><GripVertical size={14} /></span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="carousel-card carousel-settings">
          {!selectedSlide ? (
            <div className="carousel-empty-settings"><Layers3 size={30} /><p>Add photos to begin building the carousel.</p></div>
          ) : (
            <>
              <section className="carousel-panel-section">
                <h2 className="carousel-section-title"><Layers3 size={17} /> Carousel format</h2>
                <div className="carousel-field">
                  <label className="carousel-label-row" htmlFor="carousel-preset">Instagram size</label>
                  <select id="carousel-preset" className="carousel-select" value={preset} onChange={(event) => setPreset(event.target.value as AspectPreset)}>
                    {Object.entries(PRESETS).map(([key, value]) => <option key={key} value={key}>{value.label} · {value.ratioLabel} · {value.width} × {value.height}</option>)}
                  </select>
                </div>
                <p className="carousel-help">Every exported slide uses the same dimensions so the carousel remains aligned.</p>
              </section>

              <section className="carousel-panel-section">
                <h2 className="carousel-section-title"><ImagePlus size={17} /> Selected slide</h2>
                <div className="carousel-inline-actions">
                  <button className="carousel-button icon-only" type="button" disabled={selectedIndex <= 0} onClick={() => moveSelectedSlide(-1)} aria-label="Move slide left"><ChevronLeft size={17} /></button>
                  <button className="carousel-button icon-only" type="button" disabled={selectedIndex >= slides.length - 1} onClick={() => moveSelectedSlide(1)} aria-label="Move slide right"><ChevronRight size={17} /></button>
                  <button className="carousel-button" type="button" onClick={duplicateSelectedSlide}><Copy size={15} /> Duplicate</button>
                  <button className="carousel-button danger icon-only" type="button" onClick={() => removeSlide(selectedSlide.id)} aria-label="Delete selected slide"><X size={17} /></button>
                </div>

                <div className="carousel-field"><div className="carousel-label-row"><span>Zoom</span><span className="carousel-value">{selectedSlide.zoom.toFixed(2)}×</span></div><input className="carousel-range" type="range" min="1" max="3" step="0.01" value={selectedSlide.zoom} onChange={(event) => updateSelectedSlide({ zoom: Number(event.target.value) })} /></div>
                <div className="carousel-field"><div className="carousel-label-row"><span>Rotation</span><span className="carousel-value">{selectedSlide.rotation}°</span></div><input className="carousel-range" type="range" min="-180" max="180" step="1" value={selectedSlide.rotation} onChange={(event) => updateSelectedSlide({ rotation: Number(event.target.value) })} /></div>
                <div className="carousel-field"><div className="carousel-label-row"><span>Brightness</span><span className="carousel-value">{selectedSlide.brightness}%</span></div><input className="carousel-range" type="range" min="40" max="160" step="1" value={selectedSlide.brightness} onChange={(event) => updateSelectedSlide({ brightness: Number(event.target.value) })} /></div>
                <div className="carousel-field"><div className="carousel-label-row"><span>Contrast</span><span className="carousel-value">{selectedSlide.contrast}%</span></div><input className="carousel-range" type="range" min="40" max="160" step="1" value={selectedSlide.contrast} onChange={(event) => updateSelectedSlide({ contrast: Number(event.target.value) })} /></div>
                <div className="carousel-field"><div className="carousel-label-row"><span>Saturation</span><span className="carousel-value">{selectedSlide.saturation}%</span></div><input className="carousel-range" type="range" min="0" max="200" step="1" value={selectedSlide.saturation} onChange={(event) => updateSelectedSlide({ saturation: Number(event.target.value) })} /></div>
                <div className="carousel-field">
                  <label className="carousel-label-row" htmlFor="slide-background">Background</label>
                  <div className="carousel-color-row">
                    <input id="slide-background" className="carousel-color-input" type="color" value={selectedSlide.background} onChange={(event) => updateSelectedSlide({ background: event.target.value })} />
                    <input className="carousel-text-input" type="text" value={selectedSlide.background} onChange={(event) => updateSelectedSlide({ background: event.target.value })} />
                  </div>
                </div>
                <button className="carousel-button" type="button" style={{ marginTop: 14, width: '100%' }} onClick={resetImageAdjustments}><RotateCcw size={15} /> Reset image adjustments</button>
                <p className="carousel-help">Drag directly on the canvas to reposition the photo. Text boxes can also be dragged independently.</p>
              </section>

              <section className="carousel-panel-section">
                <h2 className="carousel-section-title"><Type size={17} /> Text layers</h2>
                <button className="carousel-button primary" type="button" style={{ width: '100%' }} onClick={addTextLayer}><Plus size={16} /> Add text</button>

                {selectedSlide.textLayers.length > 0 && (
                  <div className="carousel-text-layer-list">
                    {selectedSlide.textLayers.map((layer, index) => (
                      <div className="carousel-text-layer-row" key={layer.id}>
                        <button className={`carousel-text-layer-button ${selectedTextId === layer.id ? 'active' : ''}`} type="button" onClick={() => setSelectedTextId(layer.id)}>{index + 1}. {layer.text || 'Empty text'}</button>
                        <button className="carousel-button danger icon-only" type="button" onClick={() => deleteTextLayer(layer.id)} aria-label="Delete text layer"><Trash2 size={15} /></button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedText && (
                  <div style={{ marginTop: 15 }}>
                    <div className="carousel-field"><label className="carousel-label-row" htmlFor="carousel-text-content">Text</label><textarea id="carousel-text-content" className="carousel-textarea" value={selectedText.text} onChange={(event) => updateTextLayer(selectedText.id, { text: event.target.value })} /></div>
                    <div className="carousel-field"><div className="carousel-label-row"><span>Font size</span><span className="carousel-value">{selectedText.fontSize}px</span></div><input className="carousel-range" type="range" min="24" max="180" step="2" value={selectedText.fontSize} onChange={(event) => updateTextLayer(selectedText.id, { fontSize: Number(event.target.value) })} /></div>
                    <div className="carousel-field"><label className="carousel-label-row" htmlFor="carousel-font-weight">Weight</label><select id="carousel-font-weight" className="carousel-select" value={selectedText.fontWeight} onChange={(event) => updateTextLayer(selectedText.id, { fontWeight: Number(event.target.value) as FontWeight })}><option value={400}>Regular</option><option value={600}>Semibold</option><option value={700}>Bold</option></select></div>
                    <div className="carousel-field">
                      <span className="carousel-label-row">Alignment</span>
                      <div className="carousel-segmented">
                        <button className={`carousel-button ${selectedText.align === 'left' ? 'active' : ''}`} type="button" onClick={() => updateTextLayer(selectedText.id, { align: 'left' })}><AlignLeft size={16} /></button>
                        <button className={`carousel-button ${selectedText.align === 'center' ? 'active' : ''}`} type="button" onClick={() => updateTextLayer(selectedText.id, { align: 'center' })}><AlignCenter size={16} /></button>
                        <button className={`carousel-button ${selectedText.align === 'right' ? 'active' : ''}`} type="button" onClick={() => updateTextLayer(selectedText.id, { align: 'right' })}><AlignRight size={16} /></button>
                      </div>
                    </div>
                    <div className="carousel-field"><div className="carousel-label-row"><span>Text width</span><span className="carousel-value">{selectedText.maxWidth}%</span></div><input className="carousel-range" type="range" min="20" max="95" step="1" value={selectedText.maxWidth} onChange={(event) => updateTextLayer(selectedText.id, { maxWidth: Number(event.target.value) })} /></div>
                    <div className="carousel-field"><label className="carousel-label-row" htmlFor="carousel-text-color">Text color</label><div className="carousel-color-row"><input id="carousel-text-color" className="carousel-color-input" type="color" value={selectedText.color} onChange={(event) => updateTextLayer(selectedText.id, { color: event.target.value })} /><input className="carousel-text-input" type="text" value={selectedText.color} onChange={(event) => updateTextLayer(selectedText.id, { color: event.target.value })} /></div></div>
                    <div className="carousel-field"><label className="carousel-label-row" htmlFor="carousel-text-background">Text background</label><div className="carousel-color-row"><input id="carousel-text-background" className="carousel-color-input" type="color" value={selectedText.background} onChange={(event) => updateTextLayer(selectedText.id, { background: event.target.value })} /><input className="carousel-text-input" type="text" value={selectedText.background} onChange={(event) => updateTextLayer(selectedText.id, { background: event.target.value })} /></div></div>
                    <div className="carousel-field"><div className="carousel-label-row"><span>Background opacity</span><span className="carousel-value">{Math.round(selectedText.backgroundOpacity * 100)}%</span></div><input className="carousel-range" type="range" min="0" max="1" step="0.05" value={selectedText.backgroundOpacity} onChange={(event) => updateTextLayer(selectedText.id, { backgroundOpacity: Number(event.target.value) })} /></div>
                  </div>
                )}
              </section>

              <section className="carousel-panel-section">
                <h2 className="carousel-section-title"><Download size={17} /> Export</h2>
                <p className="carousel-export-summary">{slides.length} slide{slides.length === 1 ? '' : 's'} · {canvasSize.width} × {canvasSize.height}px · processed locally in your browser</p>
                <div className="carousel-field"><label className="carousel-label-row" htmlFor="carousel-export-format">File format</label><select id="carousel-export-format" className="carousel-select" value={exportFormat} onChange={(event) => setExportFormat(event.target.value as ExportFormat)}><option value="png">PNG · maximum quality</option><option value="jpg">JPG · smaller files</option></select></div>
                {exportFormat === 'jpg' && <div className="carousel-field"><div className="carousel-label-row"><span>JPG quality</span><span className="carousel-value">{Math.round(exportQuality * 100)}%</span></div><input className="carousel-range" type="range" min="0.5" max="1" step="0.01" value={exportQuality} onChange={(event) => setExportQuality(Number(event.target.value))} /></div>}
                <div className="carousel-inline-actions" style={{ marginTop: 14 }}>
                  <button className="carousel-button" type="button" disabled={isExporting} onClick={() => void downloadSlide(selectedSlide, selectedIndex)} style={{ flex: 1 }}><Download size={15} /> Current</button>
                  <button className="carousel-button primary" type="button" disabled={isExporting} onClick={() => void downloadAllAsZip()} style={{ flex: 1 }}><Download size={15} /> {isExporting ? 'Preparing…' : 'ZIP all'}</button>
                </div>
              </section>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
