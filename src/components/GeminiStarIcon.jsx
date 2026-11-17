import React from 'react';

export default function GeminiStarIcon({ size = 24, className = '', animated = false }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={`${className} ${animated ? 'gemini-star-spin' : ''}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="geminiSparkleGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4285F4" />
          <stop offset="0.35" stopColor="#9B72CB" />
          <stop offset="0.75" stopColor="#D96570" />
          <stop offset="1" stopColor="#FFAE42" />
        </linearGradient>
        <filter id="sparkleGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path 
        d="M12 2C12.5 7.5 16.5 11.5 22 12C16.5 12.5 12.5 16.5 12 22C11.5 16.5 7.5 12.5 2 12C7.5 11.5 11.5 7.5 12 2Z" 
        fill="url(#geminiSparkleGradient)" 
        filter="url(#sparkleGlow)"
      />
      <circle cx="12" cy="12" r="1.5" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}
