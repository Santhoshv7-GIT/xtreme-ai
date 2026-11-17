import React, { useState, useEffect } from 'react';
import { 
  X, BookOpen, UploadCloud, FileText, Check, Trash2, Plus, 
  Search, Sliders, Layers, Sparkles, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { ragKnowledgeBase } from '../utils/ragEngine';

export default function RagKnowledgeModal({ isOpen, onClose, onKnowledgeUpdated }) {
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'upload' | 'test'
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ totalDocs: 0, activeDocs: 0, totalChunks: 0, totalWords: 0 });

  // Upload state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadType, setUploadType] = useState('text');
  const [isSuccessToast, setIsSuccessToast] = useState(false);

  // Semantic search tester state
  const [testQuery, setTestQuery] = useState('What models does XTREME AI support?');
  const [testResults, setTestResults] = useState([]);

  // Refresh local state from ragKnowledgeBase
  const refreshState = () => {
    setDocuments([...ragKnowledgeBase.documents]);
    setStats(ragKnowledgeBase.getStats());
    if (onKnowledgeUpdated) onKnowledgeUpdated();
  };

  useEffect(() => {
    if (isOpen) {
      refreshState();
    }
  }, [isOpen]);

  useEffect(() => {
    if (testQuery.trim() && isOpen) {
      const results = ragKnowledgeBase.retrieveRelevantChunks(testQuery, 4, 0.05);
      setTestResults(results);
    } else {
      setTestResults([]);
    }
  }, [testQuery, isOpen, documents]);

  if (!isOpen) return null;

  // File Upload Handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const text = uploadEvent.target?.result;
        if (text && typeof text === 'string') {
          let type = 'text';
          if (file.name.endsWith('.md')) type = 'markdown';
          else if (file.name.endsWith('.json')) type = 'json';
          else if (file.name.endsWith('.csv')) type = 'csv';
          else if (file.name.endsWith('.js') || file.name.endsWith('.py')) type = 'code';

          ragKnowledgeBase.addDocument({
            title: file.name,
            content: text,
            type
          });
          refreshState();
        }
      };
      reader.readAsText(file);
    });

    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 3000);
  };

  // Manual Paste Add Handler
  const handleAddManualDoc = () => {
    if (!uploadContent.trim()) return;
    ragKnowledgeBase.addDocument({
      title: uploadTitle.trim() || `Notes_${Date.now()}.txt`,
      content: uploadContent.trim(),
      type: uploadType
    });
    setUploadTitle('');
    setUploadContent('');
    refreshState();
    setActiveTab('documents');
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 3000);
  };

  // Toggle Document Active
  const handleToggleDoc = (docId) => {
    ragKnowledgeBase.toggleDocument(docId);
    refreshState();
  };

  // Remove Document
  const handleRemoveDoc = (docId) => {
    if (window.confirm('Are you sure you want to remove this document from the Knowledge Base?')) {
      ragKnowledgeBase.removeDocument(docId);
      refreshState();
    }
  };

  // Load Preset Knowledge Pack
  const handleLoadPresetPack = (packType) => {
    if (packType === 'security') {
      ragKnowledgeBase.addDocument({
        title: 'Enterprise_Security_&_API_Guidelines.md',
        content: `# Enterprise Security & API Guidelines

## 1. Authentication & Encryption
All API calls must use TLS 1.3 encryption. Bearer tokens must be cryptographically hashed using SHA-256 and rotated automatically every 30 days.

## 2. Rate Limiting Policy
Standard tiers are throttled to 60 requests per minute with an exponential backoff retry policy. Frontier cognitive reasoning calls are allocated a dedicated concurrency queue of 5 parallel streams.

## 3. Data Governance & Client Storage
Customer identifiers and proprietary knowledge bases are encrypted in the local IndexedDB/localStorage cluster. Zero unapproved telemetry is emitted.`,
        type: 'markdown'
      });
    } else if (packType === 'web') {
      ragKnowledgeBase.addDocument({
        title: 'Modern_Web_Architecture_2026.md',
        content: `# Modern Full-Stack Web Architecture 2026

## 1. Hybrid Rendering & React 19
React 19 Server Components combined with client hydration deliver near-zero initial JavaScript bundles. State machines govern deterministic UI transitions.

## 2. Vector Search & Edge Intelligence
In-memory client-side vector search allows real-time semantic retrieval over thousands of documents with sub-millisecond cosine distance computation without backend server dependencies.

## 3. Canvas 2D & WebGL Graphics
HTML5 Canvas with hardware-accelerated shaders allows generating dynamic procedural animations at a locked 60 frames per second.`,
        type: 'markdown'
      });
    }
    refreshState();
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 3000);
  };

  return (
    <div className="modal-overlay studio-modal-overlay" onClick={onClose}>
      <div className="studio-modal-content rag-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="studio-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="studio-header-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #0084FF 100%)' }}>
              <BookOpen size={20} color="#fff" />
            </div>
            <div>
              <h2 className="studio-title">XTREME AI Knowledge Base (RAG Engine)</h2>
              <p className="studio-subtitle">Vector Semantic Search & Document Grounding for Accurate Answers</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close Knowledge Base">
            <X size={20} />
          </button>
        </div>

        {/* Stats Ribbon */}
        <div className="rag-stats-ribbon">
          <div className="rag-stat-card">
            <span className="rag-stat-num">{stats.totalDocs}</span>
            <span className="rag-stat-lbl">Documents ({stats.activeDocs} Active)</span>
          </div>
          <div className="rag-stat-card">
            <span className="rag-stat-num">{stats.totalChunks}</span>
            <span className="rag-stat-lbl">Vector Chunks Indexed</span>
          </div>
          <div className="rag-stat-card">
            <span className="rag-stat-num">{stats.totalWords.toLocaleString()}</span>
            <span className="rag-stat-lbl">Total Words Grounded</span>
          </div>
          <div className="rag-stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="rag-active-dot" />
              <span className="rag-stat-num" style={{ fontSize: '14px', color: '#10b981' }}>TF-IDF + Cosine</span>
            </div>
            <span className="rag-stat-lbl">Vector Engine Status</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="rag-tabs-bar">
          <button 
            className={`rag-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={15} />
            <span>Indexed Documents ({documents.length})</span>
          </button>
          <button 
            className={`rag-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <UploadCloud size={15} />
            <span>Add / Upload Documents</span>
          </button>
          <button 
            className={`rag-tab-btn ${activeTab === 'test' ? 'active' : ''}`}
            onClick={() => setActiveTab('test')}
          >
            <Search size={15} />
            <span>Semantic Search Tester</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="rag-modal-body">
          {/* TAB 1: Indexed Documents List */}
          {activeTab === 'documents' && (
            <div className="rag-tab-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Active documents are automatically retrieved and cited when answering queries in chat.
                </span>
                <button 
                  className="media-action-pill" 
                  onClick={() => setActiveTab('upload')}
                  style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none' }}
                >
                  <Plus size={14} />
                  <span>Upload Document</span>
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="rag-empty-box">
                  <BookOpen size={40} style={{ opacity: 0.4 }} />
                  <h4>Knowledge Base is Empty</h4>
                  <p>Upload files or load a preset knowledge pack below to ground XTREME AI.</p>
                  <button className="studio-generate-submit-btn" onClick={() => handleLoadPresetPack('web')} style={{ width: 'auto', padding: '8px 18px', marginTop: '12px' }}>
                    Load Sample Knowledge Pack
                  </button>
                </div>
              ) : (
                <div className="rag-doc-list">
                  {documents.map(doc => {
                    const chunkCount = Math.max(1, Math.ceil(doc.content.length / 380));
                    return (
                      <div key={doc.id} className={`rag-doc-card ${doc.enabled ? 'enabled' : 'disabled'}`}>
                        <div className="rag-doc-main">
                          <div className="rag-doc-icon-wrap">
                            <FileText size={20} color={doc.enabled ? '#10b981' : 'var(--text-tertiary)'} />
                          </div>
                          <div className="rag-doc-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 className="rag-doc-title">{doc.title}</h4>
                              <span className="rag-doc-type-tag">{doc.type.toUpperCase()}</span>
                            </div>
                            <div className="rag-doc-meta">
                              <span>{chunkCount} Vector Chunks</span>
                              <span>•</span>
                              <span>{doc.content.split(/\s+/).length} Words</span>
                              <span>•</span>
                              <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="rag-doc-actions">
                          {/* Toggle Active Checkbox */}
                          <label className="rag-switch" title={doc.enabled ? "Enabled in RAG retrieval" : "Disabled"}>
                            <input 
                              type="checkbox" 
                              checked={doc.enabled} 
                              onChange={() => handleToggleDoc(doc.id)} 
                            />
                            <span className="rag-slider round" />
                          </label>

                          <button 
                            className="icon-btn-sm" 
                            onClick={() => handleRemoveDoc(doc.id)}
                            title="Delete Document"
                          >
                            <Trash2 size={16} color="#ef4444" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Preset Packs Section */}
              <div className="rag-presets-tray">
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
                  QUICK KNOWLEDGE PACKS (1-CLICK LOAD)
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <button 
                    className="studio-chip" 
                    onClick={() => handleLoadPresetPack('security')}
                  >
                    🔒 Enterprise Security & API Guidelines
                  </button>
                  <button 
                    className="studio-chip" 
                    onClick={() => handleLoadPresetPack('web')}
                  >
                    ⚡ Modern Web & React 19 Architecture
                  </button>
                  <button 
                    className="studio-chip" 
                    onClick={() => {
                      ragKnowledgeBase.resetToDefault();
                      refreshState();
                    }}
                  >
                    🔄 Reset to Default Core Spec
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Upload / Add Documents */}
          {activeTab === 'upload' && (
            <div className="rag-tab-content">
              <div className="rag-upload-grid">
                {/* File Dropzone */}
                <div className="rag-dropzone-box">
                  <UploadCloud size={44} color="var(--accent-blue)" />
                  <h3>Upload Knowledge Documents</h3>
                  <p>Drag and drop or select files from your computer (.txt, .md, .pdf, .json, .csv, .py, .js, .html)</p>
                  <label className="studio-generate-submit-btn" style={{ width: 'auto', padding: '10px 22px', cursor: 'pointer', marginTop: '12px' }}>
                    <Plus size={16} />
                    <span>Choose Files</span>
                    <input 
                      type="file" 
                      multiple 
                      accept=".txt,.md,.json,.csv,.pdf,.js,.py,.html,.css" 
                      style={{ display: 'none' }} 
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {/* Manual Paste Box */}
                <div className="rag-paste-box">
                  <h3 style={{ fontSize: '15px', marginBottom: '8px' }}>Or Paste Raw Text / Notes</h3>
                  <input 
                    type="text" 
                    className="studio-prompt-textarea" 
                    style={{ height: '38px', marginBottom: '8px' }}
                    placeholder="Document Title (e.g. My_Project_Notes.md)"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                  <textarea 
                    className="studio-prompt-textarea"
                    rows={7}
                    placeholder="Paste full text, guidelines, product specs, or reference material here..."
                    value={uploadContent}
                    onChange={(e) => setUploadContent(e.target.value)}
                  />
                  <button 
                    className="studio-generate-submit-btn"
                    onClick={handleAddManualDoc}
                    disabled={!uploadContent.trim()}
                    style={{ marginTop: '10px' }}
                  >
                    <Plus size={16} />
                    <span>Index into Vector Store</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Semantic Search Tester */}
          {activeTab === 'test' && (
            <div className="rag-tab-content">
              <div style={{ marginBottom: '14px' }}>
                <label className="studio-label">TEST QUERY (LIVE COSINE SIMILARITY TESTER)</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <input 
                    type="text" 
                    className="studio-prompt-textarea"
                    style={{ height: '42px', flex: 1 }}
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    placeholder="Type any test query to see which vector chunks are retrieved..."
                  />
                  <button 
                    className="studio-action-button primary"
                    onClick={() => {
                      const res = ragKnowledgeBase.retrieveRelevantChunks(testQuery, 4, 0.05);
                      setTestResults(res);
                    }}
                  >
                    <Search size={16} />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {testResults.length === 0 ? (
                <div className="rag-empty-box" style={{ padding: '30px' }}>
                  <AlertCircle size={32} style={{ opacity: 0.4 }} />
                  <p>No matching vector chunks above similarity threshold. Try broadening your query terms.</p>
                </div>
              ) : (
                <div className="rag-test-results-list">
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    Retrieved {testResults.length} Most Relevant Chunks:
                  </span>
                  {testResults.map((chunk, idx) => (
                    <div key={idx} className="rag-chunk-card selected" style={{ marginTop: '8px' }}>
                      <div className="rag-chunk-meta">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={14} color="#10b981" />
                          <strong style={{ color: 'var(--text-primary)' }}>{chunk.docTitle}</strong>
                          <span style={{ opacity: 0.6, fontSize: '11px' }}>Chunk {chunk.chunkIndex}/{chunk.totalChunks}</span>
                        </div>
                        <span className="rag-score-tag" style={{ background: '#10b981', color: '#000', fontWeight: 700 }}>
                          {chunk.relevancePercent}% Relevance
                        </span>
                      </div>
                      <pre className="rag-chunk-full-pre" style={{ marginTop: '8px' }}>
                        {chunk.text}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Success Toast */}
        {isSuccessToast && (
          <div className="video-recording-toast" style={{ bottom: '20px', top: 'auto', left: '50%', transform: 'translateX(-50%)', borderColor: '#10b981' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>Knowledge Base updated & vector index rebuilt!</span>
          </div>
        )}
      </div>
    </div>
  );
}
