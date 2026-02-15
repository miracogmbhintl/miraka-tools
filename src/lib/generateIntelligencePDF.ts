import type { AnalysisData } from '../components/WebsiteIntelligenceToolV2';

interface PDFGenerationOptions {
  url: string;
  analysisData: AnalysisData;
}

export function generateIntelligencePDF({ url, analysisData }: PDFGenerationOptions): void {
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const shortDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Build Executive Snapshot rows
  const snapshotRows = `
    <tr><td>Business Name</td><td>${analysisData.executiveSnapshot.businessName || 'Not detected'}</td></tr>
    <tr><td>Industry</td><td>${analysisData.executiveSnapshot.industry || 'Not detected'}</td></tr>
    <tr><td>Business Type</td><td>${analysisData.executiveSnapshot.businessType || 'Not detected'}</td></tr>
    <tr><td>Market Scope</td><td>${analysisData.executiveSnapshot.marketScope || 'Not detected'}</td></tr>
    <tr><td>Primary Goal</td><td>${analysisData.executiveSnapshot.primaryGoal || 'Not detected'}</td></tr>
    <tr><td>Clarity Score</td><td>${analysisData.executiveSnapshot.clarityScore || 0}/100</td></tr>
  `;

  // Build Core Variables rows
  const coreVariablesRows = `
    <tr><td>Business Type</td><td>${analysisData.coreVariables.businessType || 'Not detected'}</td></tr>
    <tr><td>Target Audience</td><td>${analysisData.coreVariables.targetAudience || 'Not detected'}</td></tr>
    <tr><td>Offer Structure</td><td>${analysisData.coreVariables.offerStructure || 'Not detected'}</td></tr>
    ${analysisData.coreVariables.pricingNote ? `<tr><td>Pricing Note</td><td>${analysisData.coreVariables.pricingNote}</td></tr>` : ''}
    <tr><td>Pricing Positioning</td><td>${analysisData.coreVariables.pricingPositioning || 'Not detected'}</td></tr>
    <tr><td>Conversion Focus</td><td>${analysisData.coreVariables.conversionFocus || 'Not detected'}</td></tr>
    <tr><td>Content Depth</td><td>${analysisData.coreVariables.contentDepth || 'Not detected'}</td></tr>
    <tr><td>Trust Signals</td><td>${analysisData.coreVariables.trustSignals || 'Not detected'}</td></tr>
    <tr><td>Structural Weaknesses</td><td>${analysisData.coreVariables.structuralWeaknesses || 'Not detected'}</td></tr>
  `;

  // Build Strategic Signals rows
  const signalsRows = analysisData.strategicSignals && analysisData.strategicSignals.length > 0
    ? analysisData.strategicSignals.map((signal, index) => `
        <tr>
          <td style="font-weight:500">${index + 1}</td>
          <td>${signal}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="2" style="text-align:center;color:#666">No strategic signals detected</td></tr>';

  // Build Next Moves rows
  const nextMovesRows = analysisData.nextMoves && analysisData.nextMoves.length > 0
    ? analysisData.nextMoves.map(move => `
        <tr>
          <td style="font-weight:500;vertical-align:top">${move.title}</td>
          <td style="vertical-align:top;text-transform:uppercase;font-size:9px;color:#666">${move.priority}</td>
          <td style="vertical-align:top">${move.description}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="3" style="text-align:center;color:#666">No next moves identified</td></tr>';

  // Build Text Improvements section
  let textImprovementsSection = '';
  if (analysisData.textComparisons && analysisData.textComparisons.length > 0) {
    const improvementsRows = analysisData.textComparisons.map(comparison => `
      <tr>
        <td style="font-weight:500;vertical-align:top">${comparison.location}</td>
        <td style="vertical-align:top">${comparison.currentText || '(Not detected)'}</td>
        <td style="vertical-align:top">${comparison.suggestedText}</td>
        <td style="vertical-align:top;color:#555">${comparison.reason}</td>
      </tr>
    `).join('');

    textImprovementsSection = `
      <section class="section">
        <div class="section-title">Page-Level Text Improvements</div>
        <table>
          <thead>
            <tr>
              <th style="width:20%">Location</th>
              <th style="width:27%">Current Text</th>
              <th style="width:27%">Suggested Text</th>
              <th style="width:26%">Reasoning</th>
            </tr>
          </thead>
          <tbody>
            ${improvementsRows}
          </tbody>
        </table>
      </section>
    `;
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Business Intelligence – Executive Overview</title>

<style>
/* ===============================
   PRINT SETUP (REAL PDF)
   =============================== */
@page {
  size: A4;
  margin: 25mm 20mm 25mm 20mm;
}

/* ===============================
   BASE
   =============================== */
body {
  margin: 0;
  padding: 0;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 11px;
  line-height: 1.55;
  color: #111;
  background: #fff;
}

/* ===============================
   PREVIEW FRAME (BROWSER ONLY)
   =============================== */
.preview-frame {
  padding: 10mm 15mm;
  box-sizing: border-box;
}

/* Remove preview padding when printing */
@media print {
  .preview-frame {
    padding: 0;
  }
}

/* ===============================
   WATERMARK
   =============================== */
.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  font-size: 48px;
  letter-spacing: 4px;
  color: rgba(0,0,0,0.04);
  pointer-events: none;
}

/* ===============================
   COVER
   =============================== */
.cover {
  text-align: center;
  margin-bottom: 36px;
}

.cover img {
  width: 4cm;
  margin-bottom: 18px;
}

.cover h1 {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.4px;
  margin: 0 0 6px 0;
}

.cover .meta {
  font-size: 9px;
  color: #666;
}

/* ===============================
   SECTIONS
   =============================== */
.section {
  margin-top: 26px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  border-bottom: 1px solid #000;
  padding-bottom: 4px;
  margin-bottom: 12px;
}

/* ===============================
   TABLES
   =============================== */
table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  display: table-header-group;
}

tr {
  page-break-inside: avoid;
}

th {
  text-align: left;
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-bottom: 1px solid #000;
  padding: 6px 4px;
}

td {
  padding: 6px 4px;
  border-bottom: 1px solid #e5e5e5;
}

/* ===============================
   FOOTER
   =============================== */
footer {
  margin-top: 32mm;
  font-size: 8.5px;
  color: #666;
  line-height: 1.4;
}

.footer-block {
  margin-top: 6px;
}

.footer-title {
  font-weight: 600;
  color: #333;
}
</style>
</head>

<body>

<div class="watermark">CONFIDENTIAL</div>

<div class="preview-frame">

  <!-- COVER -->
  <header class="cover">
    <img
      src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png"
      alt="Miraka & Co"
    />
    <h1>Business Intelligence – Executive Overview</h1>
    <div class="meta">
      Confidential Strategic Brief<br>
      Generated on ${currentDate}
    </div>
  </header>

  <!-- EXECUTIVE SNAPSHOT -->
  <section class="section">
    <div class="section-title">Executive Snapshot</div>

    <table>
      <thead>
        <tr>
          <th style="width:35%">Variable</th>
          <th style="width:65%">Value</th>
        </tr>
      </thead>
      <tbody>
        ${snapshotRows}
      </tbody>
    </table>
  </section>

  <!-- CORE VARIABLES -->
  <section class="section">
    <div class="section-title">Core Variables</div>

    <table>
      <thead>
        <tr>
          <th style="width:35%">Variable</th>
          <th style="width:65%">Value</th>
        </tr>
      </thead>
      <tbody>
        ${coreVariablesRows}
      </tbody>
    </table>
  </section>

  <!-- STRATEGIC SIGNALS -->
  <section class="section">
    <div class="section-title">Strategic Signals</div>

    <table>
      <thead>
        <tr>
          <th style="width:10%">#</th>
          <th style="width:90%">Signal</th>
        </tr>
      </thead>
      <tbody>
        ${signalsRows}
      </tbody>
    </table>
  </section>

  <!-- NEXT MOVES -->
  <section class="section">
    <div class="section-title">Next Moves</div>

    <table>
      <thead>
        <tr>
          <th style="width:25%">Title</th>
          <th style="width:15%">Priority</th>
          <th style="width:60%">Description</th>
        </tr>
      </thead>
      <tbody>
        ${nextMovesRows}
      </tbody>
    </table>
  </section>

  <!-- TEXT IMPROVEMENTS (if available) -->
  ${textImprovementsSection}

  <!-- FOOTER -->
  <footer>

    <div class="footer-block">
      <div class="footer-title">Company Information</div>
      Miraka & Co GmbH<br />
      Elisabethenstrasse 41, CH-4051 Basel, Switzerland<br />
      www.miraka.ch · office@miraka.ch
    </div>

    <div class="footer-block">
      <div class="footer-title">Data Source & Information Disclaimer</div>
      This document contains business-related information retrieved from publicly available sources at the time of generation.
      Miraka & Co GmbH does not guarantee accuracy, completeness, or continued availability of the data.
    </div>

    <div class="footer-block">
      <div class="footer-title">Non-Solicitation & Usage Restriction Clause</div>
      The information in this document must not be used for unsolicited communication, advertising, or direct marketing.
      Usage must comply with GDPR / DSGVO and Swiss data protection law.
    </div>

    <div class="footer-block">
      <div class="footer-title">Data Protection & GDPR / DSGVO Compliance</div>
      This document does not constitute a database or lead list.
      No personal data is intentionally processed.
      Responsibility for lawful handling lies with the recipient.
    </div>

    <div class="footer-block">
      <div class="footer-title">Limitation of Liability</div>
      Miraka & Co GmbH shall not be liable for any damages arising from use or interpretation of this document.
    </div>

    <div class="footer-block">
      © 2026 Miraka & Co GmbH · Generated on ${shortDate}
    </div>

  </footer>

</div>

<script>
// Auto-trigger print dialog when page loads
window.onload = function() {
  window.print();
};
</script>

</body>
</html>`;

  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}


