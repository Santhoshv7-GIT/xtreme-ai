import React, { useState, useEffect, useRef } from 'react';
import { X, Moon, Sun, Trash2, Check, LogOut, ShieldCheck, Key, UserCheck, AlertCircle } from 'lucide-react';

// Official Google "G" 4-color SVG Icon
export function GoogleGIcon({ size = 20 }) {
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

export default function SettingsModal({
  isOpen,
  onClose,
  theme = 'dark',
  onThemeChange,
  googleUser,
  onGoogleSignIn,
  onGoogleSignOut,
  onClearAllChats
}) {
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [clientId, setClientId] = useState(() => localStorage.getItem('xtreme_google_client_id') || '');
  const [showClientConfig, setShowClientConfig] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const googleBtnRef = useRef(null);

  // Initialize Google Identity Services button if Client ID exists
  useEffect(() => {
    if (!isOpen || googleUser) return;

    if (window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId.trim(),
          callback: (response) => {
            const data = parseJwt(response.credential);
            if (data) {
              onGoogleSignIn({
                name: data.name || data.given_name || 'Google User',
                email: data.email,
                avatar: data.picture || (data.name ? data.name[0].toUpperCase() : 'G'),
                sub: data.sub
              });
              setErrorMsg('');
            }
          }
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: theme === 'dark' ? 'filled_black' : 'outline',
            size: 'large',
            shape: 'pill',
            text: 'signin_with',
            width: 280
          });
        }
      } catch (err) {
        console.warn('GIS error:', err);
      }
    }
  }, [isOpen, googleUser, clientId, theme]);

  if (!isOpen) return null;

  // Handle direct Google profile sign in
  const handleDirectSignIn = (e) => {
    e.preventDefault();
    if (!customName.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    onGoogleSignIn({
      name: customName.trim(),
      email: customEmail.trim(),
      avatar: customName.trim()[0].toUpperCase()
    });
    setErrorMsg('');
    setCustomName('');
    setCustomEmail('');
  };

  const handleSaveClientId = (newId) => {
    setClientId(newId);
    localStorage.setItem('xtreme_google_client_id', newId.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="modal-title" style={{ fontSize: '18px', fontWeight: 600 }}>Settings & Account</span>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ gap: '22px' }}>
          
          {/* =========================================================================
              1. GOOGLE SIGN-IN SECTION
              ========================================================================= */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GoogleGIcon size={18} />
              Google Account
            </label>

            {googleUser ? (
              /* Signed In Profile Card */
              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4285F4, #34A853)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(66, 133, 244, 0.4)'
                  }}>
                    {googleUser.avatar?.startsWith('http') ? (
                      <img src={googleUser.avatar} alt={googleUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>{googleUser.avatar || googleUser.name?.[0]?.toUpperCase() || 'G'}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {googleUser.name}
                      </span>
                      <ShieldCheck size={15} color="#34A853" title="Verified Google Account" />
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                      {googleUser.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onGoogleSignOut}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Sign out"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              /* Signed Out - Login Box for Any User */
              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <GoogleGIcon size={22} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Sign in with your Google Account
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      Synchronize your conversations and personal settings
                    </div>
                  </div>
                </div>

                {/* Google Identity Services Render Target (if client ID is present) */}
                {clientId && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                    <div ref={googleBtnRef} />
                  </div>
                )}

                {/* Direct Google Login Form for Any User */}
                <form onSubmit={handleDirectSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. John Doe"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      style={{ padding: '9px 12px', fontSize: '13.5px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                      Google Email Address
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. yourname@gmail.com"
                      value={customEmail}
                      onChange={e => setCustomEmail(e.target.value)}
                      style={{ padding: '9px 12px', fontSize: '13.5px' }}
                    />
                  </div>

                  {errorMsg && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ea4335', fontSize: '12px' }}>
                      <AlertCircle size={14} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      background: '#4285F4',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(66, 133, 244, 0.4)',
                      transition: 'all 0.15s ease',
                      marginTop: '4px'
                    }}
                  >
                    <GoogleGIcon size={16} />
                    <span>Sign in as this user</span>
                  </button>
                </form>

                {/* Optional Google Cloud OAuth Client ID Configuration */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setShowClientConfig(!showClientConfig)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-tertiary)',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <Key size={12} />
                    <span>{showClientConfig ? 'Hide' : 'Configure'} Google Cloud OAuth Client ID (Optional)</span>
                  </button>

                  {showClientConfig && (
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="xxxxxxxxxxxx-xxxxxxxx.apps.googleusercontent.com"
                        value={clientId}
                        onChange={e => handleSaveClientId(e.target.value)}
                        style={{ fontSize: '12px', padding: '6px 10px' }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Paste your Web Client ID from Google Cloud Console to enable official Google One-Tap sign-in button.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              2. THEME SELECTION SECTION (DARK / LIGHT MODE)
              ========================================================================= */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '14px', fontWeight: 600 }}>
              Appearance
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              
              {/* Dark Mode Card */}
              <div
                onClick={() => onThemeChange('dark')}
                style={{
                  background: theme === 'dark' ? 'rgba(66, 133, 244, 0.12)' : 'var(--bg-main)',
                  border: theme === 'dark' ? '2px solid #4285F4' : '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#131314',
                  border: '1px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7cacf8'
                }}>
                  <Moon size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Dark mode
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                    Deep Space theme
                  </div>
                </div>
                {theme === 'dark' && (
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} color="#fff" />
                  </div>
                )}
              </div>

              {/* Light Mode Card */}
              <div
                onClick={() => onThemeChange('light')}
                style={{
                  background: theme === 'light' ? 'rgba(66, 133, 244, 0.12)' : 'var(--bg-main)',
                  border: theme === 'light' ? '2px solid #4285F4' : '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbc05'
                }}>
                  <Sun size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Light mode
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                    Clean bright theme
                  </div>
                </div>
                {theme === 'light' && (
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} color="#fff" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================================
              3. DATA & CHAT HISTORY
              ========================================================================= */}
          <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => {
                if (window.confirm('Delete all conversations and chat history?')) {
                  onClearAllChats();
                  onClose();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(234, 67, 53, 0.1)',
                border: '1px solid rgba(234, 67, 53, 0.3)',
                color: '#ea4335',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={14} />
              <span>Clear Chat History</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 24px',
              borderRadius: '9999px',
              background: 'var(--accent-blue)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 500,
              fontSize: '13.5px',
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
