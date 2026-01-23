import React from 'react';
import QRCodeTool from './QRCodeTool';
import HTMLPreviewTool from './HTMLPreviewTool';
import ColorPickerTool from './ColorPickerTool';

export default function ToolsPage() {
  return (
    <div className="tools-page-content">
      {/* Page Intro */}
      <section className="tools-intro">
        <h1 className="tools-intro-title">Tools</h1>
        <p className="tools-intro-subtitle">Simple utilities for everyday digital work.</p>
      </section>

      {/* Tool Sections */}
      <main className="tools-main">
        <QRCodeTool />
        <HTMLPreviewTool />
        <ColorPickerTool />
      </main>
    </div>
  );
}
