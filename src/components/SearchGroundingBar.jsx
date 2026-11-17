import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';

export default function SearchGroundingBar({ sources = [] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="search-grounding-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <Globe size={14} color="#7cacf8" />
        <span style={{ fontWeight: 500 }}>Grounded with Google Search Sources</span>
      </div>
      <div className="search-sources-list">
        {sources.map((src, idx) => (
          <a 
            key={idx} 
            href={src.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="source-chip"
            title={src.url}
          >
            <span>{idx + 1}.</span>
            <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {src.title}
            </span>
            <ExternalLink size={11} style={{ opacity: 0.7 }} />
          </a>
        ))}
      </div>
    </div>
  );
}
