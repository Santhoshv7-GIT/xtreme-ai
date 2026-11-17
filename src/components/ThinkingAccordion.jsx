import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, Sparkles } from 'lucide-react';

export default function ThinkingAccordion({ steps = [], time = 0, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="thinking-accordion">
      <div 
        className="thinking-header" 
        onClick={() => setIsOpen(!isOpen)}
        title="Click to expand/collapse model reasoning chain"
      >
        <div className="thinking-badge">
          <Brain size={16} />
          <span>Thought for {time > 0 ? `${time}s` : 'a moment'}</span>
          <span className="thinking-steps-count">
            ({steps.length} reasoning steps)
          </span>
        </div>
        <div className="thinking-chevron">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isOpen && (
        <div className="thinking-content">
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {steps.map((step, idx) => (
              <li key={idx}>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
