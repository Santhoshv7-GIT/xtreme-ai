import React from 'react';
import { X, Image, Sparkles } from 'lucide-react';

export const SAMPLE_IMAGES = [
  {
    name: 'Cosmic Nebula',
    category: 'Astrophotography',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80',
    prompt: 'Analyze this cosmic nebula image. Explain the scientific principles behind the colors and star birth in this region.'
  },
  {
    name: 'Cyberpunk Drone',
    category: 'Sci-Fi Design',
    url: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=600&q=80',
    prompt: 'Examine this robotic design. Provide a technical critique on its mechanics, sensor placement, and aesthetic style.'
  },
  {
    name: 'Financial Data Dashboard',
    category: 'Analytics & OCR',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    prompt: 'Interpret the charts and metrics displayed in this analytics dashboard. What are the key trends and takeaways?'
  },
  {
    name: 'Modern Architecture',
    category: 'Urban Geometry',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    prompt: 'Analyze the architectural elements and structural balance of this modern building.'
  }
];

export default function SampleImagesPicker({ isOpen, onClose, onSelectSample }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image size={18} color="#7cacf8" />
            <span className="modal-title">Select Sample Multimodal Image</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Test XTREME AI's multimodal vision analysis with curated sample images:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {SAMPLE_IMAGES.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  onSelectSample(item);
                  onClose();
                }}
                style={{
                  background: 'var(--bg-main)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                className="suggestion-card"
              >
                <div style={{ width: '100%', height: '110px', overflow: 'hidden' }}>
                  <img 
                    src={item.url} 
                    alt={item.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    crossOrigin="anonymous"
                  />
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent-blue)', textTransform: 'uppercase', fontWeight: 600 }}>
                    {item.category}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {item.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
