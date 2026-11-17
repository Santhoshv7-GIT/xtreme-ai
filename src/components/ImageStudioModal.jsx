import React, { useState } from 'react';
import { 
  X, Sparkles, Download, RefreshCw, ZoomIn, Copy, Check, 
  Send, Wand2, Sliders, Layers, Monitor, Smartphone, Square, Image as ImageIcon
} from 'lucide-react';

const STYLE_PRESETS = [
  { id: 'photorealistic', name: 'Photorealistic', promptSuffix: ', photorealistic 8k, professional photography, hyperdetailed, 35mm lens, realistic textures, volumetric cinematic lighting' },
  { id: 'cyberpunk', name: 'Cyberpunk', promptSuffix: ', cyberpunk neon aesthetic, futuristic sci-fi city, synthwave colors, volumetric fog, octane render 8k' },
  { id: 'anime', name: 'Anime', promptSuffix: ', anime aesthetic, Makoto Shinkai style, vibrant colors, detailed sky, studio ghibli masterpiece' },
  { id: '3d-render', name: '3D Cinematic', promptSuffix: ', 3d cinematic render, Unreal Engine 5, ray tracing, octane render, subsurface scattering, Pixar lighting' },
  { id: 'fantasy', name: 'Fantasy Art', promptSuffix: ', epic fantasy illustration, mythical atmosphere, glowing magic runes, detailed digital painting, Artstation trending' },
  { id: 'oil-painting', name: 'Oil Painting', promptSuffix: ', classic oil painting on canvas, expressive impasto brushstrokes, rich pigments, dramatic chiaroscuro lighting' }
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square', width: 1024, height: 1024, icon: Square, desc: 'Instagram, Avatar' },
  { id: '16:9', label: '16:9 Cinema', width: 1280, height: 720, icon: Monitor, desc: 'Desktop, YouTube' },
  { id: '9:16', label: '9:16 Story', width: 720, height: 1280, icon: Smartphone, desc: 'Reels, Mobile' },
  { id: '4:3', label: '4:3 Classic', width: 1024, height: 768, icon: Layers, desc: 'Photo Print' }
];

const INSPIRATION_PROMPTS = [
  'Cyberpunk samurai warrior in rainy Neo-Tokyo, reflective neon puddles, glowing katana, 8k',
  'Majestic celestial phoenix rising from an iridescent nebula, glowing cosmic feathers',
  'Futuristic glass architectural villa perched on cliff overlooking bioluminescent ocean',
  'Hyperrealistic portrait of a cyborg astronaut exploring crystalline alien cavern',
  'Cozy steampunk library with flying brass clockwork owls and glowing stained glass windows'
];

