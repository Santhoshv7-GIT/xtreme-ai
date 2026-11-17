// ==========================================================================
// XTREME AI - Autonomous User Cognitive Profiling & Adaptive Learning Mind
// Continuously learns user preferences, communication style, speed & domain
// ==========================================================================

const PROFILE_STORAGE_KEY = 'xtreme_user_cognitive_profile';

const DEFAULT_PROFILE = {
  version: 2,
  userStyle: 'balanced', // 'concise' | 'balanced' | 'in-depth' | 'code-first'
  technicalLevel: 'intermediate', // 'beginner' | 'intermediate' | 'advanced' | 'architect'
  speedPreference: 'adaptive', // 'ultra-fast' | 'adaptive' | 'deep-reasoning'
  tone: 'direct', // 'direct' | 'conversational' | 'academic' | 'executive'
  topDomains: ['Software Development', 'General Intelligence'],
  preferredLanguages: ['JavaScript', 'Python'],
  totalInteractions: 0,
  averagePromptLength: 0,
  wantsCodeFirst: false,
  brevityScore: 0.5, // 0 = prefers ultra-concise, 1 = prefers comprehensive
  lastUpdated: Date.now()
};

/**
 * Retrieve the active user cognitive profile from localStorage
 */
export function getUserCognitiveProfile() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_PROFILE };
  }
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch (err) {
    console.warn('Could not read user cognitive profile:', err);
    return { ...DEFAULT_PROFILE };
  }
}

/**
 * Save user cognitive profile
 */
export function saveUserCognitiveProfile(profile) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
      ...profile,
      lastUpdated: Date.now()
    }));
  } catch (err) {
    console.warn('Could not save user cognitive profile:', err);
  }
}

/**
 * Detect user's immediate pacing, urgency, and speed requirement for a specific prompt
 */
