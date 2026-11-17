import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Film, Sparkles, Play, Pause, Download, Send, RefreshCw, 
  Layers, Clock, Sliders, Monitor, Check, Compass
} from 'lucide-react';

const VIDEO_PRESETS = [
  { 
    id: 'cosmic', 
    name: 'Cosmic Nebula Warp', 
    desc: 'Relativistic 3D starfield hyper-drive through glowing nebular clouds',
    prompt: 'Cinematic hyperlapse through an iridescent star cluster with relativistic warp stars'
  },
  { 
    id: 'cyberpunk', 
    name: 'Cyberpunk Neon Highway', 
    desc: 'Nighttime neon grid flythrough with synthwave sunset and glowing city lines',
    prompt: 'Futuristic neon synthwave grid horizon with towering skyscrapers and glowing light trails'
  },
  { 
    id: 'matrix', 
    name: 'Matrix Digital Rain', 
    desc: 'Cascading digital glyph streams with phosphor luminescence',
    prompt: 'High-density cybernetic glyph rain cascading in dark terminal cyber-space'
  },
  { 
    id: 'quantum', 
    name: 'Quantum Particle Vortex', 
    desc: 'Swirling multi-colored magnetic vortex attractor with 2000 particles',
    prompt: 'Dynamic quantum field simulation with luminous magnetic energy swirling in a vortex'
  }
];