export default function ImageStudioModal({ isOpen, onClose, onInsertToChat }) {
  const [prompt, setPrompt] = useState('Cyberpunk samurai warrior in rainy Neo-Tokyo, reflective neon puddles');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [modelType, setModelType] = useState('flux');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [imageHistory, setImageHistory] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const activeRatioObj = ASPECT_RATIOS.find(r => r.id === selectedRatio) || ASPECT_RATIOS[0];
  const activeStyleObj = STYLE_PRESETS.find(s => s.id === selectedStyle) || STYLE_PRESETS[0];

  const handleEnhancePrompt = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      const cinematicEnhancements = [
        'intricate cinematic composition, dynamic angle, dramatic rim lighting, award-winning cinematography',
        'ultra-high definition 8k, photorealistic surface shaders, ambient occlusion, anamorphic lens flare',
        'volumetric atmospheric haze, masterclass digital illustration, cinematic depth of field'
      ];
      const randomEnhancement = cinematicEnhancements[Math.floor(Math.random() * cinematicEnhancements.length)];
      setPrompt(prev => prev.trim() + ', ' + randomEnhancement);
      setIsEnhancing(false);
    }, 400);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    const seed = Math.floor(Math.random() * 9999999) + 1;
    const finalPrompt = prompt.trim() + (activeStyleObj.promptSuffix || '');
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${activeRatioObj.width}&height=${activeRatioObj.height}&model=${modelType}&seed=${seed}&nologo=true`;

    const newMedia = {
      type: 'image',
      url: imageUrl,
      prompt: prompt.trim(),
      style: activeStyleObj.name,
      ratio: activeRatioObj.label,
      width: activeRatioObj.width,
      height: activeRatioObj.height,
      seed,
      model: modelType
    };

    setCurrentImage(newMedia);
    setImageHistory(prev => [newMedia, ...prev.slice(0, 7)]);
  };

  const handleDownload = async () => {
    if (!currentImage?.url) return;
    try {
      setDownloading(true);
      const res = await fetch(currentImage.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xtreme-ai-${currentImage.seed || Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      window.open(currentImage.url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleSendToChat = () => {
    if (!currentImage || !onInsertToChat) return;
    onInsertToChat(currentImage);
    onClose();
  };

  return (
    <div className="modal-overlay studio-modal-overlay" onClick={onClose}>
      <div className="studio-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="studio-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="studio-header-icon">
              <Sparkles size={20} className="gemini-star-spin" />
            </div>
            <div>
              <h2 className="studio-title">XTREME AI Image Studio</h2>
              <p className="studio-subtitle">Next-Generation Text-to-Image Creation powered by Flux Pro</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close Studio">
            <X size={20} />
          </button>
        </div>

        {/* Studio Body Layout */}
        <div className="studio-modal-body">
          {/* Left Column: Controls & Prompt */}
          <div className="studio-controls-column">
            {/* Prompt Box */}
            <div className="studio-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="studio-label">PROMPT DESCRIPTION</label>
                <button 
                  className="studio-enhance-btn" 
                  onClick={handleEnhancePrompt} 
                  disabled={isEnhancing}
                  title="Enhance prompt with cinematic camera & lighting details"
                >
                  <Wand2 size={13} />
                  <span>{isEnhancing ? 'Enhancing...' : 'Enhance with AI'}</span>
                </button>
              </div>
              <textarea 
                className="studio-prompt-textarea"
                rows={3}
                placeholder="Describe anything you want to create in vivid visual detail..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              {/* Inspiration Chips */}
              <div className="studio-inspiration-chips">
                {INSPIRATION_PROMPTS.map((insp, idx) => (
                  <button 
                    key={idx} 
                    className="studio-chip" 
                    onClick={() => setPrompt(insp)}
                    title={insp}
                  >
                    {insp.slice(0, 36)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Art Style Presets */}
            <div className="studio-section">
              <label className="studio-label">ARTISTIC STYLE</label>
              <div className="studio-styles-grid">
                {STYLE_PRESETS.map(style => (
                  <button
                    key={style.id}
                    className={`studio-style-card ${selectedStyle === style.id ? 'active' : ''}`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <span>{style.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="studio-section">
              <label className="studio-label">ASPECT RATIO & RESOLUTION</label>
              <div className="studio-ratios-grid">
                {ASPECT_RATIOS.map(ratio => {
                  const Icon = ratio.icon;
                  return (
                    <button
                      key={ratio.id}
                      className={`studio-ratio-card ${selectedRatio === ratio.id ? 'active' : ''}`}
                      onClick={() => setSelectedRatio(ratio.id)}
                    >
                      <Icon size={16} />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{ratio.label}</span>
                        <span style={{ fontSize: '11px', opacity: 0.7 }}>{ratio.width}×{ratio.height}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Model Architecture */}
            <div className="studio-section">
              <label className="studio-label">SYNTHESIS MODEL</label>
              <div className="studio-model-selector-row">
                <button 
                  className={`studio-model-pill ${modelType === 'flux' ? 'active' : ''}`}
                  onClick={() => setModelType('flux')}
                >
                  Flux Pro (Flagship)
                </button>
                <button 
                  className={`studio-model-pill ${modelType === 'flux-realism' ? 'active' : ''}`}
                  onClick={() => setModelType('flux-realism')}
                >
                  Flux Realism
                </button>
                <button 
                  className={`studio-model-pill ${modelType === 'flux-anime' ? 'active' : ''}`}
                  onClick={() => setModelType('flux-anime')}
                >
                  Anime Diffusion
                </button>
                <button 
                  className={`studio-model-pill ${modelType === 'turbo' ? 'active' : ''}`}
                  onClick={() => setModelType('turbo')}
                >
                  Turbo (Fastest)
                </button>
              </div>
            </div>

            {/* Generate Action Button */}
            <button 
              className="studio-generate-submit-btn" 
              onClick={handleGenerate}
              disabled={!prompt.trim()}
            >
              <Sparkles size={18} />
              <span>Generate AI Image</span>
            </button>
          </div>

          {/* Right Column: Live Viewport & History */}
          <div className="studio-viewport-column">
            <div className="studio-canvas-container">
              {currentImage ? (
                <div className="studio-image-display">
                  {isGenerating && (
                    <div className="studio-loading-badge">
                      <div className="media-spinner" />
                      <span>Synthesizing high-res image...</span>
                    </div>
                  )}
                  <img 
                    src={currentImage.url} 
                    alt={currentImage.prompt} 
                    className="studio-rendered-image"
                    onLoad={() => setIsGenerating(false)}
                    onError={() => setIsGenerating(false)}
                  />

                  {/* Actions Bar */}
                  <div className="studio-image-actions">
                    <button 
                      className="studio-action-button"
                      onClick={handleDownload}
                      disabled={downloading}
                      title="Download image (.jpg)"
                    >
                      <Download size={16} />
                      <span>{downloading ? 'Downloading...' : 'Download HD'}</span>
                    </button>
                    {onInsertToChat && (
                      <button 
                        className="studio-action-button primary"
                        onClick={handleSendToChat}
                        title="Send this generated image to chat conversation"
                      >
                        <Send size={16} />
                        <span>Insert into Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="studio-empty-viewport">
                  <div className="studio-empty-icon-wrap">
                    <ImageIcon size={48} />
                  </div>
                  <h3>Ready for Visual Creation</h3>
                  <p>Choose your style, aspect ratio, and click "Generate AI Image" to synthesize your vision.</p>
                  <button className="studio-chip" onClick={handleGenerate} style={{ marginTop: '12px' }}>
                    Generate Sample Cyberpunk Scene
                  </button>
                </div>
              )}
            </div>

            {/* Generation History Ribbon */}
            {imageHistory.length > 0 && (
              <div className="studio-history-tray">
                <span className="studio-history-label">Session Generations:</span>
                <div className="studio-history-scroll">
                  {imageHistory.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`studio-history-thumb ${currentImage?.url === item.url ? 'active' : ''}`}
                      onClick={() => setCurrentImage(item)}
                    >
                      <img src={item.url} alt={item.prompt} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
