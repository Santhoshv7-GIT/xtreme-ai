import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import XtremeLogoIcon from './XtremeLogoIcon';

export default function LiveVoiceModal({ isOpen, onClose, onUserSpoke }) {
  const [isListening, setIsListening] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechStatus, setSpeechStatus] = useState('Listening to your voice...');

  useEffect(() => {
    if (!isOpen) return;

    let recognition = null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setTranscript(current);

          // If final result reached
          if (event.results[event.results.length - 1].isFinal) {
            setSpeechStatus('XTREME AI is thinking...');
            setIsAiSpeaking(true);

            setTimeout(() => {
              if (onUserSpoke) {
                onUserSpoke(current);
              }
              // Speak response using SpeechSynthesis
              const reply = "I heard you loud and clear. Processing your multimodal instruction in real time.";
              if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(reply);
                utterance.onend = () => {
                  setIsAiSpeaking(false);
                  setSpeechStatus('Listening to your voice...');
                  setTranscript('');
                };
                window.speechSynthesis.speak(utterance);
              } else {
                setIsAiSpeaking(false);
                setSpeechStatus('Listening to your voice...');
              }
            }, 1000);
          }
        };

        recognition.onerror = (e) => {
          console.warn('Speech recognition status:', e);
          setSpeechStatus('Tap microphone to speak or test voice simulation');
        };

        recognition.start();
      } catch (err) {
        console.warn('Could not start live voice recognition:', err);
      }
    } else {
      setSpeechStatus('Speech Recognition not supported in this browser; simulation active');
    }

    return () => {
      if (recognition) {
        try { recognition.stop(); } catch (e) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, onUserSpoke]);

  if (!isOpen) return null;

  return (
    <div className="live-modal-overlay">
      {/* Top Header */}
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <XtremeLogoIcon size={26} />
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>XTREME Live</span>
          <span style={{ fontSize: '11px', background: 'rgba(66, 133, 244, 0.2)', color: '#7cacf8', padding: '3px 8px', borderRadius: '12px' }}>
            Ultra-Low Latency
          </span>
        </div>
        <button 
          className="icon-btn" 
          onClick={onClose} 
          style={{ color: '#fff', background: 'rgba(255,255,255,0.1)' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Pulsing Glowing Gemini Orb */}
      <div className="live-orb-container">
        <div 
          className="live-orb" 
          style={{
            transform: isAiSpeaking ? 'scale(1.28)' : 'scale(1.0)',
            transition: 'transform 0.3s ease'
          }}
        />
        <div style={{ position: 'absolute', zIndex: 10 }}>
          <XtremeLogoIcon size={72} animated={true} />
        </div>
      </div>

      {/* Transcript & Status */}
      <div style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
        <p style={{ fontSize: '16px', color: '#9aa0a6', marginBottom: '12px', letterSpacing: '0.02em' }}>
          {speechStatus}
        </p>
        {transcript && (
          <div style={{ 
            fontSize: '20px', 
            color: '#ffffff', 
            fontWeight: 500, 
            background: 'rgba(255,255,255,0.07)', 
            padding: '16px 24px', 
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}>
            "{transcript}"
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px' }}>
        <button 
          onClick={() => setIsListening(!isListening)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isListening ? '#4285f4' : 'rgba(255,255,255,0.15)',
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isListening ? '0 0 24px rgba(66, 133, 244, 0.6)' : 'none',
            transition: 'all 0.2s ease'
          }}
          title={isListening ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isListening ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <button 
          onClick={onClose}
          style={{
            padding: '12px 28px',
            borderRadius: '9999px',
            background: 'rgba(234, 67, 53, 0.2)',
            border: '1px solid rgba(234, 67, 53, 0.4)',
            color: '#ea4335',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          End Live Session
        </button>
      </div>
    </div>
  );
}
