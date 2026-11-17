import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, ArrowUpCircle, X, Sparkles, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import XtremeLogoIcon from './XtremeLogoIcon';
import { CURRENT_APP_VERSION, checkForAppUpdates, applyAppUpdate } from '../utils/updateManager';

export default function UpdateModal({ isOpen, onClose }) {
  const [checking, setChecking] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);

  const runCheck = async () => {
    setChecking(true);
    const result = await checkForAppUpdates();
    // Artificial small delay for visual polish
    await new Promise(r => setTimeout(r, 600));
    setUpdateInfo(result);
    setChecking(false);
  };

  useEffect(() => {
    if (isOpen) {
      runCheck();
    } else {
      setUpdating(false);
      setProgressPercent(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyUpdate = async () => {
    setUpdating(true);
    setProgressPercent(15);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Animate progress smoothly
    let p = 15;
    const interval = setInterval(() => {
      p += 15;
      if (p >= 90) {
        clearInterval(interval);
      }
      setProgressPercent(Math.min(p, 90));
    }, 120);

    setTimeout(async () => {
      clearInterval(interval);
      setProgressPercent(100);
      await applyAppUpdate();
    }, 900);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 10000 }}>
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '92%',
          padding: '28px 24px',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.7)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={updating}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-tertiary)',
            cursor: updating ? 'not-allowed' : 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={e => !updating && (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ marginBottom: '12px' }}>
            <XtremeLogoIcon size={44} animated={checking || updating} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            XTREME AI App Updater
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
            <span>Installed Version: <strong style={{ color: 'var(--text-primary)' }}>v{CURRENT_APP_VERSION}</strong></span>
            {updateInfo?.serverVersion && (
              <span>• Latest Server: <strong style={{ color: '#00F0FF' }}>v{updateInfo.serverVersion}</strong></span>
            )}
          </div>
        </div>

        {/* Status Card */}
        <div 
          style={{
            background: updateInfo?.hasUpdate 
              ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(112, 0, 255, 0.1))'
              : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${updateInfo?.hasUpdate ? 'rgba(0, 240, 255, 0.4)' : 'var(--border-color)'}`,
            borderRadius: '16px',
            padding: '18px 20px',
            marginBottom: '20px'
          }}
        >
          {checking ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 0', color: 'var(--text-secondary)' }}>
              <RefreshCw size={18} className="gemini-star-spin" color="#00F0FF" />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Checking for latest production release...</span>
            </div>
          ) : updateInfo?.hasUpdate ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <ArrowUpCircle size={22} color="#00F0FF" />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    New Update Available!
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Version {updateInfo.serverVersion} is ready to apply.
                  </div>
                </div>
              </div>

              {updateInfo.highlights && updateInfo.highlights.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#00F0FF', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    What's New:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {updateInfo.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={24} color="#34a853" />
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  You are using the latest version
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  All newest models and features are actively synced with production.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar (While updating) */}
        {updating && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <span>Flushing stale caches & loading latest build...</span>
              <span style={{ fontWeight: 600, color: '#00F0FF' }}>{progressPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${progressPercent}%`, 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #00F0FF, #7000FF)', 
                  transition: 'width 0.2s ease' 
                }} 
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          {updateInfo?.hasUpdate ? (
            <button
              onClick={handleApplyUpdate}
              disabled={updating || checking}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)',
                color: '#ffffff',
                fontSize: '14.5px',
                fontWeight: 700,
                border: 'none',
                cursor: (updating || checking) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(0, 240, 255, 0.35)',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw size={16} className={updating ? 'gemini-star-spin' : ''} />
              <span>{updating ? 'Updating App...' : 'Update & Restart App Now'}</span>
            </button>
          ) : (
            <button
              onClick={handleApplyUpdate}
              disabled={updating || checking}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                color: '#00F0FF',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: (updating || checking) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw size={15} className={updating ? 'gemini-star-spin' : ''} />
              <span>{updating ? 'Re-syncing...' : 'Force Re-sync / Clear Cache'}</span>
            </button>
          )}

          <button
            onClick={runCheck}
            disabled={checking || updating}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: (checking || updating) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseOver={e => !checking && (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >
            <RefreshCw size={13} className={checking ? 'gemini-star-spin' : ''} />
            <span>Check for Updates Again</span>
          </button>
        </div>

        {/* Security badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
          <ShieldCheck size={14} color="#34a853" />
          <span>Your conversations and settings are preserved during updates</span>
        </div>
      </div>
    </div>
  );
}
