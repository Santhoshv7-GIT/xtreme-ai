import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, FileText, CheckCircle2, ExternalLink } from 'lucide-react';

export default function RagCitationsBar({ citations = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedChunk, setSelectedChunk] = useState(null);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="rag-citations-container">
      <div 
        className="rag-citations-header"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Click to view verified knowledge base sources"
      >
        <div className="rag-header-left">
          <BookOpen size={14} className="rag-icon" />
          <span className="rag-title">
            Grounded in Knowledge Base ({citations.length} {citations.length === 1 ? 'source' : 'sources'} cited)
          </span>
        </div>
        <div className="rag-header-right">
          <span className="rag-badge">RAG ACTIVE</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Pill summary row */}
      <div className="rag-pills-row">
        {citations.map((c, idx) => (
          <button
            key={idx}
            className={`rag-source-pill ${selectedChunk?.id === c.id ? 'active' : ''}`}
            onClick={() => {
              setIsExpanded(true);
              setSelectedChunk(selectedChunk?.id === c.id ? null : c);
            }}
            title={`Source: ${c.docTitle} • Relevance: ${c.relevancePercent}%`}
          >
            <FileText size={12} />
            <span className="rag-pill-name">{c.docTitle}</span>
            <span className="rag-pill-score">{c.relevancePercent}%</span>
          </button>
        ))}
      </div>

      {/* Expanded Sources List & Chunk Viewer */}
      {isExpanded && (
        <div className="rag-expanded-panel">
          <div className="rag-sources-list">
            {citations.map((c, idx) => (
              <div 
                key={idx} 
                className={`rag-chunk-card ${selectedChunk?.id === c.id ? 'selected' : ''}`}
                onClick={() => setSelectedChunk(c)}
              >
                <div className="rag-chunk-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <strong style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>{c.docTitle}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="rag-score-tag">{c.relevancePercent}% Match</span>
                    <span className="rag-chunk-tag">Chunk {c.chunkIndex}/{c.totalChunks}</span>
                  </div>
                </div>
                <p className="rag-chunk-text">
                  "{c.text.length > 220 ? c.text.slice(0, 220) + '...' : c.text}"
                </p>
              </div>
            ))}
          </div>

          {selectedChunk && (
            <div className="rag-full-chunk-viewer">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  FULL CITATION PREVIEW — {selectedChunk.docTitle} (Chunk {selectedChunk.chunkIndex})
                </span>
                <button 
                  className="icon-btn-sm" 
                  onClick={() => setSelectedChunk(null)}
                  style={{ fontSize: '11px', cursor: 'pointer' }}
                >
                  ✕ Close
                </button>
              </div>
              <pre className="rag-chunk-full-pre">
                {selectedChunk.text}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
