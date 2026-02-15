import { useState } from 'react';
import { ArrowLeft, Download, MessageSquare, CheckCircle2, Loader2, AlertCircle, FileText } from 'lucide-react';
import { baseUrl } from '../lib/base-url';
import '../styles/global.css';

type AnalysisStep = {
  label: string;
  status: 'pending' | 'active' | 'complete';
};

type AnalysisState = 'idle' | 'analyzing' | 'complete' | 'error';

type AnalysisData = {
  executiveSnapshot: {
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
  nextMoves: Array<{
    title: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }>;
};

export default function AnalysisPage() {
  const [url, setUrl] = useState('');
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
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
      
      // Set analysis data
      setAnalysisData(result.data);
      setAnalysisState('complete');
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze website');
      setAnalysisState('error');
      setSteps(steps.map(step => ({ ...step, status: 'pending' })));
    }
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

    // Build table rows for PDF
    const tableRows: string[] = [];

    // Executive Snapshot
    tableRows.push(`
      <tr>
        <td colspan="2" style="font-weight: bold; padding-top: 12px; font-size: 11px;">EXECUTIVE SNAPSHOT</td>
      </tr>
      <tr><td>Business Type</td><td>${analysisData.executiveSnapshot.businessType}</td></tr>
      <tr><td>Market Scope</td><td>${analysisData.executiveSnapshot.marketScope}</td></tr>
      <tr><td>Primary Goal</td><td>${analysisData.executiveSnapshot.primaryGoal}</td></tr>
      <tr><td>Clarity Score</td><td>${analysisData.executiveSnapshot.clarityScore}/100</td></tr>
    `);

    // Core Variables
    tableRows.push(`
      <tr>
        <td colspan="2" style="font-weight: bold; padding-top: 12px; font-size: 11px;">CORE VARIABLES</td>
      </tr>
      <tr><td>Business Type</td><td>${analysisData.coreVariables.businessType}</td></tr>
      <tr><td>Target Audience</td><td>${analysisData.coreVariables.targetAudience}</td></tr>
      <tr><td>Offer Structure</td><td>${analysisData.coreVariables.offerStructure}</td></tr>
      ${analysisData.coreVariables.pricingNote ? `<tr><td>Pricing Note</td><td>${analysisData.coreVariables.pricingNote}</td></tr>` : ''}
      <tr><td>Pricing Positioning</td><td>${analysisData.coreVariables.pricingPositioning}</td></tr>
      <tr><td>Conversion Focus</td><td>${analysisData.coreVariables.conversionFocus}</td></tr>
      <tr><td>Content Depth</td><td>${analysisData.coreVariables.contentDepth}</td></tr>
      <tr><td>Trust Signals</td><td>${analysisData.coreVariables.trustSignals}</td></tr>
      <tr><td>Structural Weaknesses</td><td>${analysisData.coreVariables.structuralWeaknesses}</td></tr>
    `);

    // Strategic Signals
    tableRows.push(`
      <tr>
        <td colspan="2" style="font-weight: bold; padding-top: 12px; font-size: 11px;">STRATEGIC SIGNALS</td>
      </tr>
    `);
    analysisData.strategicSignals.forEach((signal, index) => {
      tableRows.push(`<tr><td>${index + 1}</td><td>${signal}</td></tr>`);
    });

    // Next Moves
    tableRows.push(`
      <tr>
        <td colspan="2" style="font-weight: bold; padding-top: 12px; font-size: 11px;">NEXT MOVES</td>
      </tr>
    `);
    analysisData.nextMoves.forEach((move) => {
      tableRows.push(`
        <tr>
          <td style="vertical-align: top;">${move.title} <span style="font-size: 9px; text-transform: uppercase; color: #666;">[${move.priority}]</span></td>
          <td>${move.description}</td>
        </tr>
      `);
    });

    const tableContent = `
      <table>
        <thead>
          <tr>
            <th style="width: 35%;">Variable</th>
            <th style="width: 65%;">Value</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows.join('')}
        </tbody>
      </table>
    `;

    const now = new Date();
    const year = now.getFullYear();
    const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const pdfTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Business Data Export – Miraka & Co</title>

  <style>
  
    /* ===============================
       PAGE SETUP – A4 SYMMETRIC
       =============================== */
    @page {
      size: A4;
      margin: 25mm 20mm 25mm 20mm; /* TOP | RIGHT | BOTTOM | LEFT */
    }

    body {
      margin: 0;
      padding: 0;
      font-family: Helvetica, Arial, sans-serif;
      font-size: 11px;
      color: #111;
      line-height: 1.5;
    }

    /* ===============================
       HEADER
       =============================== */
    header {
      width: 100%;
      text-align: center;
      margin-bottom: 30px;
    }

    header img {
      width: 4cm;
      max-width: 4cm;
      height: auto;
      display: block;
      margin: 0 auto 12px auto;
    }

    header h1 {
      font-size: 14px;
      font-weight: normal;
      margin: 0;
      letter-spacing: 0.5px;
    }

    /* ===============================
       TABLE CONTENT
       =============================== */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      page-break-inside: auto;
    }

    thead {
      display: table-header-group;
    }

    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }

    th {
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      border-bottom: 1px solid #000;
      padding: 6px 4px;
    }

    td {
      border-bottom: 1px solid #e5e5e5;
      padding: 6px 4px;
      vertical-align: top;
    }

    /* ===============================
       FOOTER – SYMMETRIC POSITION
       =============================== */
    footer {
      position: fixed;
      bottom: 12.5mm; /* exact center of bottom margin */
      left: 20mm;
      right: 20mm;
      font-size: 8.5px;
      color: #666;
      line-height: 1.4;
    }

    .footer-block {
      margin-top: 6px;
    }

    .footer-title {
      font-weight: bold;
      color: #333;
      margin-bottom: 2px;
    }
  </style>
