import React, { useState } from 'react';
import { Copy, Check, Play, Code2, Download } from 'lucide-react';

export default function CodeBlock({ language = 'code', code = '', onRunCode }) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleDownload = () => {
    try {
      const extMap = {
        html: 'html',
        javascript: 'js',
        js: 'js',
        jsx: 'jsx',
        typescript: 'ts',
        ts: 'ts',
        python: 'py',
        py: 'py',
        css: 'css',
        json: 'json',
        svg: 'svg',
        sql: 'sql',
        cpp: 'cpp',
        c: 'c',
        java: 'java'
      };
      const cleanLang = (language || 'code').toLowerCase().trim();
      const ext = extMap[cleanLang] || 'txt';
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xtreme-code-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (e) {
      console.error('Failed to download code', e);
    }
  };

  const isExecutable = ['html', 'javascript', 'js', 'css', 'svg'].includes((language || '').toLowerCase()) || 
                       code.includes('<!DOCTYPE html>') || 
                       code.includes('<canvas') ||
                       code.includes('<html>');

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Code2 size={14} />
          <span style={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '11.5px', letterSpacing: '0.04em' }}>
            {language || 'code'}
          </span>
        </div>
        <div className="code-block-actions">
          {isExecutable && onRunCode && (
            <button 
              className="code-action-pill live-run-btn" 
              onClick={() => onRunCode(code, language)}
              title="Run code in interactive Live Canvas sandbox"
            >
              <Play size={12} fill="currentColor" />
              <span>Run in Live Canvas</span>
            </button>
          )}

          <button 
            className="code-action-pill" 
            onClick={handleDownload}
            title="Download code source file"
          >
            {downloaded ? (
              <>
                <Check size={12} color="#81c995" />
                <span style={{ color: '#81c995' }}>Saved!</span>
              </>
            ) : (
              <>
                <Download size={12} />
                <span>Download</span>
              </>
            )}
          </button>

          <button 
            className="code-action-pill" 
            onClick={handleCopy}
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check size={12} color="#81c995" />
                <span style={{ color: '#81c995' }}>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="code-pre-wrap">
        <code>{code}</code>
      </pre>
    </div>
  );
}
