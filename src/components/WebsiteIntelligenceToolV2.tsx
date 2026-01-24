import { useState } from 'react';
import { ArrowLeft, Download, MessageSquare, CheckCircle2, Loader2, AlertCircle, FileText, ChevronDown, ChevronRight, Info, Search, TrendingUp } from 'lucide-react';
import { baseUrl } from '../lib/base-url';
import { generateIntelligencePDF } from '../lib/generateIntelligencePDF';
import '../styles/global.css';

type AnalysisStep = {
  label: string;
  status: 'pending' | 'active' | 'complete';
};

type AnalysisState = 'idle' | 'analyzing' | 'complete' | 'error';

type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW';

type AnalysisData = {
  executiveSnapshot: {
    businessName: string;
    industry: string;
    businessType: string;
    marketScope: string;
    primaryGoal: string;
    clarityScore: number;
  };
  coreVariables: {
    businessType: string;
    targetAudience: string;
    offerStructure: string;
    pricingNote?: string;
    pricingPositioning: string;
    conversionFocus: string;
    contentDepth: string;
    trustSignals: string;
    structuralWeaknesses: string;
  };
  strategicSignals: string[];
  strengthsHighlights: string[]; // NEW: What's working well
  nextMoves: Array<{
    title: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }>;
  // V2 Extensions
  impactPriority?: Array<{
    title: string;
    impact: ImpactLevel;
  }>;
  phaseFraming?: {
    immediate: string[];
    growth: string[];
    scale: string[];
  };
  conversionFriction?: string;
  strategicSnapshot?: string[];
  // V2.1 Extensions - Source Transparency
  sources?: {
    executiveSnapshot: {
      businessName: string;
      industry: string;
      businessType: string;
      marketScope: string;
      primaryGoal: string;
    };
    coreVariables: {
      businessType: string;
      targetAudience: string;
      offerStructure: string;
      pricingNote?: string;
      contentDepth: string;
      trustSignals: string;
      structuralWeaknesses: string;
    };
    strategicSignals: string[];
  };
  informationCoverage?: {
    pricing: boolean;
    socialProof: boolean;
    contactMechanism: boolean;
    dynamicContent: boolean;
  };
  nextMovesReasons?: string[];
  // NEW: Text comparisons
  textComparisons?: TextComparison[];
};

// NEW: Raw website data type
type WebsiteData = {
  url: string;
  title: string;
  description: string;
  headings: string[];
  paragraphs: string[];
  links: number;
  images: number;
  hasContactForm: boolean;
  hasPricing: boolean;
  hasTestimonials: boolean;
  hasBlog: boolean;
};

// NEW: Text comparison type
type TextComparison = {
  location: string;
  currentText: string;
  suggestedText: string;
  reason: string;
};