</head>

<body>

  <!-- ===============================
       HEADER
       =============================== -->
  <header>
    <img
      src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
      alt="Miraka & Co"
    />
    <h1>Business Data Overview</h1>
  </header>

  <!-- ===============================
       DYNAMIC CONTENT
       =============================== -->
  ${tableContent}

  <!-- ===============================
       FOOTER
       =============================== -->
  <footer>

    <div class="footer-block">
      <div class="footer-title">Company Information</div>
      Miraka & Co GmbH<br />
      Elisabethenstrasse 41, CH-4051 Basel, Switzerland<br />
      www.miraka.ch · office@miraka.ch
    </div>

    <div class="footer-block">
      <div class="footer-title">Data Source & Information Disclaimer</div>
      This document contains business-related information retrieved from publicly available sources at the time of generation. Miraka & Co GmbH does not guarantee accuracy, completeness, or continued availability of the data.
    </div>

    <div class="footer-block">
      <div class="footer-title">Non-Solicitation & Usage Restriction Clause</div>
      The information in this document must not be used for unsolicited communication, advertising, or direct marketing. Usage must comply with GDPR / DSGVO and Swiss data protection law.
    </div>

    <div class="footer-block">
      <div class="footer-title">Data Protection & GDPR / DSGVO Compliance</div>
      This document does not constitute a database or lead list. No personal data is intentionally processed. Responsibility for lawful handling lies with the recipient.
    </div>

    <div class="footer-block">
      <div class="footer-title">Limitation of Liability</div>
      Miraka & Co GmbH shall not be liable for any damages arising from use or interpretation of this document.
    </div>

    <div class="footer-block">
      © ${year} Miraka & Co GmbH · Generated on ${date}
    </div>

  </footer>

</body>
</html>`;

    // Create a blob and trigger download
    const blob = new Blob([pdfTemplate], { type: 'text/html' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `website-intelligence-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
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
        
        .intel-card {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 24px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          margin-bottom: 16px;
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
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .intel-snapshot-value {
          font-size: 15px;
          color: #1A1A1A;
          font-weight: 600;
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
            <h1 className="intel-title">Website Intelligence</h1>
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
                    <span className="intel-snapshot-label">Business Type</span>
                    <span className="intel-snapshot-value">{analysisData.executiveSnapshot.businessType}</span>
                  </div>
                  <div className="intel-snapshot-item">
                    <span className="intel-snapshot-label">Market Scope</span>
                    <span className="intel-snapshot-value">{analysisData.executiveSnapshot.marketScope}</span>
                  </div>
                  <div className="intel-snapshot-item">
                    <span className="intel-snapshot-label">Primary Goal</span>
                    <span className="intel-snapshot-value">{analysisData.executiveSnapshot.primaryGoal}</span>
                  </div>
                  <div className="intel-snapshot-item">
                    <span className="intel-snapshot-label">Clarity Score</span>
                    <span className="intel-snapshot-value">{analysisData.executiveSnapshot.clarityScore}/100</span>
                  </div>
                </div>
              </div>

              <div className="intel-card">
                <h2 className="intel-section-title">Core Variables</h2>
                <div className="intel-variables-list">
                  <div className="intel-variable-item">
                    <span className="intel-variable-label">Business Type</span>
                    <span className="intel-variable-value">{analysisData.coreVariables.businessType}</span>
                  </div>
                  <div className="intel-variable-item">
                    <span className="intel-variable-label">Target Audience</span>
                    <span className="intel-variable-value">{analysisData.coreVariables.targetAudience}</span>
                  </div>
                  <div className="intel-variable-item">
                    <span className="intel-variable-label">Offer Structure</span>
                    <span className="intel-variable-value">{analysisData.coreVariables.offerStructure}</span>
                  </div>
                  {analysisData.coreVariables.pricingNote && (
                    <div className="intel-variable-item">
                      <span className="intel-variable-label">Pricing Note</span>
                      <span className="intel-variable-value">{analysisData.coreVariables.pricingNote}</span>
                    </div>
                  )}
                  <div className="intel-variable-item">
                    <span className="intel-variable-label">Pricing Positioning</span>
                    <span className="intel-variable-value">{analysisData.coreVariables.pricingPositioning}</span>
                  </div>
                  <div className="intel-variable-item">
                    <span className="intel-variable-label">Conversion Focus</span>
                    <span className="intel-variable-value">{analysisData.coreVariables.conversionFocus}</span>
                  </div>
                  <div className="intel-variable-item">
                    <span className="intel-variable-label">Content Depth</span>
                    <span className="intel-variable-value">{analysisData.coreVariables.contentDepth}</span>
                  </div>
                  <div className="intel-variable-item">
                    <span className="intel-variable-label">Trust Signals</span>
                    <span className="intel-variable-value">{analysisData.coreVariables.trustSignals}</span>
                  </div>
                  <div className="intel-variable-item">
                    <span className="intel-variable-label">Structural Weaknesses</span>
                    <span className="intel-variable-value">{analysisData.coreVariables.structuralWeaknesses}</span>
                  </div>
                </div>
              </div>

              <div className="intel-card">
                <h2 className="intel-section-title">Strategic Signals</h2>
                <div className="intel-signals-list">
                  {analysisData.strategicSignals.map((signal, index) => (
                    <div key={index} className="intel-signal-item">
                      {signal}
                    </div>
                  ))}
                </div>
              </div>

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
                    </div>
                  ))}
                </div>
              </div>

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
            </>
          )}
        </div>
      </div>
    </>
  );
}

