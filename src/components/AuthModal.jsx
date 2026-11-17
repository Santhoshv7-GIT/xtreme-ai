import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, ArrowLeft, Check, ShieldCheck, LogOut, Moon, Sun, Trash2 } from 'lucide-react';

// Official Google "G" 4-color SVG Icon
export function GoogleGIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

// Apple SVG Icon
export function AppleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.47c.65-.79 1.09-1.89.97-2.99-.95.04-2.1.63-2.78 1.42-.59.68-1.11 1.8-1 2.87 1.06.08 2.16-.54 2.81-1.3" />
    </svg>
  );
}

// Helper to decode Google JWT token
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const DEFAULT_GOOGLE_CLIENT_ID = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID)
  ? import.meta.env.VITE_GOOGLE_CLIENT_ID
  : '792386070323-ol7uiboc74b2lkkbl5692k1thg7krebi.apps.googleusercontent.com';

export default function AuthModal({
  isOpen,
  onClose,
  theme = 'dark',
  onThemeChange,
  googleUser,
  onSignIn,
  onSignOut,
  onClearAllChats
}) {
  const [emailInput, setEmailInput] = useState('');
  const [step, setStep] = useState('main'); // 'main' | 'namePrompt' | 'phonePrompt' | 'googlePrompt'
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [clientIdInput, setClientIdInput] = useState(() => localStorage.getItem('xtreme_google_client_id') || DEFAULT_GOOGLE_CLIENT_ID);

  useEffect(() => {
    if (!isOpen) {
      setStep('main');
      setEmailInput('');
      setNameInput('');
      setPhoneInput('');
      setErrorMessage('');
    }
  }, [isOpen]);

  // Check for OAuth hash token on redirect or popup response
  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('access_token')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
          .then(r => r.json())
          .then(profile => {
            if (profile && profile.email) {
              onSignIn({
                name: profile.name || profile.given_name || 'Google User',
                email: profile.email,
                avatar: profile.picture || profile.name?.[0]?.toUpperCase() || 'G',
                sub: profile.sub,
                provider: 'google'
              });
              window.history.replaceState(null, '', window.location.pathname);
              onClose();
            }
          })
          .catch(e => console.error(e));
      }
    }
  }, [onSignIn, onClose]);

  if (!isOpen) return null;

  // Real Google OAuth 2.0 Popup Trigger
  const triggerRealGooglePopup = (cid) => {
    const activeId = (cid || clientIdInput || localStorage.getItem('xtreme_google_client_id') || DEFAULT_GOOGLE_CLIENT_ID).trim();

    setErrorMessage('');

    // Method 1: Google Identity Services OAuth 2.0 Token Client (Official popup)
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: activeId,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profile = await res.json();
                onSignIn({
                  name: profile.name || profile.given_name || 'Google User',
                  email: profile.email,
                  avatar: profile.picture || profile.name?.[0]?.toUpperCase() || 'G',
                  sub: profile.sub,
                  provider: 'google'
                });
                onClose();
              } catch (e) {
                setErrorMessage('Failed to fetch user profile from Google: ' + e.message);
              }
            } else if (tokenResponse?.error) {
              setErrorMessage('Google Sign-In error: ' + (tokenResponse.error_description || tokenResponse.error));
            }
          },
          error_callback: (err) => {
            console.error('Google OAuth error:', err);
            if (err?.type === 'popup_closed') {
              setErrorMessage('Google Sign-In popup was closed.');
            } else {
              setErrorMessage(err?.message || 'Google Sign-In popup closed.');
            }
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('OAuth token client error:', err);
      }
    }

    // Method 2: Standard Google OAuth 2.0 Authorization Endpoint Popup
    const redirectUri = window.location.origin;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(activeId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;
    window.open(authUrl, 'GoogleSignIn', 'width=520,height=620,left=200,top=100');
  };

  // Handle Google button click - Opens official Google accounts.google.com popup directly!
  const handleGoogleClick = () => {
    triggerRealGooglePopup(DEFAULT_GOOGLE_CLIENT_ID);
  };

  const handleSaveAndLaunchGoogle = (e) => {
    e.preventDefault();
    const cleanId = clientIdInput.trim();
    if (!cleanId || !cleanId.includes('.apps.googleusercontent.com')) {
      setErrorMessage('Please enter a valid Google Client ID (ending in .apps.googleusercontent.com)');
      return;
    }
    localStorage.setItem('xtreme_google_client_id', cleanId);
    triggerRealGooglePopup(cleanId);
  };

  // Handle email submit
  const handleEmailContinue = (e) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    setErrorMessage('');
    const derivedName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
    setNameInput(derivedName.charAt(0).toUpperCase() + derivedName.slice(1));
    setStep('namePrompt');
  };

  // Complete email sign in with name
  const handleCompleteEmailSignIn = (e) => {
    e.preventDefault();
    const cleanName = nameInput.trim() || 'XTREME User';
    onSignIn({
      name: cleanName,
      email: emailInput.trim(),
      avatar: cleanName[0].toUpperCase(),
      provider: 'email'
    });
    onClose();
  };

  // Handle Apple Sign in
  const handleAppleClick = () => {
    onSignIn({
      name: 'Apple User',
      email: 'user@privaterelay.appleid.com',
      avatar: '🍎',
      provider: 'apple'
    });
    onClose();
  };

  // Handle Phone Sign In
  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!phoneInput.trim() || phoneInput.trim().length < 7) {
      setErrorMessage('Please enter a valid phone number');
      return;
    }
    onSignIn({
      name: `User ${phoneInput.trim().slice(-4)}`,
      email: `${phoneInput.trim()}@phone.xtremeai.com`,
      avatar: '📱',
      phone: phoneInput.trim(),
      provider: 'phone'
    });
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#202123',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65)',
          padding: '32px 28px',
          position: 'relative',
          color: '#ffffff',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          animation: 'modalFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
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
            color: 'rgba(255, 255, 255, 0.5)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease'
          }}
          onMouseOver={e => e.currentTarget.style.color = '#ffffff'}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
        >
          <X size={18} />
        </button>

        {/* =========================================================================
            ALREADY SIGNED IN VIEW (Account Info & Settings)
            ========================================================================= */}
        {googleUser ? (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 4px 0', textAlign: 'center' }}>
              Your Account
            </h2>
            <p style={{ fontSize: '13px', color: '#8e8ea0', textAlign: 'center', margin: '0 0 24px 0' }}>
              You are currently signed in
            </p>

            {/* Profile Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4285F4, #34A853)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 700,
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {googleUser.avatar?.startsWith('http') ? (
                  <img src={googleUser.avatar} alt={googleUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{googleUser.avatar || googleUser.name?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {googleUser.name}
                  </span>
                  <ShieldCheck size={15} color="#34A853" />
                </div>
                <div style={{ fontSize: '12.5px', color: '#8e8ea0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {googleUser.email}
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#b4b4b4', marginBottom: '8px', display: 'block' }}>
                Appearance
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div
                  onClick={() => onThemeChange('dark')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: theme === 'dark' ? 'rgba(66, 133, 244, 0.15)' : 'rgba(255,255,255,0.04)',
                    border: theme === 'dark' ? '1.5px solid #4285F4' : '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Moon size={16} color="#7cacf8" />
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>Dark</span>
                  {theme === 'dark' && <Check size={14} color="#4285F4" style={{ marginLeft: 'auto' }} />}
                </div>

                <div
                  onClick={() => onThemeChange('light')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: theme === 'light' ? 'rgba(66, 133, 244, 0.15)' : 'rgba(255,255,255,0.04)',
                    border: theme === 'light' ? '1.5px solid #4285F4' : '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Sun size={16} color="#fbbc05" />
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>Light</span>
                  {theme === 'light' && <Check size={14} color="#4285F4" style={{ marginLeft: 'auto' }} />}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  if (window.confirm('Clear all chat conversations?')) {
                    onClearAllChats();
                    onClose();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px',
                  borderRadius: '9999px',
                  background: 'transparent',
                  border: '1px solid rgba(234, 67, 53, 0.3)',
                  color: '#ea4335',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} />
                <span>Clear Chat History</span>
              </button>

              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                <LogOut size={15} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        ) : step === 'namePrompt' ? (
          /* =========================================================================
              NAME PROMPT STEP FOR EMAIL LOGIN
              ========================================================================= */
          <div>
            <button
              onClick={() => setStep('main')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8e8ea0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                marginBottom: '16px',
                padding: 0
              }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <h2 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 6px 0', textAlign: 'center' }}>
              What's your name?
            </h2>
            <p style={{ fontSize: '13.5px', color: '#b4b4b4', textAlign: 'center', margin: '0 0 24px 0' }}>
              Signing in as <strong style={{ color: '#fff' }}>{emailInput}</strong>
            </p>

            <form onSubmit={handleCompleteEmailSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff', marginBottom: '8px', display: 'block' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. John Doe"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#0d0d0d',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: '9999px',
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '10px',
                  boxShadow: '0 2px 8px rgba(255,255,255,0.2)'
                }}
              >
                Continue
              </button>
            </form>
          </div>
        ) : step === 'phonePrompt' ? (
          /* =========================================================================
              PHONE NUMBER SIGN-IN STEP
              ========================================================================= */
          <div>
            <button
              onClick={() => setStep('main')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8e8ea0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                marginBottom: '16px',
                padding: 0
              }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <h2 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 6px 0', textAlign: 'center' }}>
              Enter your phone number
            </h2>
            <p style={{ fontSize: '13.5px', color: '#b4b4b4', textAlign: 'center', margin: '0 0 24px 0' }}>
              We’ll link your account via your phone number
            </p>

            <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff', marginBottom: '8px', display: 'block' }}>
                  Phone number
                </label>
                <input
                  type="tel"
                  autoFocus
                  required
                  placeholder="+1 (555) 000-0000"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#0d0d0d',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {errorMessage && (
                <div style={{ color: '#ea4335', fontSize: '12.5px' }}>
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: '9999px',
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Continue with phone
              </button>
            </form>
          </div>
        ) : step === 'googlePrompt' ? (
          /* =========================================================================
              REAL GOOGLE OAUTH POPUP SETUP
              ========================================================================= */
          <div>
            <button
              onClick={() => setStep('main')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8e8ea0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                marginBottom: '16px',
                padding: 0
              }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <GoogleGIcon size={28} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 6px 0', textAlign: 'center' }}>
              Connect Google OAuth
            </h2>
            <p style={{ fontSize: '13px', color: '#b4b4b4', textAlign: 'center', margin: '0 0 18px 0', lineHeight: 1.45 }}>
              To open the official <strong style={{ color: '#fff' }}>accounts.google.com</strong> popup, paste your Google Cloud Client ID:
            </p>

            <form onSubmit={handleSaveAndLaunchGoogle} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 500, color: '#ffffff', marginBottom: '6px', display: 'block' }}>
                  Google Client ID
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="xxxx.apps.googleusercontent.com"
                  value={clientIdInput}
                  onChange={e => setClientIdInput(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#0d0d0d',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '11px 14px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              {errorMessage && (
                <div style={{ color: '#ea4335', fontSize: '12px' }}>
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: '9999px',
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <GoogleGIcon size={16} />
                <span>Save & Open Real Google Popup</span>
              </button>

              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ color: '#7cacf8', fontSize: '12px', textDecoration: 'none', display: 'inline-block' }}
                >
                  Get your free Client ID in Google Cloud Console →
                </a>
              </div>
            </form>
          </div>
        ) : (
          /* =========================================================================
              MAIN EXACT VIEW FROM USER'S SCREENSHOT
              ========================================================================= */
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 6px 0', textAlign: 'center' }}>
              Log in or sign up
            </h2>
            <p style={{ fontSize: '13px', color: '#b4b4b4', textAlign: 'center', margin: '0 0 24px 0', lineHeight: 1.45 }}>
              You’ll get smarter responses and can upload files, images, and more.
            </p>

            {/* Social Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '13px 20px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'background 0.15s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                <GoogleGIcon size={18} />
                <span>Continue with Google</span>
              </button>

              {/* Continue with Apple */}
              <button
                type="button"
                onClick={handleAppleClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '13px 20px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'background 0.15s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                <AppleIcon size={18} />
                <span>Continue with Apple</span>
              </button>

              {/* Continue with phone */}
              <button
                type="button"
                onClick={() => setStep('phonePrompt')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '13px 20px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  boxSizing: 'border-box',
                  transition: 'background 0.15s ease'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                <Phone size={16} />
                <span>Continue with phone</span>
              </button>
            </div>

            {/* OR Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '22px 0',
              gap: '12px'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.05em' }}>
                OR
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
            </div>

            {/* Email Address Form */}
            <form onSubmit={handleEmailContinue}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#ffffff',
                  marginBottom: '6px',
                  textAlign: 'left'
                }}>
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder=""
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#0d0d0d',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                  onFocus={e => e.target.style.borderColor = '#ffffff'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                />
              </div>

              {errorMessage && (
                <div style={{ color: '#ea4335', fontSize: '12.5px', marginBottom: '10px' }}>
                  {errorMessage}
                </div>
              )}

              {/* Continue Action Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: '9999px',
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                  boxShadow: '0 2px 8px rgba(255,255,255,0.15)'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#e5e5e5'}
                onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
              >
                Continue
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
