import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Download, Maximize2, Minimize2, Video, Sparkles, Film, Check } from 'lucide-react';

export default function VideoGenerationCard({ media }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(media?.duration || 8);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const stateRef = useRef({ time: 0, lastTick: Date.now() });

  const preset = media?.preset || 'cosmic';
  const prompt = media?.prompt || 'Cinematic Motion Simulation';

  // Animation Engine for Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set resolution
    const width = 854;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    // Seed particles
    const particleCount = 280;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * 1000 + 1,
        color: ['#00F0FF', '#7000FF', '#FF007A', '#0084FF', '#4285F4'][Math.floor(Math.random() * 5)],
        size: Math.random() * 2 + 1,
        speed: Math.random() * 3 + 2,
        char: String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      const t = frame * 0.02;

      // Clear with trail effect
      ctx.fillStyle = preset === 'matrix' ? 'rgba(5, 12, 10, 0.22)' : 'rgba(6, 9, 19, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Render preset scenes
      if (preset === 'matrix') {
        ctx.font = '14px monospace';
        particles.forEach(p => {
          ctx.fillStyle = '#00ff88';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00ff88';
          ctx.fillText(p.char, (p.x + width / 2) % width, (p.y + t * 250) % height);
          ctx.shadowBlur = 0;
        });
      } else if (preset === 'cyberpunk') {
        // Neon Horizon & Grid Flythrough
        const horizonY = height * 0.55;
        
        // Sun
        const sunGrad = ctx.createRadialGradient(width / 2, horizonY - 30, 10, width / 2, horizonY - 30, 90);
        sunGrad.addColorStop(0, '#FF007A');
        sunGrad.addColorStop(0.7, '#FFAE42');
        sunGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(width / 2, horizonY - 30, 85, 0, Math.PI * 2);
        ctx.fill();

        // 3D Grid
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
        ctx.lineWidth = 1.5;
        const gridSpeed = (frame * 3) % 40;
        for (let y = horizonY; y < height; y += (y - horizonY) * 0.25 + 5) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        for (let x = -width; x < width * 2; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x + (frame * 2 % 60), height);
          ctx.lineTo(width / 2, horizonY);
          ctx.stroke();
        }
      } else if (preset === 'quantum' || preset === 'particles') {
        // Swirling Lorenz Particle Vortex
        const cx = width / 2;
        const cy = height / 2;
        particles.forEach((p, idx) => {
          const angle = t * 0.8 + idx * 0.05;
          const dist = 50 + Math.sin(t + idx * 0.1) * 120 + (idx % 120);
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * (dist * 0.6);

          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      } else {
        // Default: 3D Cosmic Starfield Warp Drive
        const cx = width / 2;
        const cy = height / 2;
        
        // Nebula Glow in background
        const nebGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 300);
        nebGrad.addColorStop(0, 'rgba(112, 0, 255, 0.18)');
        nebGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.12)');
        nebGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = nebGrad;
        ctx.fillRect(0, 0, width, height);

        particles.forEach(p => {
          p.z -= p.speed * 2.5;
          if (p.z <= 0) {
            p.z = 1000;
            p.x = (Math.random() - 0.5) * width;
            p.y = (Math.random() - 0.5) * height;
          }

          const k = 300 / p.z;
          const px = p.x * k + cx;
          const py = p.y * k + cy;

          if (px >= 0 && px < width && py >= 0 && py < height) {
            const size = Math.max(0.8, (1 - p.z / 1000) * 3.5);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();

            // Warp trail line
            ctx.strokeStyle = p.color;
            ctx.lineWidth = size * 0.6;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(p.x * (300 / (p.z + 25)) + cx, p.y * (300 / (p.z + 25)) + cy);
            ctx.stroke();
          }
        });
      }

      // Update progress bar
      const loopTime = (frame % (duration * 60)) / (duration * 60);
      setProgress(loopTime);

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
  }, [isPlaying, preset, duration]);

  // Export & Download Video (.webm or .mp4) using MediaRecorder at 60 FPS
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isRecording) return;

    try {
      setIsRecording(true);
      setRecordProgress(0);

      const stream = canvas.captureStream(60);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000 // 8 Mbps high quality
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
        const cleanPrompt = prompt.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_');
        a.download = `xtreme-ai-video-${cleanPrompt}-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setRecordProgress(0);
      };

      recorder.start();

      // Record for the specified duration (e.g. 5 seconds for fast export)
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
      console.error('Video recording failed', err);
      alert('Video export is not supported by your browser.');
      setIsRecording(false);
    }
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className={`generated-media-card video-card ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Header */}
      <div className="media-card-header">
        <div className="media-card-badge">
          <Film size={13} className="gemini-star-spin" />
          <span>XTREME Motion Video Engine</span>
          <span className="media-style-pill">{preset.toUpperCase()}</span>
        </div>
        <div className="media-card-meta">
          <span className="media-resolution-tag">60 FPS • HD</span>
          <span className="media-seed-tag">{duration}s Clip</span>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="media-preview-box video-preview-box">
        <canvas 
          ref={canvasRef} 
          className="media-rendered-video-canvas"
          onClick={togglePlay}
        />

        {/* Video Overlays */}
        <div className="video-playback-controls">
          <button 
            className="video-ctrl-btn"
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>

          {/* Progress timeline */}
          <div className="video-scrubber-track">
            <div 
              className="video-scrubber-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <span className="video-time-indicator">
            {Math.floor(progress * duration)}s / {duration}s
          </span>

          <button 
            className="video-ctrl-btn"
            onClick={handleExportVideo}
            disabled={isRecording}
            title="Download Video (.webm 60FPS)"
          >
            {isRecording ? <span style={{ fontSize: '11px', fontWeight: 700 }}>{recordProgress}%</span> : <Download size={14} />}
          </button>
        </div>

        {/* Recording Overlay */}
        {isRecording && (
          <div className="video-recording-toast">
            <div className="video-rec-dot" />
            <span>Rendering 60FPS Video... {recordProgress}%</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="media-card-footer">
        <div className="media-prompt-text" title={prompt}>
          <strong>Motion Prompt:</strong> "{prompt}"
        </div>
        <div className="media-footer-actions">
          <button 
            className="media-action-pill"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button 
            className="media-action-pill primary"
            onClick={handleExportVideo}
            disabled={isRecording}
            title="Export high-resolution 60FPS video file"
          >
            <Download size={12} />
            <span>{isRecording ? `Exporting (${recordProgress}%)` : 'Export Video (MP4/WebM)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
