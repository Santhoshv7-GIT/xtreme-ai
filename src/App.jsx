import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Plus, MessageSquare, Settings as SettingsIcon, Moon, Sun, 
  HelpCircle, ChevronDown, Sparkles, Send, Mic, Globe, Image as ImageIcon,
  Paperclip, Volume2, VolumeX, Copy, Check, ThumbsUp, ThumbsDown, 
  RefreshCw, Share2, Square, Trash2, Edit3, ArrowRight, ExternalLink, Download,
  Code2, Film, Wand2
} from 'lucide-react';
import confetti from 'canvas-confetti';

import XtremeLogoIcon from './components/XtremeLogoIcon';
import MarkdownRenderer from './components/MarkdownRenderer';
import ThinkingAccordion from './components/ThinkingAccordion';
import SearchGroundingBar from './components/SearchGroundingBar';
import LiveVoiceModal from './components/LiveVoiceModal';
import CanvasModal from './components/CanvasModal';
import AuthModal from './components/AuthModal';
import DownloadAppModal from './components/DownloadAppModal';
import UpdateModal from './components/UpdateModal';
import SampleImagesPicker, { SAMPLE_IMAGES } from './components/SampleImagesPicker';
import ImageGenerationCard from './components/ImageGenerationCard';
import VideoGenerationCard from './components/VideoGenerationCard';
import ImageStudioModal from './components/ImageStudioModal';
import VideoStudioModal from './components/VideoStudioModal';
import { AVAILABLE_MODELS, sendGeminiPrompt, DEFAULT_GEMINI_KEY } from './utils/aiEngine';
import { checkForAppUpdates } from './utils/updateManager';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('xtreme_theme') || 'dark');

  // Google User Account state (null by default so any new user can sign in)
  const [googleUser, setGoogleUser] = useState(() => {
    const saved = localStorage.getItem('xtreme_google_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  // Settings state
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('xtreme_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      apiKey: parsed.apiKey || DEFAULT_GEMINI_KEY,
      userName: parsed.userName || 'Santhosh V',
      systemInstruction: parsed.systemInstruction || 'You are XTREME AI, a world-class multimodal intelligent assistant. You are brilliant, articulate, precise, and creative.',
      speechRate: parsed.speechRate || 1.0,
      defaultModel: parsed.defaultModel || 'xtreme-fire-3.0'
    };
  });

  // Chat sessions state
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('xtreme_chats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const defaultChatId = 'chat-' + Date.now();
    return [{
      id: defaultChatId,
      title: 'New conversation',
      createdAt: new Date().toISOString(),
      messages: []
    }];
  });

  const [activeChatId, setActiveChatId] = useState(() => chats[0]?.id);
  const [selectedModelId, setSelectedModelId] = useState(settings.defaultModel || 'xtreme-fire-3.0');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  // Input bar state
  const [inputPrompt, setInputPrompt] = useState('');
  const [stagedImages, setStagedImages] = useState([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [searchProgressStatus, setSearchProgressStatus] = useState('');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);
  const [isSamplePickerOpen, setIsSamplePickerOpen] = useState(false);
  const [canvasModalState, setCanvasModalState] = useState({ isOpen: false, code: '', language: 'html' });
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [isVideoStudioOpen, setIsVideoStudioOpen] = useState(false);
  const [isListeningDictation, setIsListeningDictation] = useState(false);

  // Audio TTS state
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const isAutoScrollEnabledRef = useRef(true);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const modelDropdownRef = useRef(null);

  // Close model dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) {
        setModelDropdownOpen(false);
      }
    };
    if (modelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modelDropdownOpen]);

  // Apply Theme class
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('xtreme_theme', theme);
  }, [theme]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('xtreme_settings', JSON.stringify(settings));
  }, [settings]);

  // Persist chats
  useEffect(() => {
    localStorage.setItem('xtreme_chats', JSON.stringify(chats));
  }, [chats]);

  // Check for app updates automatically on mount & periodically
  useEffect(() => {
    const checkUpdates = async () => {
      const res = await checkForAppUpdates();
      if (res?.hasUpdate) {
        setHasNewUpdate(true);
      }
    };
    checkUpdates();
    const interval = setInterval(checkUpdates, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Track user scroll position in the messages area
  const handleMessagesScroll = () => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    const nearBottom = distanceFromBottom < 80;
    
    isAutoScrollEnabledRef.current = nearBottom;
    setUserScrolledUp(!nearBottom);
  };

  // Explicit smooth scroll to bottom
  const scrollToBottomSmooth = () => {
    isAutoScrollEnabledRef.current = true;
    setUserScrolledUp(false);
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll when messages stream or generate ONLY IF user is at bottom
  useEffect(() => {
    if (isAutoScrollEnabledRef.current && scrollAreaRef.current) {
      // Direct non-blocking assignment ensures user's scroll gestures are never locked or fought
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [streamingText, isGenerating]);

  // When switching chats, snap to the bottom of the conversation
  useEffect(() => {
    isAutoScrollEnabledRef.current = true;
    setUserScrolledUp(false);
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 40);
  }, [activeChatId]);

  // Active chat getter
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInputPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  // Create new chat
  const handleNewChat = () => {
    const newChat = {
      id: 'chat-' + Date.now(),
      title: 'New conversation',
      createdAt: new Date().toISOString(),
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setInputPrompt('');
    setStagedImages([]);
    isAutoScrollEnabledRef.current = true;
    setUserScrolledUp(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  };

  // Delete chat
  const handleDeleteChat = (id, e) => {
    e.stopPropagation();
    if (chats.length <= 1) {
      handleNewChat();
      return;
    }
    const filtered = chats.filter(c => c.id !== id);
    setChats(filtered);
    if (activeChatId === id) {
      setActiveChatId(filtered[0].id);
    }
  };

  // Clear all chats
  const handleClearAllChats = () => {
    const freshChat = {
      id: 'chat-' + Date.now(),
      title: 'New conversation',
      createdAt: new Date().toISOString(),
      messages: []
    };
    setChats([freshChat]);
    setActiveChatId(freshChat.id);
  };

  // Handle image upload from file input
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          setStagedImages(prev => [
            ...prev, 
            { name: file.name, dataUrl: uploadEvent.target.result }
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Handle sample image selected
  const handleSampleSelected = async (sample) => {
    try {
      // Convert sample URL to base64 for seamless multimodal pipeline
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setStagedImages(prev => [
          ...prev, 
          { name: sample.name, dataUrl: reader.result }
        ]);
        setInputPrompt(sample.prompt);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      setStagedImages(prev => [
        ...prev, 
        { name: sample.name, dataUrl: sample.url }
      ]);
      setInputPrompt(sample.prompt);
    }
  };

  // Web Speech API Voice Dictation
  const toggleVoiceDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListeningDictation) {
      setIsListeningDictation(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListeningDictation(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
      };
      recognition.onerror = () => setIsListeningDictation(false);
      recognition.onend = () => setIsListeningDictation(false);

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListeningDictation(false);
    }
  };

  // Text-to-Speech audio reader
  const handleToggleSpeak = (msgId, text) => {
    if (!('speechSynthesis' in window)) return;

    if (currentlySpeakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown before speaking
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block omitted.')
                          .replace(/[#*`_>]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = settings.speechRate || 1.0;
    utterance.onend = () => setCurrentlySpeakingMsgId(null);
    utterance.onerror = () => setCurrentlySpeakingMsgId(null);

    setCurrentlySpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Main Submit Prompt function
  const handleSendMessage = async (customPrompt = null) => {
    const textToSend = customPrompt || inputPrompt;
    if ((!textToSend.trim() && stagedImages.length === 0) || isGenerating) return;

    const userMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: textToSend,
      images: [...stagedImages],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update chat title if it's the first message
    const isFirstMessage = activeChat.messages.length === 0;
    const newTitle = isFirstMessage ? textToSend.slice(0, 30) + '...' : activeChat.title;

    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          title: newTitle,
          messages: [...c.messages, userMessage]
        };
      }
      return c;
    }));

    // Reset inputs
    setInputPrompt('');
    setStagedImages([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Start Generation
    setIsGenerating(true);
    setStreamingText('');
    isAutoScrollEnabledRef.current = true;
    setUserScrolledUp(false);
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 40);

    try {
      const activeModelObj = AVAILABLE_MODELS.find(m => m.id === selectedModelId) || AVAILABLE_MODELS[0];
      setSearchProgressStatus(`Thinking with ${activeModelObj.name}...`);
      const response = await sendGeminiPrompt({
        prompt: textToSend,
        modelId: selectedModelId,
        apiKey: settings.apiKey,
        userName: settings.userName || (googleUser?.name) || 'User',
        images: userMessage.images,
        chatHistory: activeChat.messages, // Multi-turn Conversational Memory
        webSearch: true, // Autonomous web intelligence
        ragSearch: true, // Automatic Reference Knowledge Retrieval
        systemInstruction: settings.systemInstruction,
        onProgressStep: (status) => setSearchProgressStatus(status),
        onStreamChunk: (chunk) => setStreamingText(chunk)
      });

      const assistantMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: response.text,
        drafts: response.drafts || [response.text],
        activeDraftIndex: 0,
        thinkingTime: response.thinkingTime,
        thinkingSteps: response.thinkingSteps,
        sources: response.sources,
        generatedMedia: response.generatedMedia,
        ragCitations: response.ragCitations || [],
        nlpAnalysis: response.nlpAnalysis || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: [...c.messages, assistantMessage]
          };
        }
        return c;
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
      setStreamingText('');
      setSearchProgressStatus('');
    }
  };

  // Insert generated media from Studio directly into chat
  const handleInsertMediaToChat = (media) => {
    const isImage = media.type === 'image';
    const userMsg = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: isImage ? `Create image: "${media.prompt}"` : `Create video: "${media.prompt}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const assistantMsg = {
      id: 'msg-' + (Date.now() + 1),
      role: 'assistant',
      content: isImage 
        ? `Here is your high-resolution AI generated image for **"${media.prompt}"** synthesized with Flux Pro.`
        : `Here is your 60FPS cinematic motion video for **"${media.prompt}"** generated with the XTREME Motion Engine.`,
      generatedMedia: media,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [...c.messages, userMsg, assistantMsg]
        };
      }
      return c;
    }));
  };

  // Handle draft switch
  const handleSelectDraft = (msgId, draftIdx) => {
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === msgId) {
              return {
                ...m,
                activeDraftIndex: draftIdx,
                content: m.drafts[draftIdx] || m.content
              };
            }
            return m;
          })
        };
      }
      return c;
    }));
  };

  // Thumbs up celebration feedback
  const handleThumbsUp = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#4285F4', '#9B72CB', '#D96570', '#FFAE42']
    });
  };

  const selectedModel = AVAILABLE_MODELS.find(m => m.id === selectedModelId) || AVAILABLE_MODELS[0];

  return (
    <div className="app-container">
      {/* Aurora Ambient Glow Background */}
      <div className="aurora-glow" />

      {/* Hidden File Input for Multimodal Uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        multiple 
        style={{ display: 'none' }} 
      />

      {/* =========================================================================
          SIDEBAR
          ========================================================================= */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="icon-btn" 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title="Collapse / Expand Menu"
          >
            <Menu size={20} />
          </button>
          {!isSidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <XtremeLogoIcon size={30} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="brand-title-text" style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  XTREME AI
                </span>
                <span className="brand-subtitle-text">
                  CHAT • LEARN • CREATE
                </span>
              </div>
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <button 
          className="new-chat-btn" 
          onClick={handleNewChat}
          title="Start a new chat"
        >
          <Plus size={18} />
          {!isSidebarCollapsed && <span>New chat</span>}
        </button>

        {/* Recent Chats List */}
        {!isSidebarCollapsed && (
          <div className="recent-chats-container">
            <div className="section-label">Recent</div>
            {chats.map(chat => (
              <div 
                key={chat.id}
                className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <MessageSquare size={16} style={{ flexShrink: 0, opacity: 0.8 }} />
                <span className="chat-item-title">{chat.title}</span>
                <button 
                  className="chat-actions-btn"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  title="Delete chat"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {/* XTREME Lightning Upgrade Pill */}
          {!isSidebarCollapsed && (
            <div className="sidebar-model-badge">
              <XtremeLogoIcon size={22} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sidebar-model-title">XTREME Lightning 5.0</div>
                <div className="sidebar-model-sub">Deep Think & Multi-step Logic</div>
              </div>
            </div>
          )}

          <button 
            className={`sidebar-action-item ${hasNewUpdate ? 'has-update' : ''}`}
            onClick={() => setIsUpdateModalOpen(true)}
            title="Check for updates & sync latest version"
          >
            <RefreshCw size={18} className={hasNewUpdate ? 'gemini-star-spin' : ''} />
            {!isSidebarCollapsed && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>{hasNewUpdate ? 'Update Available!' : 'Update App'}</span>
                {hasNewUpdate && (
                  <span className="sidebar-update-tag">NEW</span>
                )}
              </div>
            )}
          </button>

          <button 
            className="sidebar-action-item sidebar-download-btn" 
            onClick={() => setIsDownloadModalOpen(true)}
            title="Download XTREME AI Windows App (.exe)"
          >
            <Download size={18} />
            {!isSidebarCollapsed && <span>Download App (.exe)</span>}
          </button>

          <button className="sidebar-action-item" onClick={() => setIsSettingsOpen(true)}>
            <SettingsIcon size={18} />
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>

          <button 
            className="sidebar-action-item" 
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {!isSidebarCollapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CHAT AREA
          ========================================================================= */}
      <main className="main-wrapper">
        {/* Top Navbar */}
        <header className="top-nav">
          <div className="brand-pill" style={{ cursor: 'default' }}>
            <div className="brand-name" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <XtremeLogoIcon size={36} animated={isGenerating} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="brand-title-text" style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  XTREME AI
                </span>
                <span className="brand-subtitle-text">
                  CHAT • LEARN • CREATE
                </span>
              </div>
            </div>
          </div>

          {/* Top Right Action Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Update / Re-sync App Button */}
            <button 
              className={`model-dropdown-btn btn-update-nav ${hasNewUpdate ? 'has-update' : ''}`} 
              onClick={() => setIsUpdateModalOpen(true)}
              title={hasNewUpdate ? "New update available! Click to update" : "Check for app updates & re-sync"}
            >
              <RefreshCw size={13} className={hasNewUpdate ? 'gemini-star-spin' : ''} />
              <span>{hasNewUpdate ? 'Update Available!' : 'Update'}</span>
              {hasNewUpdate && (
                <span className="nav-update-dot" />
              )}
            </button>

            {/* Download Windows App (.exe) Button */}
            <button 
              className="model-dropdown-btn btn-download-nav" 
              onClick={() => setIsDownloadModalOpen(true)}
              title="Download Windows App (.exe)"
            >
              <Download size={14} />
              <span>Download App</span>
            </button>

            {/* Image Studio Button */}
            <button 
              className="model-dropdown-btn btn-live-nav" 
              onClick={() => setIsImageStudioOpen(true)}
              title="Open AI Image Studio (Flux Pro Text-to-Image)"
              style={{ borderColor: 'rgba(255, 0, 122, 0.3)' }}
            >
              <Wand2 size={14} color="#FF007A" />
              <span>Image Studio</span>
            </button>

            {/* Video Studio Button */}
            <button 
              className="model-dropdown-btn btn-live-nav" 
              onClick={() => setIsVideoStudioOpen(true)}
              title="Open AI Video Studio (60FPS Generative Motion)"
              style={{ borderColor: 'rgba(155, 114, 203, 0.3)' }}
            >
              <Film size={14} color="#9B72CB" />
              <span>Video Studio</span>
            </button>

            {/* Gemini Live Mode Button */}
            <button 
              className="model-dropdown-btn btn-live-nav" 
              onClick={() => setIsLiveVoiceOpen(true)}
              title="Open XTREME Live voice experience"
            >
              <Sparkles size={14} />
              <span>XTREME Live</span>
            </button>

            {/* User Avatar / Google Profile */}
            {googleUser ? (
              <div 
                className="user-avatar-circle"
                style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'linear-gradient(135deg, #4285F4, #34A853)', overflow: 'hidden' }}
                title={`Signed in as ${googleUser.name} (${googleUser.email})`}
                onClick={() => setIsSettingsOpen(true)}
              >
                {googleUser.avatar?.startsWith('http') ? (
                  <img src={googleUser.avatar} alt={googleUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{googleUser.avatar || googleUser.name?.[0]?.toUpperCase() || 'G'}</span>
                )}
              </div>
            ) : (
              <button
                className="nav-login-btn"
                onClick={() => setIsSettingsOpen(true)}
              >
                Log in
              </button>
            )}
          </div>
        </header>

        {/* Messages Scroll Area */}
        <div 
          className="messages-scroll-area"
          ref={scrollAreaRef}
          onScroll={handleMessagesScroll}
        >
          {activeChat.messages.length === 0 ? (
            /* =========================================================================
               GREETING HERO / EMPTY STATE
               ========================================================================= */
            <div className="greeting-hero">
              {/* Central Mascot Badge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <div className="hero-mascot-box">
                  <img src="/logo-mascot.png" alt="XTREME AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="hero-mascot-pill">
                    CHAT • LEARN • CREATE
                  </span>
                </div>
              </div>

              <h1 className="greeting-title">Hello, {googleUser?.name ? googleUser.name.split(' ')[0] : 'there'}</h1>
              <h2 className="greeting-subtitle">How can I help you today?</h2>

              <div className="suggestion-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <div 
                  className="suggestion-card card-create"
                  onClick={() => handleSendMessage("Build an interactive 3D Solar System simulation in HTML5 Canvas with orbital physics and live preview")}
                >
                  <div className="suggestion-card-badge" style={{ color: '#00F0FF' }}>
                    💻 CODE CREATOR
                  </div>
                  <span className="suggestion-text">
                    Synthesize production code, live 3D Canvas apps, interactive games, and system algorithms
                  </span>
                  <div className="suggestion-icon-wrap" style={{ color: '#00F0FF' }}>
                    <Code2 size={18} />
                  </div>
                </div>

                <div 
                  className="suggestion-card card-create"
                  onClick={() => handleSendMessage("Generate an image of a cyberpunk samurai warrior in rainy Neo-Tokyo, reflective neon puddles, 8k cinematic lighting")}
                >
                  <div className="suggestion-card-badge" style={{ color: '#FF007A' }}>
                    🎨 AI IMAGE GEN
                  </div>
                  <span className="suggestion-text">
                    Photorealistic 8K image synthesis with Flux Pro, custom aspect ratios, and art styles
                  </span>
                  <div className="suggestion-icon-wrap" style={{ color: '#FF007A' }}>
                    <Wand2 size={18} />
                  </div>
                </div>

                <div 
                  className="suggestion-card card-create"
                  onClick={() => handleSendMessage("Generate a video of cosmic nebula starfield warp drive at 60 FPS")}
                >
                  <div className="suggestion-card-badge" style={{ color: '#9B72CB' }}>
                    🎬 AI VIDEO GEN
                  </div>
                  <span className="suggestion-text">
                    60FPS cinematic motion simulations, cyber flythroughs, and instant MP4/WebM exports
                  </span>
                  <div className="suggestion-icon-wrap" style={{ color: '#9B72CB' }}>
                    <Film size={18} />
                  </div>
                </div>

                <div 
                  className="suggestion-card card-learn"
                  onClick={() => handleSendMessage("Explain Quantum Computing, Superposition, and Qubit gates with mathematical formulas and real-world analogies")}
                >
                  <div className="suggestion-card-badge" style={{ color: '#FFAE42' }}>
                    ⚡ DEEP REASONING
                  </div>
                  <span className="suggestion-text">
                    Multi-step cognitive logic, mathematical proofs, Big-O analysis, and autonomous web research
                  </span>
                  <div className="suggestion-icon-wrap" style={{ color: '#FFAE42' }}>
                    <Sparkles size={18} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================================
               CHAT THREAD MESSAGES
               ========================================================================= */
            <div className="chat-thread-container">
              {activeChat.messages.map(msg => (
                <div key={msg.id} className={`message-row ${msg.role === 'user' ? 'user-row' : 'bot-row'}`}>
                  {/* Avatar */}
                  <div className="message-avatar">
                    {msg.role === 'user' ? (
                      <div className="user-avatar-circle" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {googleUser?.avatar?.startsWith('http') ? (
                          <img src={googleUser.avatar} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span>{googleUser?.avatar || googleUser?.name?.[0]?.toUpperCase() || 'U'}</span>
                        )}
                      </div>
                    ) : (
                      <div className="bot-avatar-sparkle">
                        <XtremeLogoIcon size={24} />
                      </div>
                    )}
                  </div>

                  {/* Body Wrap */}
                  <div className="message-body-wrap">
                    {msg.role === 'user' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '100%' }}>
                        {/* Staged or attached images */}
                        {msg.images && msg.images.length > 0 && (
                          <div className="message-attachments-preview" style={{ justifyContent: 'flex-end' }}>
                            {msg.images.map((img, i) => (
                              <div key={i} className="attachment-thumbnail">
                                <img src={img.dataUrl} alt="Uploaded attachment" />
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="user-message-bubble">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Thinking Accordion (Deep Think) */}
                        {msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
                          <ThinkingAccordion 
                            steps={msg.thinkingSteps} 
                            time={msg.thinkingTime} 
                            defaultOpen={false} 
                          />
                        )}

                        {/* Search Grounding Sources */}
                        {msg.sources && msg.sources.length > 0 && (
                          <SearchGroundingBar sources={msg.sources} />
                        )}

                        {/* Markdown & Code Body */}
                        <MarkdownRenderer 
                          content={msg.content} 
                          onRunCode={(code, lang) => {
                            setCanvasModalState({ isOpen: true, code, language: lang });
                          }}
                        />

                        {/* Generated Multimodal Media (Image / Video) */}
                        {msg.generatedMedia?.type === 'image' && (
                          <ImageGenerationCard 
                            media={msg.generatedMedia} 
                            onRegenerate={(prompt, currentSeed) => {
                              const newSeed = Math.floor(Math.random() * 9999999) + 1;
                              const newUrl = msg.generatedMedia.url.replace(/seed=\d+/, `seed=${newSeed}`);
                              setChats(prev => prev.map(c => {
                                if (c.id === activeChatId) {
                                  return {
                                    ...c,
                                    messages: c.messages.map(m => m.id === msg.id ? {
                                      ...m,
                                      generatedMedia: { ...m.generatedMedia, url: newUrl, seed: newSeed }
                                    } : m)
                                  };
                                }
                                return c;
                              }));
                            }}
                          />
                        )}

                        {msg.generatedMedia?.type === 'video' && (
                          <VideoGenerationCard media={msg.generatedMedia} />
                        )}

                        {/* Message Action Toolbar */}
                        <div className="message-actions-toolbar">
                          <button 
                            className={`msg-tool-btn ${currentlySpeakingMsgId === msg.id ? 'active' : ''}`}
                            onClick={() => handleToggleSpeak(msg.id, msg.content)}
                            title={currentlySpeakingMsgId === msg.id ? 'Stop listening' : 'Listen to response'}
                          >
                            {currentlySpeakingMsgId === msg.id ? <VolumeX size={15} /> : <Volume2 size={15} />}
                          </button>

                          <button 
                            className="msg-tool-btn" 
                            onClick={async () => {
                              await navigator.clipboard.writeText(msg.content);
                              alert('Response copied to clipboard!');
                            }}
                            title="Copy response"
                          >
                            <Copy size={15} />
                          </button>

                          <button 
                            className="msg-tool-btn" 
                            onClick={handleThumbsUp}
                            title="Good response"
                          >
                            <ThumbsUp size={15} />
                          </button>

                          <button 
                            className="msg-tool-btn" 
                            onClick={() => alert('Thanks for the feedback! We will improve future responses.')}
                            title="Bad response"
                          >
                            <ThumbsDown size={15} />
                          </button>

                          {/* Gemini Drafts Selector */}
                          {msg.drafts && msg.drafts.length > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '10px' }}>
                              <span className="drafts-label">Drafts:</span>
                              {msg.drafts.map((_, dIdx) => (
                                <button
                                  key={dIdx}
                                  className={`drafts-pill ${msg.activeDraftIndex === dIdx ? 'active' : ''}`}
                                  onClick={() => handleSelectDraft(msg.id, dIdx)}
                                >
                                  {dIdx + 1}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming Indicator */}
              {isGenerating && (
                <div className="message-row">
                  <div className="message-avatar">
                    <XtremeLogoIcon size={24} animated={true} />
                  </div>
                  <div className="message-body-wrap">
                    {streamingText ? (
                      <MarkdownRenderer 
                        content={streamingText} 
                        onRunCode={(code, lang) => setCanvasModalState({ isOpen: true, code, language: lang })}
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div className="streaming-status-row">
                          <Sparkles size={16} />
                          <span>{searchProgressStatus || `Thinking with ${selectedModel.name}...`}</span>
                        </div>
                        <div className="shimmer-text" style={{ fontSize: '13px' }}>
                          Executing XTREME AI Brain reasoning & synthesizing answer...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating Scroll to Bottom Pill */}
        {userScrolledUp && activeChat.messages.length > 0 && (
          <button 
            className="scroll-to-bottom-pill"
            onClick={scrollToBottomSmooth}
            title="Scroll down to latest response"
          >
            <ChevronDown size={15} />
            <span>Latest</span>
          </button>
        )}

        {/* =========================================================================
            BOTTOM FLOATING INPUT DOCK (GEMINI SIGNATURE DESIGN)
            ========================================================================= */}
        <div className="bottom-dock-wrapper">
          <div className="bottom-dock-inner">
            {/* Creation Quick Bar */}
            <div className="creation-quick-bar">
              <button 
                type="button"
                className="creation-quick-pill"
                onClick={() => {
                  setInputPrompt("Build an interactive 3D particle constellation simulation in HTML5 Canvas with live interactive controls");
                  textareaRef.current?.focus();
                }}
                title="Create full-stack code or interactive canvas app"
              >
                <Code2 size={13} className="creation-pill-icon code" />
                <span>Code Creator</span>
              </button>

              <button 
                type="button"
                className="creation-quick-pill"
                onClick={() => setIsImageStudioOpen(true)}
                title="Open AI Image Studio (Flux Pro Text-to-Image)"
              >
                <Wand2 size={13} className="creation-pill-icon image" />
                <span>Image Studio</span>
              </button>

              <button 
                type="button"
                className="creation-quick-pill"
                onClick={() => setIsVideoStudioOpen(true)}
                title="Open AI Video Studio (60FPS Generative Motion)"
              >
                <Film size={13} className="creation-pill-icon video" />
                <span>Video Studio</span>
              </button>

              <button 
                type="button"
                className={`creation-quick-pill ${selectedModelId === 'xtreme-lightning-5.0' ? 'active' : ''}`}
                onClick={() => setSelectedModelId(selectedModelId === 'xtreme-lightning-5.0' ? 'xtreme-fire-3.0' : 'xtreme-lightning-5.0')}
                title="Toggle Deep Cognitive Reasoning Brain"
              >
                <Sparkles size={13} className="creation-pill-icon think" />
                <span>Deep Think</span>
              </button>
            </div>

            <div className="input-container-pill">
              {/* Staged Multimodal Attachments */}
              {stagedImages.length > 0 && (
                <div className="staged-attachments-row">
                  {stagedImages.map((img, idx) => (
                    <div key={idx} className="staged-attachment-item">
                      <img src={img.dataUrl} alt={img.name} />
                      <button 
                        className="staged-remove-btn"
                        onClick={() => setStagedImages(prev => prev.filter((_, i) => i !== idx))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Auto-Expanding Textarea */}
              <textarea
                ref={textareaRef}
                rows={1}
                className="prompt-textarea"
                placeholder={isGenerating ? "Waiting for response..." : "Ask XTREME AI anything..."}
                value={inputPrompt}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isGenerating}
              />

              {/* Dock Control Icons */}
              <div className="dock-controls-row">
                <div className="dock-left-actions">
                  {/* Upload Image Button */}
                  <button 
                    className="dock-action-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload image or file"
                  >
                    <Plus size={18} />
                  </button>

                  {/* Sample Images Modal Picker */}
                  <button 
                    className="dock-action-btn"
                    onClick={() => setIsSamplePickerOpen(true)}
                    title="Select sample multimodal images"
                  >
                    <ImageIcon size={18} />
                  </button>

                  {/* Model Selector Dropdown inside Chat Box */}
                  <div className="dock-model-selector" ref={modelDropdownRef}>
                    <button 
                      type="button"
                      className="dock-model-btn"
                      onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                      title="Select XTREME AI Model"
                    >
                      <Sparkles size={14} className="dock-model-sparkle" />
                      <span>{selectedModel.name}</span>
                      <ChevronDown size={13} style={{ transform: modelDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                    </button>

                    {/* Model Dropdown Popup Menu (Pops Upward Above Chat Box) */}
                    {modelDropdownOpen && (
                      <div className="dock-model-menu">
                        {AVAILABLE_MODELS.map(m => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedModelId(m.id);
                              setModelDropdownOpen(false);
                            }}
                            className={`dock-model-option ${selectedModelId === m.id ? 'active' : ''}`}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
                              <span className="dock-model-badge-tag">
                                {m.badge}
                              </span>
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.35 }}>{m.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="dock-right-actions">
                  {/* Voice Dictation (Speech-to-Text) */}
                  <button 
                    className={`dock-action-btn ${isListeningDictation ? 'active' : ''}`}
                    onClick={toggleVoiceDictation}
                    title={isListeningDictation ? 'Listening... click to stop' : 'Voice input (Speech to Text)'}
                  >
                    <Mic size={18} color={isListeningDictation ? '#ea4335' : 'currentColor'} />
                  </button>

                  {/* Send or Stop Button */}
                  {isGenerating ? (
                    <button 
                      className="send-action-btn" 
                      onClick={() => setIsGenerating(false)}
                      title="Stop generation"
                    >
                      <Square size={16} fill="currentColor" />
                    </button>
                  ) : (
                    <button 
                      className="send-action-btn"
                      onClick={() => handleSendMessage()}
                      disabled={!inputPrompt.trim() && stagedImages.length === 0}
                      title="Send prompt (Enter)"
                    >
                      <Send size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <p className="dock-disclaimer">
              XTREME AI can make mistakes, so double-check it.
            </p>
          </div>
        </div>
      </main>

      {/* =========================================================================
          MODALS & OVERLAYS
          ========================================================================= */}
      {/* Live Voice Experience Modal */}
      <LiveVoiceModal 
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        onUserSpoke={(spokenText) => {
          handleSendMessage(spokenText);
          setIsLiveVoiceOpen(false);
        }}
      />

      {/* Live Canvas Runner Modal */}
      <CanvasModal 
        isOpen={canvasModalState.isOpen}
        code={canvasModalState.code}
        language={canvasModalState.language}
        onClose={() => setCanvasModalState({ isOpen: false, code: '', language: 'html' })}
      />

      {/* AI Image Studio Modal */}
      <ImageStudioModal
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
        onInsertToChat={handleInsertMediaToChat}
      />

      {/* AI Video Studio Modal */}
      <VideoStudioModal
        isOpen={isVideoStudioOpen}
        onClose={() => setIsVideoStudioOpen(false)}
        onInsertToChat={handleInsertMediaToChat}
      />

      {/* Auth & Settings Modal - Log in or sign up */}
      <AuthModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={(newTheme) => setTheme(newTheme)}
        googleUser={googleUser}
        onSignIn={(userData) => {
          setGoogleUser(userData);
          localStorage.setItem('xtreme_google_user', JSON.stringify(userData));
        }}
        onSignOut={() => {
          setGoogleUser(null);
          localStorage.removeItem('xtreme_google_user');
        }}
        onClearAllChats={handleClearAllChats}
      />

      {/* Sample Multimodal Images Modal */}
      <SampleImagesPicker 
        isOpen={isSamplePickerOpen}
        onClose={() => setIsSamplePickerOpen(false)}
        onSelectSample={handleSampleSelected}
      />

      {/* Download Desktop App Modal (.exe / PWA) */}
      <DownloadAppModal 
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      {/* App Update & Cache Sync Modal */}
      <UpdateModal 
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setHasNewUpdate(false);
        }}
      />
    </div>
  );
}