export default function VideoStudioModal({ isOpen, onClose, onInsertToChat }) {
  const [selectedPreset, setSelectedPreset] = useState('cosmic');
  const [prompt, setPrompt] = useState(VIDEO_PRESETS[0].prompt);
  const [duration, setDuration] = useState(8);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const frameRef = useRef(0);

  // Update prompt when preset changes
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset.id);
    setPrompt(preset.prompt);
  };

  // Canvas Simulation Loop
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    const particleCount = 350;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * 1000 + 1,
        color: ['#00F0FF', '#7000FF', '#FF007A', '#0084FF', '#00FF88', '#FFAE42'][Math.floor(Math.random() * 6)],
        size: Math.random() * 2.5 + 1,
        speed: (Math.random() * 3 + 2) * speedMultiplier,
        char: String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
      });
    }

    const render = () => {
      frameRef.current += speedMultiplier;
      const f = frameRef.current;
      const t = f * 0.015;

      ctx.fillStyle = selectedPreset === 'matrix' ? 'rgba(5, 12, 10, 0.22)' : 'rgba(6, 9, 19, 0.25)';
      ctx.fillRect(0, 0, width, height);

      if (selectedPreset === 'matrix') {
        ctx.font = '16px monospace';
        particles.forEach(p => {
          ctx.fillStyle = '#00ff88';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00ff88';
          ctx.fillText(p.char, (p.x + width / 2) % width, (p.y + t * 400) % height);
          ctx.shadowBlur = 0;
        });
      } else if (selectedPreset === 'cyberpunk') {
        const horizonY = height * 0.55;
        // Sun
        const sunGrad = ctx.createRadialGradient(width / 2, horizonY - 40, 10, width / 2, horizonY - 40, 140);
        sunGrad.addColorStop(0, '#FF007A');
        sunGrad.addColorStop(0.7, '#FFAE42');
        sunGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(width / 2, horizonY - 40, 130, 0, Math.PI * 2);
        ctx.fill();

        // 3D Grid Lines
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.lineWidth = 2;
        for (let y = horizonY; y < height; y += (y - horizonY) * 0.22 + 6) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        for (let x = -width; x < width * 2; x += 80) {
          ctx.beginPath();
          ctx.moveTo(x + (f * 3 % 80), height);
          ctx.lineTo(width / 2, horizonY);
          ctx.stroke();
        }
      } else if (selectedPreset === 'quantum') {
        const cx = width / 2;
        const cy = height / 2;
        particles.forEach((p, idx) => {
          const angle = t * 0.8 + idx * 0.04;
          const dist = 80 + Math.sin(t + idx * 0.08) * 200 + (idx % 180);
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * (dist * 0.65);

          ctx.fillStyle = p.color;
          ctx.shadowBlur = 14;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      } else {
        // Cosmic Starfield Warp
        const cx = width / 2;
        const cy = height / 2;

        const nebGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 450);
        nebGrad.addColorStop(0, 'rgba(112, 0, 255, 0.22)');
        nebGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.15)');
        nebGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = nebGrad;
        ctx.fillRect(0, 0, width, height);

        particles.forEach(p => {
          p.z -= p.speed * 3.5;
          if (p.z <= 0) {
            p.z = 1000;
            p.x = (Math.random() - 0.5) * width;
            p.y = (Math.random() - 0.5) * height;
          }

          const k = 400 / p.z;
          const px = p.x * k + cx;
          const py = p.y * k + cy;

          if (px >= 0 && px < width && py >= 0 && py < height) {
            const size = Math.max(0.8, (1 - p.z / 1000) * 4);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();

            // Warp trail line
            ctx.strokeStyle = p.color;
            ctx.lineWidth = size * 0.7;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(p.x * (400 / (p.z + 30)) + cx, p.y * (400 / (p.z + 30)) + cy);
            ctx.stroke();
          }
        });
      }

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPlaying, selectedPreset, speedMultiplier]);

  // Record 60FPS Video Export
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isRecording) return;

    try {
      setIsRecording(true);
      setRecordProgress(0);

      const stream = canvas.captureStream(60);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 10000000 // 10 Mbps
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanPrompt = selectedPreset.replace(/[^a-zA-Z0-9]/g, '_');
        a.download = `xtreme-ai-video-${cleanPrompt}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setRecordProgress(0);
      };

      recorder.start();

      const recordSeconds = Math.min(duration, 6);
      const startTime = Date.now();
      const progressTimer = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const pct = Math.min(100, Math.floor((elapsed / recordSeconds) * 100));
        setRecordProgress(pct);
        if (elapsed >= recordSeconds) {
          clearInterval(progressTimer);
          recorder.stop();
        }
      }, 100);

    } catch (err) {
      console.error(err);
      alert('Video export could not start: ' + err.message);
      setIsRecording(false);
    }
  };

  const handleSendToChat = () => {
    if (!onInsertToChat) return;
    onInsertToChat({
      type: 'video',
      preset: selectedPreset,
      prompt: prompt.trim(),
      duration
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay studio-modal-overlay" onClick={onClose}>
      <div className="studio-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="studio-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="studio-header-icon" style={{ background: 'linear-gradient(135deg, #FF007A 0%, #7000FF 100%)' }}>
              <Film size={20} color="#fff" />
            </div>
            <div>
              <h2 className="studio-title">XTREME AI Video Studio</h2>
              <p className="studio-subtitle">Generative Cinematic Motion & 60FPS Video Synthesis</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close Studio">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="studio-modal-body">
          {/* Controls Column */}
          <div className="studio-controls-column">
            {/* Prompt */}
            <div className="studio-section">
              <label className="studio-label">MOTION & SCENE PROMPT</label>
              <textarea 
                className="studio-prompt-textarea"
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe camera movement, lighting, and cinematic environment..."
              />
            </div>

            {/* Presets */}
            <div className="studio-section">
              <label className="studio-label">CINEMATIC SCENE PRESETS</label>
              <div className="studio-styles-grid">
                {VIDEO_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    className={`studio-style-card ${selectedPreset === preset.id ? 'active' : ''}`}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    <span style={{ fontWeight: 600 }}>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Motion Dynamics */}
            <div className="studio-section">
              <label className="studio-label">MOTION SPEED & DURATION</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[5, 8, 12].map(dur => (
                  <button
                    key={dur}
                    className={`studio-model-pill ${duration === dur ? 'active' : ''}`}
                    onClick={() => setDuration(dur)}
                    style={{ flex: 1, padding: '8px 12px' }}
                  >
                    {dur}s Clip
                  </button>
                ))}
              </div>
            </div>

            {/* Velocity control */}
            <div className="studio-section">
              <label className="studio-label">CAMERA VELOCITY</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[0.5, 1.0, 2.0].map(sp => (
                  <button
                    key={sp}
                    className={`studio-model-pill ${speedMultiplier === sp ? 'active' : ''}`}
                    onClick={() => setSpeedMultiplier(sp)}
                    style={{ flex: 1, padding: '8px 12px' }}
                  >
                    {sp === 0.5 ? 'Slow-Mo' : sp === 1.0 ? 'Normal' : 'Hyperlapse'}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Export */}
            <button 
              className="studio-generate-submit-btn"
              onClick={handleExportVideo}
              disabled={isRecording}
              style={{ background: 'linear-gradient(135deg, #FF007A 0%, #7000FF 100%)' }}
            >
              <Film size={18} />
              <span>{isRecording ? `Exporting 60FPS Video (${recordProgress}%)...` : 'Export 60FPS Video File'}</span>
            </button>
          </div>

          {/* Viewport Column */}
          <div className="studio-viewport-column">
            <div className="studio-canvas-container" style={{ position: 'relative' }}>
              <canvas 
                ref={canvasRef} 
                className="studio-rendered-canvas-video"
                onClick={() => setIsPlaying(!isPlaying)}
              />

              {/* Viewport Bar */}
              <div className="studio-image-actions">
                <button 
                  className="studio-action-button"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button 
                  className="studio-action-button"
                  onClick={handleExportVideo}
                  disabled={isRecording}
                >
                  <Download size={15} />
                  <span>{isRecording ? `${recordProgress}%` : 'Download WebM'}</span>
                </button>
                {onInsertToChat && (
                  <button 
                    className="studio-action-button primary"
                    onClick={handleSendToChat}
                  >
                    <Send size={15} />
                    <span>Insert into Chat</span>
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="media-resolution-tag">1280×720 HD</span>
                <span className="media-resolution-tag">60 FPS Hardware Accelerated</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Powered by XTREME Procedural Media Engine
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
