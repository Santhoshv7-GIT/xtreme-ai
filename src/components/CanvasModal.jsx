import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Maximize2, Minimize2, Code, ExternalLink, Play } from 'lucide-react';

export default function CanvasModal({ isOpen, onClose, code = '', language = 'html' }) {
  const [key, setKey] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  // Prepare executable HTML page from the code snippet
  const generatePreviewHtml = () => {
    let cleanCode = code;

    // If it's already a full HTML document
    if (cleanCode.includes('<!DOCTYPE html>') || cleanCode.includes('<html>')) {
      return cleanCode;
    }

    // If it's pure JavaScript
    if (language === 'javascript' || language === 'js') {
      return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #111;
      color: #fff;
    }
    #console {
      background: #1a1a1a;
      border: 1px solid #333;
      padding: 12px;
      border-radius: 8px;
      font-family: monospace;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <h3>JavaScript Execution Output:</h3>
  <div id="console"></div>
  <script>
    const output = document.getElementById('console');
    const log = (...args) => {
      output.innerText += args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' ') + '\\n';
    };
    console.log = log;
    try {
      ${cleanCode}
    } catch (e) {
      log('Error:', e.message);
    }
  </script>
</body>
</html>`;
    }

    // If it's HTML snippet or SVG
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #ffffff;
      color: #111827;
    }
  </style>
</head>
<body>
  ${cleanCode}
</body>
</html>`;
  };

  const handleRefresh = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="modal-overlay">
      <div 
        className="canvas-modal-content"
        style={{
          width: isFullscreen ? '98vw' : '90vw',
          height: isFullscreen ? '96vh' : '85vh',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Canvas Header */}
        <div className="modal-header" style={{ background: 'var(--bg-sidebar)', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              background: '#4285F4', 
              color: '#fff', 
              padding: '2px 8px', 
              borderRadius: '6px', 
              fontSize: '11px', 
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              Live Canvas Sandbox
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Interactive Execution Environment
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="icon-btn" 
              onClick={() => setShowCode(!showCode)} 
              title={showCode ? 'View Rendered Preview' : 'View Raw Source Code'}
            >
              <Code size={18} />
            </button>
            <button 
              className="icon-btn" 
              onClick={handleRefresh} 
              title="Reload sandbox"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              className="icon-btn" 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button 
              className="icon-btn" 
              onClick={onClose} 
              title="Close Sandbox"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Canvas Body */}
        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
          {showCode ? (
            <div style={{ flex: 1, background: '#0d0f18', padding: '16px', overflow: 'auto' }}>
              <pre style={{ margin: 0, color: '#f1f1f1', fontFamily: 'var(--font-mono)', fontSize: '13.5px', lineHeight: 1.5 }}>
                <code>{code}</code>
              </pre>
            </div>
          ) : (
            <iframe
              key={key}
              title="XTREME AI Live Canvas Sandbox"
              className="canvas-iframe"
              srcDoc={generatePreviewHtml()}
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            />
          )}
        </div>
      </div>
    </div>
  );
}
