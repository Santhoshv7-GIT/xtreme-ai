import React from 'react';

export default function XtremeLogoIcon({ size = 28, className = '', animated = false }) {
  const borderRadius = Math.max(6, Math.round(size * 0.22));

  return (
    <div
      className={`xtreme-logo-container ${className} ${animated ? 'xtreme-logo-pulse' : ''}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
        boxShadow: '0 0 14px rgba(0, 240, 255, 0.4), 0 0 24px rgba(112, 0, 255, 0.25)',
        border: '1.5px solid rgba(0, 240, 255, 0.55)',
        background: '#070a14',
        userSelect: 'none'
      }}
    >
      <img
        src="/logo-mascot.png"
        alt="XTREME AI"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
        onError={(e) => {
          // Fallback if image fails
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}