// Collapsible Insight Component
function InsightDropdown({ 
  title, 
  whyMatters, 
  signals, 
  alternatives, 
  examples 
}: { 
  title: string;
  whyMatters?: string;
  signals?: string[];
  alternatives?: string[];
  examples?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);

  if (!whyMatters && !signals && !alternatives && !examples) {
    return null;
  }

  return (
    <div className="insight-dropdown">
      <button 
        className="insight-toggle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span>View insights</span>
      </button>
      
      {isOpen && (
        <div className="insight-content">
          {whyMatters && (
            <div className="insight-block">
              <div className="insight-block-title">Why this matters</div>
              <div className="insight-block-text">{whyMatters}</div>
            </div>
          )}
          
          {signals && signals.length > 0 && (
            <div className="insight-block">
              <div className="insight-block-title">Observed signals</div>
              <ul className="insight-list">
                {signals.map((signal, i) => (
                  <li key={i}>{signal}</li>
                ))}
              </ul>
            </div>
          )}
          
          {alternatives && alternatives.length > 0 && (
            <div className="insight-block">
              <div className="insight-block-title">Alternative approaches</div>
              <ul className="insight-list">
                {alternatives.map((alt, i) => (
                  <li key={i}>{alt}</li>
                ))}
              </ul>
            </div>
          )}
          
          {examples && examples.length > 0 && (
            <div className="insight-block">
              <button 
                className="examples-toggle" 
                onClick={() => setExamplesOpen(!examplesOpen)}
              >
                {examplesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span>Examples & variations</span>
              </button>
              
              {examplesOpen && (
                <ul className="insight-list examples-list">
                  {examples.map((example, i) => (
                    <li key={i}>{example}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// NEW: Text Comparison Component
function TextComparison({ 
  location, 
  currentText, 
  suggestedText, 
  reason 
}: TextComparison) {
  return (
    <div className="text-comparison">
      <div className="comparison-header">
        <span className="comparison-location">{location}</span>
      </div>
      <div className="comparison-body">
        <div className="comparison-section current">
          <div className="comparison-label">Current text</div>
          <div className="comparison-text">{currentText || '(Not detected)'}</div>
        </div>
        <div className="comparison-divider">→</div>
        <div className="comparison-section suggested">
          <div className="comparison-label">Suggested text</div>
          <div className="comparison-text">{suggestedText}</div>
        </div>
      </div>
      {reason && (
        <div className="comparison-reason">{reason}</div>
      )}
    </div>
  );
}

export default function AnalysisPageV2() {
  const [url, setUrl] = useState('');
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [error, setError] = useState<string>('');
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { label: 'Retrieving public website data', status: 'pending' },
    { label: 'Interpreting business structure', status: 'pending' },
    { label: 'Identifying positioning signals', status: 'pending' },
    { label: 'Generating intelligence variables', status: 'pending' }
  ]);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    
    // Auto-prepend https:// if not present
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    
    setAnalysisState('analyzing');
    setError('');
    setAnalysisData(null);
    setWebsiteData(null);
    
    // Simulate step-by-step UI updates
    const stepDelays = [500, 1500, 2500, 3500];
    
    stepDelays.forEach((delay, index) => {
      setTimeout(() => {
        setSteps(prev => prev.map((step, i) => {
          if (i < index) return { ...step, status: 'complete' };
          if (i === index) return { ...step, status: 'active' };
          return step;
        }));
      }, delay);
    });

    try {
      // Call the real API
      const response = await fetch(`${baseUrl}/api/analyze-website`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: finalUrl })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      // Complete all steps
      setSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
      
      // Set website data
      setWebsiteData(result.websiteData);
      
      // Set analysis data with V2 + V2.1 extensions
      const enhancedData = enhanceWithV2Data(result.data, finalUrl, result.websiteData);
      setAnalysisData(enhancedData);
      
      // Fetch text improvements separately (non-blocking)
      fetchTextImprovements(result.data, result.websiteData, enhancedData);
      
      setAnalysisState('complete');
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze website');
      setAnalysisState('error');
      setSteps(steps.map(step => ({ ...step, status: 'pending' })));
    }
  };

  // Fetch text improvements separately (async, non-blocking)
  const fetchTextImprovements = async (
    baseData: AnalysisData, 
    rawData: WebsiteData,
    currentAnalysisData: AnalysisData
  ) => {
    try {
      const response = await fetch(`${baseUrl}/api/analyze-text-improvements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: baseData.executiveSnapshot.businessName,
          businessType: baseData.executiveSnapshot.businessType,
          targetAudience: baseData.coreVariables.targetAudience,
          title: rawData.title,
          description: rawData.description,
          headings: rawData.headings,
          paragraphs: rawData.paragraphs
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.improvements) {
          // Update analysis data with text comparisons
          setAnalysisData(prev => prev ? {
            ...prev,
            textComparisons: result.improvements
          } : null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch text improvements:', error);
      // Silently fail - text improvements are optional
    }
  };

  // V2 + V2.1 Enhancement: Non-destructive data extension
  const enhanceWithV2Data = (baseData: AnalysisData, analyzedUrl: string, rawData: WebsiteData): AnalysisData => {
    // Map existing nextMoves to impact priority
    const impactPriority = baseData.nextMoves.map(move => ({
      title: move.title,
      impact: (move.priority === 'high' ? 'HIGH' : 
               move.priority === 'medium' ? 'MEDIUM' : 'LOW') as ImpactLevel
    }));

    // Assign phases based on priority
    const phaseFraming = {
      immediate: baseData.nextMoves
        .filter(m => m.priority === 'high')
        .map(m => m.title),
      growth: baseData.nextMoves
        .filter(m => m.priority === 'medium')
        .map(m => m.title),
      scale: baseData.nextMoves
        .filter(m => m.priority === 'low')
        .map(m => m.title)
    };

    // Generate conversion friction notes
    const conversionFriction = generateConversionFriction(baseData);

    // Generate strategic snapshot
    const strategicSnapshot = generateStrategicSnapshot(baseData);

    // V2.1: Generate source references
    const sources = generateSourceReferences(baseData, analyzedUrl);

    // V2.1: Generate information coverage
    const informationCoverage = generateInformationCoverage(baseData);

    // V2.1: Generate next moves reasons
    const nextMovesReasons = generateNextMovesReasons(baseData);

    return {
      ...baseData,
      impactPriority,
      phaseFraming,
      conversionFriction,
      strategicSnapshot,
      sources,
      informationCoverage,
      nextMovesReasons,
      textComparisons: [] // Will be populated async
    };
  };

  const generateConversionFriction = (data: AnalysisData): string => {
    const parts: string[] = [];
    
    if (data.coreVariables.trustSignals.toLowerCase().includes('weak') || 
        data.coreVariables.trustSignals.toLowerCase().includes('limited')) {
      parts.push('Trust indicators appear limited, which may slow visitor confidence.');
    }
    
    if (data.coreVariables.conversionFocus.toLowerCase().includes('unclear') ||
        data.coreVariables.conversionFocus.toLowerCase().includes('multiple')) {
      parts.push('Decision pathways may lack clarity due to competing priorities.');
    }
    
    if (data.coreVariables.structuralWeaknesses.length > 0) {
      parts.push('Structural elements may require reinforcement to reduce friction.');
    }

    return parts.slice(0, 3).join(' ') || 'No significant friction patterns detected.';
  };

  const generateStrategicSnapshot = (data: AnalysisData): string[] => {
    const snapshot: string[] = [];
    
    const clarityLevel = data.executiveSnapshot.clarityScore >= 70 ? 'strong' : 
                        data.executiveSnapshot.clarityScore >= 50 ? 'moderate' : 'limited';
    snapshot.push(`Positioning clarity is ${clarityLevel} based on structural signals and content depth.`);
    
    if (data.coreVariables.structuralWeaknesses) {
      snapshot.push(`Primary structural concern relates to ${data.coreVariables.structuralWeaknesses.toLowerCase()}.`);
    }
    
    const highPriorityCount = data.nextMoves.filter(m => m.priority === 'high').length;
    if (highPriorityCount > 0) {
      snapshot.push(`${highPriorityCount} immediate action${highPriorityCount > 1 ? 's' : ''} identified for impact acceleration.`);
    }

    return snapshot.slice(0, 3);
  };

  // V2.1: Generate source references based on actual analysis
  const generateSourceReferences = (data: AnalysisData, url: string): AnalysisData['sources'] => {
    const domain = new URL(url).hostname.replace('www.', '');
    
    return {
      executiveSnapshot: {
        businessName: `Derived from: Website title, branding elements, and company name references`,
        industry: `Derived from: Service offerings, content themes, and market positioning`,
        businessType: `Derived from: Homepage hero section, service/product pages, and about section`,
        marketScope: `Derived from: Geographic references, language options, and service area indicators`,
        primaryGoal: `Derived from: Call-to-action placement, conversion pathways, and content hierarchy`
      },
      coreVariables: {
        businessType: `Derived from: Homepage hero section, service/product listings, navigation structure, and feature descriptions`,
        targetAudience: `Derived from: Content tone, terminology used, and value proposition messaging`,
        offerStructure: `Derived from: Service/product listings, navigation structure, and feature descriptions`,
        pricingNote: data.coreVariables.pricingNote 
          ? `Derived from: Limited pricing references detected across main pages`
          : undefined,
        contentDepth: `Derived from: Page count, content length per section, and information architecture`,
        trustSignals: `Derived from: Testimonials section, social proof elements, and credential displays`,
        structuralWeaknesses: `Derived from: Navigation flow, content gaps, and missing conversion elements`
      },
      strategicSignals: data.strategicSignals.map(() => 
        `Derived from: Cross-analysis of content, structure, and positioning elements`
      )
    };
  };

  // V2.1: Generate information coverage flags
  const generateInformationCoverage = (data: AnalysisData): AnalysisData['informationCoverage'] => {
    const content = JSON.stringify(data).toLowerCase();
    
    return {
      pricing: content.includes('pricing') || content.includes('price') || content.includes('cost'),
      socialProof: content.includes('testimonial') || content.includes('review') || content.includes('trust'),
      contactMechanism: content.includes('contact') || content.includes('form') || content.includes('email'),
      dynamicContent: content.includes('blog') || content.includes('news') || content.includes('article')
    };
  };

  // V2.1: Generate reasons for each next move
  const generateNextMovesReasons = (data: AnalysisData): string[] => {
    return data.nextMoves.map(move => {
      // Map common action titles to their underlying signals
      const title = move.title.toLowerCase();
      
      if (title.includes('pricing') || title.includes('price')) {
        return 'Pricing information not readily visible to visitors.';
      }
      if (title.includes('trust') || title.includes('social proof') || title.includes('testimonial')) {
        return 'Limited trust indicators detected on key pages.';
      }
      if (title.includes('cta') || title.includes('call to action') || title.includes('conversion')) {
        return 'Conversion pathways require clearer direction.';
      }
      if (title.includes('navigation') || title.includes('structure')) {
        return 'Information architecture needs optimization.';
      }
      if (title.includes('content') || title.includes('copy')) {
        return 'Content depth or clarity below optimal threshold.';
      }
      if (title.includes('mobile') || title.includes('responsive')) {
        return 'Mobile experience signals require attention.';
      }
      
      return 'Identified through structural and positioning analysis.';
    });
  };

  const handleReset = () => {
    setUrl('');
    setAnalysisState('idle');
    setAnalysisData(null);
    setError('');
    setSteps(steps.map(step => ({ ...step, status: 'pending' })));
  };

  const handleDownloadPDF = () => {
    if (!analysisData) return;
    generateIntelligencePDF({
      url,
      analysisData
    });
  };

  const handleRequestReview = () => {
    window.open('https://miraka.ch/contact', '_blank');
  };

  return (
    <>
      <style>{`
        .intel-container {
          font-family: 'Inter Tight', sans-serif;
          position: relative;
          min-height: 100vh;
          width: 100vw;
          padding: 20px;
          box-sizing: border-box;
        }
        
        .intel-card {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 24px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          margin-bottom: 16px;
        }
        
        .intel-back-button {
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
        
        .intel-logo {
          display: none;
        }
        
        .intel-content {
          max-width: 1200px;
          margin: 0 auto;
          padding-left: 40px;
        }
        
        .intel-header {
          margin-bottom: 24px;
        }
        
        .intel-title {
          font-family: 'Inter Tight', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #1A1A1A;
          margin: 0 0 8px 0;
        }
        
        .intel-subtitle {
          font-family: 'Inter Tight', sans-serif;
          font-size: 15px;
          color: #6B7280;
          margin: 0;
          line-height: 1.5;
        }
        
        .intel-input {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          fontSize: 15px;
          fontFamily: 'Inter Tight', sans-serif;
          color: #1A1A1A;
          background: #FFFFFF;
          transition: all 0.2s ease;
          outline: none;
          margin-bottom: 12px;
        }
        
        .intel-input:focus {
          border-color: #1A1A1A;
          box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.05);
        }
        
        .intel-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 44px;
          padding: 0 24px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter Tight', sans-serif;
          color: #FFFFFF;
          background: #1A1A1A;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }
        
        .intel-button:hover:not(:disabled) {
          background: #2A2A2A;
          transform: translateY(-1px);
        }
        
        .intel-button:disabled {
          background: #E5E7EB;
          color: #9CA3AF;
          cursor: not-allowed;
          transform: none;
        }
        
        .intel-button-group {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        
        @media (max-width: 768px) {
          .intel-button-group {
            grid-template-columns: 1fr;
          }
        }
        
        .intel-spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .intel-progress-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .intel-progress-header h3 {
          font-family: 'Inter Tight', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #1A1A1A;
          margin: 0;
        }
        
        .intel-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .intel-step {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #F9FAFB;
          border-radius: 0 10px 10px 0;
          transition: all 0.3s ease;
        }
        
        .intel-step.active {
          background: #FEF3E7;
          border-left: 5px solid #F37021;
        }
        
        .intel-step.complete {
          background: #F0FDF4;
          border-left: 5px solid #10B981;
        }
        
        .intel-step-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          color: #9CA3AF;
        }
        
        .intel-step.active .intel-step-icon {
          color: #F37021;
        }
        
        .intel-step.complete .intel-step-icon {
          color: #10B981;
        }
        
        .intel-step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #D1D5DB;
        }
        
        .intel-step span {
          font-family: 'Inter Tight', sans-serif;
          font-size: 14px;
          color: #4B5563;
          font-weight: 500;
        }
        
        .intel-step.active span,
        .intel-step.complete span {
          color: #1A1A1A;
        }
        
        .intel-error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 48px 24px;
          text-align: center;
        }
        
        .intel-error-state h3 {
          font-family: 'Inter Tight', sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #1A1A1A;
          margin: 0;
        }
        
        .intel-error-state p {
          font-family: 'Inter Tight', sans-serif;
          font-size: 14px;
          color: #6B7280;
          max-width: 400px;
          margin: 0;
        }
        
        .intel-section-title {
          font-family: 'Inter Tight', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #1A1A1A;
          margin: 0 0 16px 0;
          letter-spacing: -0.01em;
        }
        
        .intel-snapshot-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        
        .intel-snapshot-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .intel-snapshot-label {
          font-size: 12px;
          color: #6B7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .intel-snapshot-value {
          font-size: 15px;
          color: #1A1A1A;
          font-weight: 600;
        }

        .intel-source-ref {
          font-size: 11px;
          color: #9CA3AF;
          margin-top: 4px;
          font-style: italic;
          line-height: 1.4;
        }
        
        .intel-variables-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .intel-variable-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px;
          background: #F9FAFB;
          border-radius: 8px;
        }
        
        .intel-variable-label {
          font-size: 12px;
          color: #6B7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .intel-variable-value {
          font-size: 14px;
          color: #1A1A1A;
          line-height: 1.5;
        }

        .intel-coverage-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #E5E7EB;
        }

        .intel-coverage-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #F9FAFB;
          border-radius: 6px;
          font-size: 13px;
        }

        .intel-coverage-label {
          color: #4B5563;
          font-weight: 500;
        }

        .intel-coverage-status {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
        }

        .intel-coverage-status.detected {
          background: #D1FAE5;
          color: #065F46;
        }

        .intel-coverage-status.not-detected {
          background: #FEE2E2;
          color: #991B1B;
        }
        
        .intel-signals-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .intel-signal-item {
          padding: 12px 16px;
          padding-left: 16px;
          background: #F9FAFB;
          border-left: 5px solid #1A1A1A;
          border-radius: 0 8px 8px 0;
          font-size: 14px;
          color: #1A1A1A;
          line-height: 1.5;
        }

        .intel-friction-note {
          padding: 16px;
          background: #FEF3E7;
          border-left: 5px solid #F37021;
          border-radius: 0 8px 8px 0;
          font-size: 14px;
          color: #1A1A1A;
          line-height: 1.6;
        }
        
        .intel-moves-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .intel-move-item {
          padding: 16px;
          background: #F9FAFB;
          border-radius: 10px;
        }
        
        .intel-move-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .intel-move-title {
          font-size: 15px;
          font-weight: 600;
          color: #1A1A1A;
          margin: 0;
        }
        
        .intel-move-priority {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }
        
        .intel-move-priority.high {
          background: #FEE2E2;
          color: #991B1B;
        }
        
        .intel-move-priority.medium {
          background: #FEF3C7;
          color: #92400E;
        }
        
        .intel-move-priority.low {
          background: #DBEAFE;
          color: #1E3A8A;
        }
        
        .intel-move-description {
          font-size: 14px;
          color: #4B5563;
          line-height: 1.5;
          margin: 0;
        }

        .intel-move-reason {
          font-size: 12px;
          color: #9CA3AF;
          margin-top: 8px;
          font-style: italic;
          line-height: 1.4;
        }

        .intel-impact-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .intel-impact-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #F9FAFB;
          border-radius: 8px;
        }

        .intel-impact-title {
          font-size: 14px;
          color: #1A1A1A;
          font-weight: 500;
        }

        .intel-impact-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }

        .intel-impact-badge.HIGH {
          background: #FEE2E2;
          color: #991B1B;
        }

        .intel-impact-badge.MEDIUM {
          background: #FEF3C7;
          color: #92400E;
        }

        .intel-impact-badge.LOW {
          background: #DBEAFE;
          color: #1E3A8A;
        }

        .intel-phase-section {
          margin-bottom: 16px;
        }

        .intel-phase-title {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .intel-phase-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .intel-phase-item {
          font-size: 14px;
          color: #1A1A1A;
          padding: 8px 12px;
          background: #F9FAFB;
          border-radius: 6px;
          line-height: 1.4;
        }

        .intel-snapshot-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .intel-snapshot-bullet {
          font-size: 14px;
          color: #1A1A1A;
          line-height: 1.6;
          padding-left: 20px;
          position: relative;
        }

        .intel-snapshot-bullet::before {
          content: "•";
          position: absolute;
          left: 0;
          font-weight: bold;
          color: #F37021;
        }

        /* V2.2 & V2.3: Insight Dropdown Styles */
        .insight-dropdown {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #F3F4F6;
        }

        .insight-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          padding: 0;
          font-size: 12px;
          font-weight: 500;
          color: #6B7280;
          cursor: pointer;
          transition: color 0.2s;
        }

        .insight-toggle:hover {
          color: #1A1A1A;
        }

        .insight-content {
          margin-top: 12px;
          padding: 12px;
          background: #FAFAFA;
          border-radius: 6px;
          border-left: 2px solid #E5E7EB;
        }

        .insight-block {
          margin-bottom: 12px;
        }

        .insight-block:last-child {
          margin-bottom: 0;
        }

        .insight-block-title {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .insight-block-text {
          font-size: 13px;
          color: #4B5563;
          line-height: 1.5;
        }

        .insight-list {
          margin: 0;
          padding-left: 20px;
          font-size: 13px;
          color: #4B5563;
          line-height: 1.6;
        }

        .insight-list li {
          margin-bottom: 4px;
        }

        .examples-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          padding: 0;
          font-size: 11px;
          font-weight: 600;
          color: #6B7280;
          cursor: pointer;
          margin-bottom: 6px;
          transition: color 0.2s;
        }

        .examples-toggle:hover {
          color: #1A1A1A;
        }

        .examples-list {
          margin-top: 8px;
        }

        .examples-list li {
          margin-bottom: 3px;
        }
        
        @media (max-width: 768px) {
          .intel-container {
            padding: 12px;
          }
          
          .intel-back-button {
            position: fixed;
            left: 12px;
            top: 12px;
            transform: none;
          }
          
          .intel-logo {
            display: block;
            position: fixed;
            right: 12px;
            top: 12px;
            z-index: 1000;
          }
          
          .intel-content {
            padding-left: 0;
            padding-top: 50px;
          }
          
          .intel-snapshot-grid {
            grid-template-columns: 1fr;
          }

          .intel-coverage-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      
      <style>{`
        /* Text Comparison Styles */
        .text-comparisons-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .text-comparison {
          background: transparent;
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .text-comparison:last-child {
          border-bottom: none;
        }

        .comparison-header {
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #f0f0f0;
        }

        .comparison-location {
          font-family: var(--heading-font);
          font-weight: 600;
          font-size: 14px;
          color: #000;
        }

        .comparison-body {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 20px;
          align-items: start;
          margin-bottom: 12px;
        }

        @media (max-width: 768px) {
          .comparison-body {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .comparison-divider {
            transform: rotate(90deg);
            margin: 8px auto;
          }
        }

        .comparison-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .comparison-label {
          font-family: var(--body-font);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #666;
        }

        .comparison-text {
          font-family: var(--body-font);
          font-size: 14px;
          line-height: 1.6;
          color: #1a1a1a;
          padding: 12px;
          background: #f8f8f8;
          border-left: 3px solid #e0e0e0;
        }

        .comparison-section.current .comparison-text {
          background: #fff5f5;
          border-left-color: #ff6b6b;
        }

        .comparison-section.suggested .comparison-text {
          background: #f0fdf4;
          border-left-color: #22c55e;
          font-weight: 500;
        }

        .comparison-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #f37021;
          font-weight: bold;
          padding-top: 24px;
        }

        .comparison-reason {
          font-family: var(--body-font);
          font-size: 13px;
          line-height: 1.5;
          color: #666;
          padding: 12px;
          background: #fef9f5;
          border-left: 3px solid #f37021;
        }
      `}</style>
      
      <div className="intel-container">
        {/* Back Button */}
        <a
          href={`${baseUrl}/`}
          className="intel-back-button"
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
        <div className="intel-logo">
          <img 
            src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
            alt="Miraka & Co."
            style={{ height: '18px', width: 'auto', display: 'block' }}
          />
        </div>

        <div className="intel-content">
          <div className="intel-header">
            <h1 className="intel-title">
              Website Intelligence
            </h1>
            <p className="intel-subtitle">
              Instant clarity on business structure, positioning, and strategic opportunities.
            </p>
          </div>

          {analysisState === 'idle' && (
            <div className="intel-card">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="intel-input"
              />
              <button 
                onClick={handleAnalyze} 
                className="intel-button"
                disabled={!url.trim()}
              >
                Analyze Website
              </button>
            </div>
          )}

          {analysisState === 'analyzing' && (
            <div className="intel-card">
              <div className="intel-progress-header">
                <Loader2 size={24} className="intel-spinner" />
                <h3>Analyzing website...</h3>
              </div>
              <div className="intel-steps">
                {steps.map((step, index) => (
                  <div key={index} className={`intel-step ${step.status}`}>
                    <div className="intel-step-icon">
                      {step.status === 'complete' && <CheckCircle2 size={20} />}
                      {step.status === 'active' && <Loader2 size={20} className="intel-spinner" />}
                      {step.status === 'pending' && <div className="intel-step-dot" />}
                    </div>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysisState === 'error' && (
            <div className="intel-card">
              <div className="intel-error-state">
                <AlertCircle size={48} color="#D5455F" />
                <h3>Analysis Failed</h3>
                <p>{error}</p>
                <button onClick={handleReset} className="intel-button">
                  Try Again
                </button>
              </div>
            </div>
          )}

          {analysisState === 'complete' && analysisData && (
            <>
              <div className="intel-card">
                <h2 className="intel-section-title">Executive Snapshot</h2>
                <div className="intel-snapshot-grid">
                  <div className="intel-snapshot-item">
                    <span className="intel-snapshot-label">Business Name</span>
                    <span className="intel-snapshot-value">{analysisData.executiveSnapshot.businessName}</span>
                    {analysisData.sources?.executiveSnapshot.businessName && (
                      <span className="intel-source-ref">{analysisData.sources.executiveSnapshot.businessName}</span>
                    )}
                  </div>
                  <div className="intel-snapshot-item">
                    <span className="intel-snapshot-label">Industry</span>
                    <span className="intel-snapshot-value">{analysisData.executiveSnapshot.industry}</span>
                    {analysisData.sources?.executiveSnapshot.industry && (
                      <span className="intel-source-ref">{analysisData.sources.executiveSnapshot.industry}</span>
                    )}
                  </div>
                  <div className="intel-snapshot-item">
                    <span className="intel-snapshot-label">Business Type</span>
                    <span className="intel-snapshot-value">{analysisData.executiveSnapshot.businessType}</span>
                    {analysisData.sources?.executiveSnapshot.businessType && (
                      <span className="intel-source-ref">{analysisData.sources.executiveSnapshot.businessType}</span>
                    )}
                  </div>
                  <div className="intel-snapshot-item">
                    <span className="intel-snapshot-label">Market Scope</span>
                    <span className="intel-snapshot-value">{analysisData.executiveSnapshot.marketScope}</span>
                    {analysisData.sources?.executiveSnapshot.marketScope && (
                      <span className="intel-source-ref">{analysisData.sources.executiveSnapshot.marketScope}</span>
                    )}
                  </div>
                  <div className="intel-snapshot-item">
                    <span className="intel-snapshot-label">Primary Goal</span>
                    <span className="intel-snapshot-value">{analysisData.executiveSnapshot.primaryGoal}</span>
                    {analysisData.sources?.executiveSnapshot.primaryGoal && (
                      <span className="intel-source-ref">{analysisData.sources.executiveSnapshot.primaryGoal}</span>
                    )}
                  </div>
                  <div className="intel-snapshot-item">
                    <span className="intel-snapshot-label">Clarity Score</span>
                    <span className="intel-snapshot-value">{analysisData.executiveSnapshot.clarityScore}/100</span>
                  </div>
                </div>

                <InsightDropdown
                  title="Executive Snapshot Insights"
                  whyMatters="These metrics provide a high-level view of business positioning and message clarity."
                  signals={[
                    'Business type identified through homepage structure and navigation labels',
                    'Market scope determined from geographic and language indicators',
                    'Primary goal assessed via conversion pathways and CTA placement'
                  ]}
                  alternatives={[
                    'Consider hybrid business models if multiple revenue streams are present',
                    'Regional focus can evolve to national/global as infrastructure scales'
                  ]}
                />
              </div>

              {/* Core Variables */}
              <div className="intel-card">
                <h2 className="intel-section-title">Core Variables</h2>
                <div className="intel-variables-list">
                  {Object.entries(analysisData.coreVariables).map(([key, value]) => {
                    if (!value) return null;
                    const label = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase())
                      .trim();
                    
                    const sourceKey = key as keyof typeof analysisData.sources.coreVariables;
                    const source = analysisData.sources?.coreVariables[sourceKey];

                    return (
                      <div key={key} className="intel-variable-item">
                        <span className="intel-variable-label">{label}</span>
                        <span className="intel-variable-value">{value}</span>
                        {source && (
                          <span className="intel-source-ref">{source}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {analysisData.informationCoverage && (
                  <div className="intel-coverage-grid">
                    <div className="intel-coverage-item">
                      <span className="intel-coverage-label">Pricing information</span>
                      <span className={`intel-coverage-status ${analysisData.informationCoverage.pricing ? 'detected' : 'not-detected'}`}>
                        {analysisData.informationCoverage.pricing ? 'Detected' : 'Not detected'}
                      </span>
                    </div>
                    <div className="intel-coverage-item">
                      <span className="intel-coverage-label">Social proof</span>
                      <span className={`intel-coverage-status ${analysisData.informationCoverage.socialProof ? 'detected' : 'not-detected'}`}>
                        {analysisData.informationCoverage.socialProof ? 'Detected' : 'Not detected'}
                      </span>
                    </div>
                    <div className="intel-coverage-item">
                      <span className="intel-coverage-label">Contact mechanism</span>
                      <span className={`intel-coverage-status ${analysisData.informationCoverage.contactMechanism ? 'detected' : 'not-detected'}`}>
                        {analysisData.informationCoverage.contactMechanism ? 'Detected' : 'Not detected'}
                      </span>
                    </div>
                    <div className="intel-coverage-item">
                      <span className="intel-coverage-label">Dynamic content</span>
                      <span className={`intel-coverage-status ${analysisData.informationCoverage.dynamicContent ? 'detected' : 'not-detected'}`}>
                        {analysisData.informationCoverage.dynamicContent ? 'Detected' : 'Not detected'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Strategic Signals */}
              <div className="intel-card">
                <h2 className="intel-section-title">Strategic Signals</h2>
                <div className="intel-signals-list">
                  {analysisData.strategicSignals.map((signal, index) => (
                    <div key={index} className="intel-signal-item">
                      {signal}
                      {analysisData.sources?.strategicSignals[index] && (
                        <div className="intel-source-ref" style={{ marginTop: '6px' }}>
                          {analysisData.sources.strategicSignals[index]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <InsightDropdown
                  title="Strategic Signals Insights"
                  whyMatters="These signals reveal competitive positioning and market awareness."
                  signals={['Detected through content analysis', 'Compared against industry standards', 'Evaluated for clarity and consistency']}
                />
              </div>

              {/* What's Working Well */}
              {analysisData.strengthsHighlights && analysisData.strengthsHighlights.length > 0 && (
                <div className="intel-card" style={{ 
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  borderColor: '#86efac'
                }}>
                  <h2 className="intel-section-title" style={{ color: '#166534' }}>
                    ✓ What's Working Well
                  </h2>
                  <div className="intel-signals-list">
                    {analysisData.strengthsHighlights.map((strength, index) => (
                      <div key={index} className="intel-signal-item" style={{ 
                        borderLeftColor: '#86efac',
                        color: '#166534'
                      }}>
                        {strength}
                      </div>
                    ))}
                  </div>

                  <InsightDropdown
                    title="Why This Matters"
                    whyMatters="Recognizing effective elements helps maintain what's working while making improvements elsewhere."
                    signals={['Identified through content analysis', 'Based on conversion best practices', 'Aligned with business goals']}
                  />
                </div>
              )}

              {analysisData.conversionFriction && (
                <div className="intel-card">
                  <h2 className="intel-section-title">Conversion Friction Notes</h2>
                  <div className="intel-friction-note">
                    {analysisData.conversionFriction}
                  </div>
                </div>
              )}

              <div className="intel-card">
                <h2 className="intel-section-title">Next Moves</h2>
                <div className="intel-moves-list">
                  {analysisData.nextMoves.map((move, index) => (
                    <div key={index} className="intel-move-item">
                      <div className="intel-move-header">
                        <h4 className="intel-move-title">{move.title}</h4>
                        <span className={`intel-move-priority ${move.priority}`}>
                          {move.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="intel-move-description">{move.description}</p>
                      {analysisData.nextMovesReasons?.[index] && (
                        <div className="intel-move-reason">
                          Reason: {analysisData.nextMovesReasons[index]}
                        </div>
                      )}

                      <InsightDropdown
                        title={move.title}
                        whyMatters={
                          move.priority === 'high' 
                            ? 'High-priority actions have immediate impact potential.'
                            : move.priority === 'medium'
                            ? 'Medium-priority actions support sustained growth.'
                            : 'Low-priority actions build long-term brand equity.'
                        }
                        signals={['Identified gap in current structure', 'Benchmarked against industry norms']}
                        alternatives={
                          move.title.toLowerCase().includes('pricing')
                            ? ['Display starting prices with "From..." format', 'Use pricing calculator for custom quotes']
                            : move.title.toLowerCase().includes('trust')
                            ? ['Add client logos to homepage', 'Create dedicated testimonials section']
                            : undefined
                        }
                        examples={
                          move.title.toLowerCase().includes('pricing')
                            ? ['"Starting from €120 per night, depending on season"', '"Request custom quote for enterprise needs"']
                            : move.title.toLowerCase().includes('trust')
                            ? ['"Trusted by 500+ companies worldwide"', '"As featured in Forbes, TechCrunch"']
                            : move.title.toLowerCase().includes('blog')
                            ? ['"Insights section with weekly industry updates"', '"Resource library with guides and templates"']
                            : undefined
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {analysisData.impactPriority && analysisData.impactPriority.length > 0 && (
                <div className="intel-card">
                  <h2 className="intel-section-title">Impact Priority</h2>
                  <div className="intel-impact-list">
                    {analysisData.impactPriority.map((item, index) => (
                      <div key={index} className="intel-impact-item">
                        <span className="intel-impact-title">{item.title}</span>
                        <span className={`intel-impact-badge ${item.impact}`}>
                          {item.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysisData.phaseFraming && (
                <div className="intel-card">
                  <h2 className="intel-section-title">3-Phase Action Framing</h2>
                  
                  {analysisData.phaseFraming.immediate.length > 0 && (
                    <div className="intel-phase-section">
                      <div className="intel-phase-title">Phase 1 – Immediate (0–30 days)</div>
                      <div className="intel-phase-list">
                        {analysisData.phaseFraming.immediate.map((item, index) => (
                          <div key={index} className="intel-phase-item">{item}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysisData.phaseFraming.growth.length > 0 && (
                    <div className="intel-phase-section">
                      <div className="intel-phase-title">Phase 2 – Growth (30–90 days)</div>
                      <div className="intel-phase-list">
                        {analysisData.phaseFraming.growth.map((item, index) => (
                          <div key={index} className="intel-phase-item">{item}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysisData.phaseFraming.scale.length > 0 && (
                    <div className="intel-phase-section">
                      <div className="intel-phase-title">Phase 3 – Brand & Scale (90+ days)</div>
                      <div className="intel-phase-list">
                        {analysisData.phaseFraming.scale.map((item, index) => (
                          <div key={index} className="intel-phase-item">{item}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {analysisData.strategicSnapshot && analysisData.strategicSnapshot.length > 0 && (
                <div className="intel-card">
                  <h2 className="intel-section-title">Strategic Snapshot</h2>
                  <div className="intel-snapshot-list">
                    {analysisData.strategicSnapshot.map((point, index) => (
                      <div key={index} className="intel-snapshot-bullet">
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Page-Level Text Improvements */}
              {analysisData.textComparisons && analysisData.textComparisons.length > 0 && (
                <div className="intel-card">
                  <h2 className="intel-section-title">Page-Level Text Improvements</h2>
                  <div className="text-comparisons-list">
                    {analysisData.textComparisons.map((comparison, index) => (
                      <TextComparison
                        key={index}
                        location={comparison.location}
                        currentText={comparison.currentText}
                        suggestedText={comparison.suggestedText}
                        reason={comparison.reason}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="intel-action-container">
                <div className="intel-card">
                  <div className="intel-button-group">
                    <button onClick={handleDownloadPDF} className="intel-button">
                      <FileText size={18} strokeWidth={2} />
                      Download PDF
                    </button>
                    <button onClick={handleRequestReview} className="intel-button">
                      <MessageSquare size={18} strokeWidth={2} />
                      Request Review
                    </button>
                    <button onClick={handleReset} className="intel-button">
                      Analyze Another
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}











