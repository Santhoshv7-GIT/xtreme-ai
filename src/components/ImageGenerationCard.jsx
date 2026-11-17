import React, { useState } from 'react';
import { Download, Sparkles, RefreshCw, ZoomIn, Copy, Check, ExternalLink } from 'lucide-react';

export default function ImageGenerationCard({ media, onRegenerate }) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!media || !media.url) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch(media.url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const cleanPrompt = (media.prompt || 'image').slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `xtreme-ai-${cleanPrompt}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed, opening in new tab', err);
      window.open(media.url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(media.url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(media.prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="generated-media-card image-card">
        {/* Card Header */}
        <div className="media-card-header">
          <div className="media-card-badge">
            <Sparkles size={13} className="gemini-star-spin" />
            <span>XTREME Flux Engine</span>
            {media.style && <span className="media-style-pill">{media.style}</span>}
          </div>
          <div className="media-card-meta">
            {media.width && media.height && (
              <span className="media-resolution-tag">{media.width}×{media.height}</span>
            )}
            {media.seed && (
              <span className="media-seed-tag">Seed: {media.seed}</span>
            )}
          </div>
        </div>

        {/* Card Image Container */}
        <div className="media-preview-box">
          {!loaded && !hasError && (
            <div className="media-loading-placeholder">
              <div className="media-spinner" />
              <span>Synthesizing photorealistic image with Flux AI...</span>
            </div>
          )}

          {hasError && (
            <div className="media-error-box">
              <p>Failed to load image preview.</p>
              <button 
                className="media-action-pill" 
                onClick={() => setHasError(false)}
              >
                Retry
              </button>
            </div>
          )}

          <img 
            src={media.url} 
            alt={media.prompt || 'AI Generated Image'} 
            className={`media-rendered-img ${loaded ? 'loaded' : 'loading'}`}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setHasError(true);
              setLoaded(true);
            }}
            onClick={() => setIsFullscreen(true)}
            title="Click to view full screen"
          />

          {/* Quick Hover Overlay Actions */}
          {loaded && !hasError && (
            <div className="media-hover-overlay">
              <button 
                className="media-overlay-btn"
                onClick={() => setIsFullscreen(true)}
                title="View Fullscreen"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                className="media-overlay-btn"
                onClick={handleDownload}
                disabled={downloading}
                title="Download HD Image"
              >
                <Download size={16} />
              </button>
              <button 
                className="media-overlay-btn"
                onClick={handleCopyLink}
                title="Copy Image URL"
              >
                {copiedLink ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              </button>
              {onRegenerate && (
                <button 
                  className="media-overlay-btn"
                  onClick={() => onRegenerate(media.prompt, media.seed)}
                  title="Generate Variation (New Seed)"
                >
                  <RefreshCw size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Card Footer with Prompt */}
        <div className="media-card-footer">
          <div className="media-prompt-text" title={media.prompt}>
            <strong>Prompt:</strong> "{media.prompt}"
          </div>
          <div className="media-footer-actions">
            <button 
              className="media-action-pill"
              onClick={handleCopyPrompt}
              title="Copy prompt text"
            >
              {copiedPrompt ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span>{copiedPrompt ? 'Copied' : 'Prompt'}</span>
            </button>
            <button 
              className="media-action-pill primary"
              onClick={handleDownload}
              disabled={downloading}
              title="Download image file"
            >
              <Download size={12} />
              <span>{downloading ? 'Downloading...' : 'Download HD'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="modal-overlay image-lightbox-overlay" onClick={() => setIsFullscreen(false)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-toolbar">
              <span className="lightbox-title">{media.prompt}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="icon-btn" onClick={handleDownload} title="Download">
                  <Download size={18} />
                </button>
                <button className="icon-btn" onClick={() => setIsFullscreen(false)} title="Close">
                  ✕
                </button>
              </div>
            </div>
            <div className="lightbox-img-wrap">
              <img src={media.url} alt={media.prompt} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