export function analyzeUserPacingAndUrgency(prompt, profile) {
  if (!prompt || typeof prompt !== 'string') {
    return { speed: 'fast', mode: 'balanced', urgency: 'normal' };
  }

  const pLower = prompt.trim().toLowerCase();
  const wordCount = prompt.trim().split(/\s+/).length;

  // Ultra-fast triggers
  const isUrgent = /(quick|fast|brief|tldr|one line|in short|summarize in 1 sentence|asap|urgently|nutshell|bullet points only)/i.test(pLower);
  const isGreeting = /^(hi|hello|hey|yo|sup|good morning|good evening|good afternoon|howdy|whats up|what's up)[.!?]*$/i.test(pLower);
  const isGratitude = /^(thanks|thank you|thx|awesome thanks|great thanks|appreciate it)[.!?]*$/i.test(pLower);
  const isIdentity = /^(who are you|what are you|what is your name|who made you|what can you do)[?.]*$/i.test(pLower);

  // Deep reasoning triggers
  const isDeep = /(step by step|deep dive|comprehensive|explain in detail|architecture|proof|derive|mathematical|full implementation|trade-offs|production grade|complete guide)/i.test(pLower);
  const isCodeIntensive = /(write code|implement|build an app|refactor|function|algorithm|react component|html canvas)/i.test(pLower);

  if (isGreeting || isGratitude || isIdentity) {
    return { speed: 'instant', mode: 'conversational', urgency: 'instant' };
  }

  if (isUrgent || (wordCount <= 4 && !isCodeIntensive && !isDeep)) {
    return { speed: 'ultra-fast', mode: 'concise', urgency: 'high' };
  }

  if (isDeep || isCodeIntensive || wordCount > 35) {
    return { speed: 'deliberate', mode: 'in-depth', urgency: 'analytical' };
  }

  // Profile-based default
  if (profile?.userStyle === 'concise') {
    return { speed: 'ultra-fast', mode: 'concise', urgency: 'high' };
  }

  return { speed: 'adaptive', mode: profile?.userStyle || 'balanced', urgency: 'normal' };
}

/**
 * Train and continuously adapt the profile based on each user interaction
 */
export function trainUserProfileFromInteraction(userPrompt, assistantResponse, userName = '') {
  if (!userPrompt || typeof userPrompt !== 'string') return;
  const profile = getUserCognitiveProfile();

  const words = userPrompt.trim().split(/\s+/);
  const promptLen = words.length;
  const pLower = userPrompt.toLowerCase();

  // Update total interactions and moving average prompt length
  const prevTotal = profile.totalInteractions || 0;
  const newTotal = prevTotal + 1;
  const prevAvg = profile.averagePromptLength || promptLen;
  const newAvg = Math.round((prevAvg * prevTotal + promptLen) / newTotal);

  profile.totalInteractions = newTotal;
  profile.averagePromptLength = newAvg;

  // Track coding signals
  const codeKeywords = ['code', 'function', 'class', 'react', 'javascript', 'python', 'css', 'html', 'sql', 'typescript', 'api', 'bug', 'algorithm'];
  const hasCodeKeywords = codeKeywords.some(k => pLower.includes(k));
  if (hasCodeKeywords) {
    profile.wantsCodeFirst = true;
  }

  // Detect preferred programming language
  const detectedLangs = [];
  if (/\b(javascript|js|node|react|nextjs|vite)\b/i.test(pLower)) detectedLangs.push('JavaScript/TypeScript');
  if (/\b(python|py|django|fastapi|pandas)\b/i.test(pLower)) detectedLangs.push('Python');
  if (/\b(c\+\+|cpp|c#|csharp|\.net)\b/i.test(pLower)) detectedLangs.push('C++/C#');
  if (/\b(rust|cargo)\b/i.test(pLower)) detectedLangs.push('Rust');
  if (/\b(html|css|tailwind|canvas|webgl)\b/i.test(pLower)) detectedLangs.push('Modern Web/CSS');

  if (detectedLangs.length > 0) {
    const existing = new Set(profile.preferredLanguages);
    detectedLangs.forEach(l => existing.add(l));
    profile.preferredLanguages = [...existing].slice(0, 5);
  }

  // Detect brevity preference
  if (/(short|brief|tldr|quick|concise|bullet points|one line)/i.test(pLower)) {
    profile.brevityScore = Math.max(0.1, profile.brevityScore - 0.15);
    profile.userStyle = 'concise';
  } else if (/(explain thoroughly|detailed|comprehensive|step by step|in-depth|deep dive)/i.test(pLower)) {
    profile.brevityScore = Math.min(0.9, profile.brevityScore + 0.15);
    profile.userStyle = 'in-depth';
  } else if (hasCodeKeywords) {
    profile.userStyle = 'code-first';
  }

  // Detect technical sophistication
  if (/(big-o|polymorphism|concurrency|asynchronous|mutex|vector space|hyperparameter|microservice|ast|compiler|kernel)/i.test(pLower)) {
    profile.technicalLevel = 'advanced';
    profile.tone = 'technical';
  } else if (/(explain to a beginner|simple terms|like i'm 5|eli5|easy to understand)/i.test(pLower)) {
    profile.technicalLevel = 'beginner';
    profile.tone = 'conversational';
  }

  if (userName) {
    profile.userName = userName;
  }

  saveUserCognitiveProfile(profile);
  return profile;
}

/**
 * Synthesize an adaptive instruction prompt that primes the neural engine according to the user
 */
export function buildAdaptiveSystemContext(profile, pacing, userName = '') {
  const parts = [];

  const name = userName || profile.userName || 'User';
  parts.push(`[ADAPTIVE USER COGNITIVE PROFILE]`);
  parts.push(`- Addressing: ${name}`);

  if (pacing.speed === 'instant' || pacing.mode === 'conversational') {
    parts.push(`- Immediate Interaction Goal: Warm, natural, instantaneous conversational response. Keep it crisp, lively, and direct without verbose essays.`);
  } else if (pacing.mode === 'concise' || pacing.speed === 'ultra-fast') {
    parts.push(`- Immediate Pacing Goal: ULTRA-FAST & CONCISE. The user requested rapid clarity. Deliver punchy answers, direct code or bullet points immediately without introductory preamble.`);
  } else if (pacing.mode === 'in-depth') {
    parts.push(`- Immediate Pacing Goal: DEEP COGNITIVE REASONING. Structure with clear architectural sections, thorough explanations, practical code examples, and edge case coverage.`);
  } else {
    parts.push(`- Immediate Pacing Goal: Balanced clarity with high information density.`);
  }

  if (profile.wantsCodeFirst) {
    parts.push(`- User Technical Affinity: Strong developer focus. When code is requested, provide full, production-ready, clean code immediately in markdown blocks.`);
    if (profile.preferredLanguages.length > 0) {
      parts.push(`- Preferred Languages: ${profile.preferredLanguages.join(', ')}.`);
    }
  }

  if (profile.technicalLevel === 'advanced') {
    parts.push(`- Depth Level: Advanced / Engineering grade. Assume familiarity with fundamental concepts; focus on architectural nuances and performance.`);
  } else if (profile.technicalLevel === 'beginner') {
    parts.push(`- Depth Level: Accessible & intuitive. Use clear analogies and avoid excessive jargon.`);
  }

  return parts.join('\n');
}

/**
 * Instant Fast-Path Generator (<20ms) for common conversational reflexes
 */
export function tryGenerateInstantFastResponse(prompt, profile, userName = '') {
  if (!prompt || typeof prompt !== 'string') return null;
  const p = prompt.trim().toLowerCase();
  const name = userName || profile?.userName || '';
  const greetingName = name ? `, ${name}` : '';

  // 1. Common greetings
  if (/^(hi|hello|hey|yo|howdy|whats up|what's up|good morning|good evening|good afternoon)(\s+(there|friend|xtreme|ai|bot|team|mate|everyone))?[.!?]*$/i.test(p)) {
    const greetings = [
      `Hey${greetingName}! I'm online and ready. What are we building or solving today?`,
      `Hello${greetingName}! Great to see you. How can I assist your workflow right now?`,
      `Hey there${greetingName}! Systems are running at peak speed. What's on your mind?`,
      `Hi${greetingName}! Ready to create, code, or explore ideas whenever you are.`
    ];
    const pick = greetings[Math.floor(Math.random() * greetings.length)];
    return {
      text: pick,
      thinkingSteps: [
        `Recognized conversational greeting from user.`,
        `Synthesized immediate, high-warmth natural response.`
      ],
      thinkingTime: 0.05
    };
  }

  // 1b. How are you
  if (/^(how are you|how's it going|how are things|how do you do|how are you doing)[?.]*$/i.test(p)) {
    return {
      text: `I'm doing great${greetingName}, running at peak neural throughput! How can I help you today?`,
      thinkingSteps: [
        `Recognized conversational well-being inquiry.`,
        `Synthesized immediate natural response.`
      ],
      thinkingTime: 0.04
    };
  }

  // 2. Identity / Capabilities
  if (/^(who are you|what are you|what is your name|who made you)[?.]*$/i.test(p)) {
    return {
      text: `I am **XTREME AI**, your autonomous intelligence engine designed for high-velocity software engineering, multimodal media synthesis, real-time knowledge retrieval, and deep cognitive problem solving.\n\nI adapt to your workflow in real time—whether you need rapid code execution in the Live Canvas, instant image/video creation, or architectural reasoning.\n\nWhat would you like to tackle together?`,
      thinkingSteps: [
        `Interpreting identity inquiry.`,
        `Affirming proprietary XTREME AI architectural capabilities and core mission.`
      ],
      thinkingTime: 0.08
    };
  }

  // 3. Gratitude
  if (/^(thanks|thank you|thx|appreciate it|awesome thanks|great thanks)[.!?]*$/i.test(p)) {
    return {
      text: `You're very welcome${greetingName}! Let me know whenever you're ready for the next task or idea. Always here to help! 🚀`,
      thinkingSteps: [
        `Detected user gratitude.`,
        `Synthesizing supportive conversational closure.`
      ],
      thinkingTime: 0.04
    };
  }

  // 4. Simple Math / Instant Calculations (e.g. "what is 25 * 4", "128 / 4", "sqrt(144)")
  const mathMatch = p.match(/^(?:what is|calculate|compute)?\s*(-?\d+(?:\.\d+)?)\s*([\+\-\*\/xX\^])\s*(-?\d+(?:\.\d+)?)\s*[?.]*$/i);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseFloat(mathMatch[3]);
    let result = null;
    let opName = 'calculation';

    if (op === '+') { result = a + b; opName = 'addition'; }
    else if (op === '-') { result = a - b; opName = 'subtraction'; }
    else if (op === '*' || op.toLowerCase() === 'x') { result = a * b; opName = 'multiplication'; }
    else if (op === '/') { result = b !== 0 ? (a / b) : 'Undefined (division by zero)'; opName = 'division'; }
    else if (op === '^') { result = Math.pow(a, b); opName = 'exponentiation'; }

    if (result !== null) {
      return {
        text: `The result of **${a} ${op} ${b}** is **${result}**.`,
        thinkingSteps: [
          `Detected deterministic arithmetic expression: ${a} ${op} ${b}.`,
          `Executed instant mathematical evaluation (${opName}).`
        ],
        thinkingTime: 0.02
      };
    }
  }

  return null;
}
