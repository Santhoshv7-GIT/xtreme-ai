import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Brain, Gauge, Tag, AlignLeft, Clock, 
  BarChart2, FileText, Check, Copy, Wand2, Compass, Layers
} from 'lucide-react';
import { runFullNLPAnalysis, extractKeySentences } from '../utils/nlpEngine';

export default function NlpInsightsModal({ isOpen, onClose, initialText = '', messageId = null }) {
  const [inputText, setInputText] = useState(initialText || '');
  const [analysis, setAnalysis] = useState(null);
  const [summary, setSummary] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      const res = runFullNLPAnalysis(initialText);
      setAnalysis(res);
      setSummary('');
    }
  }, [initialText, isOpen]);

  if (!isOpen) return null;

  const handleAnalyze = () => {
    if (!inputText.trim()) return;
    const res = runFullNLPAnalysis(inputText);
    setAnalysis(res);
    setSummary('');
  };

  const handleSummarize = () => {
    if (!inputText.trim()) return;
    const sum = extractKeySentences(inputText, 3);
    setSummary(sum);
  };

  const handleCopySummary = async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay studio-modal-overlay" onClick={onClose}>
      <div className="studio-modal-content nlp-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="studio-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="studio-header-icon" style={{ background: 'linear-gradient(135deg, #7000FF 0%, #00F0FF 100%)' }}>
              <Brain size={20} color="#fff" />
            </div>
            <div>
              <h2 className="studio-title">XTREME AI NLP Intelligence Studio</h2>
              <p className="studio-subtitle">Deep Natural Language Processing: Sentiment, NER Entities, Intent & Readability</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close Studio">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="nlp-modal-body">
          {/* Left Column: Input text & Quick Tools */}
          <div className="nlp-input-column">
            <div className="studio-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="studio-label">ANALYSIS SOURCE TEXT</label>
                <button 
                  className="studio-enhance-btn" 
                  onClick={handleSummarize}
                  title="Generate 3-sentence extractive summary"
                >
                  <Wand2 size={12} />
                  <span>Summarize (TL;DR)</span>
                </button>
              </div>

              <textarea 
                className="studio-prompt-textarea"
                rows={9}
                placeholder="Paste or type any text, response, code prompt, or article to analyze with NLP..."
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setAnalysis(runFullNLPAnalysis(e.target.value));
                }}
              />
            </div>

            {/* Extractive Summary Box */}
            {summary && (
              <div className="nlp-summary-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#00F0FF' }}>
                    ✨ EXTRACTIVE NLP SUMMARY
                  </span>
                  <button className="icon-btn-sm" onClick={handleCopySummary}>
                    {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  </button>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {summary}
                </p>
              </div>
            )}

            <button 
              className="studio-generate-submit-btn" 
              onClick={handleAnalyze}
              style={{ marginTop: 'auto' }}
            >
              <Sparkles size={16} />
              <span>Run Deep NLP Analysis</span>
            </button>
          </div>

          {/* Right Column: Visual Dashboard */}
          <div className="nlp-dashboard-column">
            {analysis ? (
              <div className="nlp-cards-grid">
                {/* 1. Sentiment & Emotion Card */}
                <div className="nlp-metric-card">
                  <div className="nlp-card-title-row">
                    <Gauge size={15} color="#00F0FF" />
                    <span>Sentiment & Emotional Tone</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <div>
                      <span className={`nlp-sentiment-badge ${analysis.sentiment.label.toLowerCase()}`}>
                        {analysis.sentiment.label.toUpperCase()}
                      </span>
                      <div className="nlp-emotion-sub">
                        {analysis.sentiment.emotion}
                      </div>
                    </div>
                    <div className="nlp-score-circle">
                      <span className="nlp-score-num">
                        {analysis.sentiment.score > 0 ? `+${analysis.sentiment.score}` : analysis.sentiment.score}
                      </span>
                      <span className="nlp-score-lbl">Valence</span>
                    </div>
                  </div>

                  {/* Polarity Slider */}
                  <div className="nlp-polarity-bar-track">
                    <div 
                      className="nlp-polarity-bar-fill"
                      style={{
                        width: `${Math.max(5, ((analysis.sentiment.score + 1) / 2) * 100)}%`,
                        background: analysis.sentiment.score >= 0 
                          ? 'linear-gradient(90deg, #10b981, #00F0FF)' 
                          : 'linear-gradient(90deg, #ef4444, #f59e0b)'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    <span>-1.0 Negative</span>
                    <span>0.0 Neutral</span>
                    <span>+1.0 Positive</span>
                  </div>
                </div>

                {/* 2. Intent Classification Card */}
                <div className="nlp-metric-card">
                  <div className="nlp-card-title-row">
                    <Compass size={15} color="#a855f7" />
                    <span>Intent Classification</span>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div 
                      className="nlp-intent-badge"
                      style={{ borderColor: analysis.intent.badgeColor, color: analysis.intent.badgeColor }}
                    >
                      {analysis.intent.label}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Confidence Score</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {Math.round(analysis.intent.confidence * 100)}%
                      </span>
                    </div>
                    <div className="nlp-polarity-bar-track" style={{ marginTop: '6px' }}>
                      <div 
                        className="nlp-polarity-bar-fill"
                        style={{ width: `${analysis.intent.confidence * 100}%`, background: analysis.intent.badgeColor }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Named Entities (NER) Card */}
                <div className="nlp-metric-card full-width">
                  <div className="nlp-card-title-row">
                    <Tag size={15} color="#FF007A" />
                    <span>Extracted Named Entities ({analysis.entities.length})</span>
                  </div>
                  <div className="nlp-entities-wrap">
                    {analysis.entities.length === 0 ? (
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                        No specific named entities detected in current snippet.
                      </span>
                    ) : (
                      analysis.entities.map((ent, idx) => (
                        <div key={idx} className={`nlp-entity-pill ${ent.category}`}>
                          <span className="nlp-ent-text">{ent.text}</span>
                          <span className="nlp-ent-type">{ent.type}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. Text Readability & Statistics */}
                <div className="nlp-metric-card">
                  <div className="nlp-card-title-row">
                    <BarChart2 size={15} color="#10b981" />
                    <span>Readability & Grade Level</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {analysis.metrics.readingEase} / 100
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        {analysis.metrics.level}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ~{analysis.metrics.readTimeSeconds}s
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Read Time
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    <span><strong>{analysis.metrics.words}</strong> words</span>
                    <span>•</span>
                    <span><strong>{analysis.metrics.sentences}</strong> sentences</span>
                    <span>•</span>
                    <span><strong>{Math.round(analysis.metrics.lexicalDiversity * 100)}%</strong> diversity</span>
                  </div>
                </div>

                {/* 5. Keyphrases (TF-IDF) */}
                <div className="nlp-metric-card">
                  <div className="nlp-card-title-row">
                    <Layers size={15} color="#FFAE42" />
                    <span>Salient Keyphrases (TF-IDF)</span>
                  </div>
                  <div className="nlp-keyphrases-list">
                    {analysis.keyphrases.length === 0 ? (
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No keyphrases found.</span>
                    ) : (
                      analysis.keyphrases.map((kp, idx) => (
                        <div key={idx} className="nlp-kp-item">
                          <span>#{kp.term}</span>
                          <span className="nlp-kp-count">×{kp.count}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="studio-empty-viewport">
                <Brain size={44} style={{ opacity: 0.4 }} />
                <h3>Enter text to inspect with NLP</h3>
                <p>Real-time natural language analysis covering sentiment, named entities, intent, reading metrics, and keywords.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
