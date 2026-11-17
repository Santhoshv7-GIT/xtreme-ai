import React, { useState, useEffect } from 'react';
import { Download, Monitor, CheckCircle2, X, Laptop, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import XtremeLogoIcon from './XtremeLogoIcon';

export default function DownloadAppModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install directly via browser: Click the "Install" or "App available" icon on the right side of your browser address bar.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '90%',
          padding: '32px 28px',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.65)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ marginBottom: '14px' }}>
            <XtremeLogoIcon size={46} animated={true} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Install XTREME AI on Your PC / Laptop
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', margin: 0, maxWidth: '420px', lineHeight: 1.45 }}>
            Run XTREME AI as a dedicated desktop application with native performance, desktop shortcuts, and instant launch.
          </p>
        </div>

        {/* Option 1: Native Windows Installer (.exe) - Recommended */}
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(112, 0, 255, 0.08) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '18px',
            padding: '20px',
            marginBottom: '18px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(0, 240, 255, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
              Recommended for Windows
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>• Windows 10 & 11</span>
          </div>

          <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Laptop size={18} color="#00F0FF" />
            <span>Windows Desktop Setup (.exe)</span>
          </h3>

          <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <li>Installs as a native app with <strong>Desktop Icon</strong> & <strong>Start Menu shortcut</strong></li>
            <li>Runs in a clean, standalone desktop window without browser tabs or address bar</li>
            <li>Instant 1-second setup (Lightweight 183 KB installer)</li>
          </ul>

          <a 
            href="/downloads/XTREME-AI-Setup.exe" 
            download="XTREME-AI-Setup.exe"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)',
              color: '#ffffff',
              fontSize: '14.5px',
              fontWeight: 700,
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(0, 240, 255, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 240, 255, 0.5)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(0, 240, 255, 0.35)';
            }}
            onClick={() => {
              setTimeout(() => {
                alert('Download started! Once downloaded, double-click XTREME-AI-Setup.exe to install XTREME AI on your PC/laptop.');
              }, 600);
            }}
          >
            <Download size={18} />
            <span>Download XTREME-AI-Setup.exe</span>
          </a>
        </div>

        {/* Option 2: 1-Click Browser App (PWA) */}
        <div 
          style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Monitor size={22} color="var(--text-secondary)" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                1-Click Browser App (PWA)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Install instantly without downloading files
              </div>
            </div>
          </div>

          <button
            onClick={handlePwaInstall}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <span>Install</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Security / Quality Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '18px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
          <ShieldCheck size={15} color="#34a853" />
          <span>Verified Safe & Clean • No admin rights required • Uninstalls anytime</span>
        </div>
      </div>
    </div>
  );
}
