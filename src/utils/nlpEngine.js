// ==========================================================================
// XTREME AI - Advanced Natural Language Processing (NLP) Engine
// Real-time Sentiment, Named Entity Recognition, Intent, Keyphrases & Metrics
// ==========================================================================

const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can\'t',
  'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t',
  'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it',
  'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
  'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s',
  'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were',
  'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s',
  'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re',
  'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

// Sentiment Lexicon with weights
const SENTIMENT_LEXICON = {
  // Positive (+1 to +3)
  great: 2, awesome: 3, excellent: 3, brilliant: 3, fantastic: 3, good: 1.5, best: 2.5, love: 2.5,
  amazing: 3, wonderful: 3, perfect: 3, super: 2, superior: 2, fast: 1.5, powerful: 2, clean: 1.5,
  beautiful: 2, elegant: 2, smooth: 1.5, helpful: 1.8, intuitive: 1.8, impressive: 2.5, innovative: 2.5,
  flawless: 3, effective: 1.8, reliable: 2, robust: 2, success: 2, optimal: 2, happy: 2, joy: 2.5,
  masterpiece: 3, sharp: 1.5, accurate: 1.8, insightful: 2.2, genius: 3, celebrate: 2, win: 2,
  // Negative (-1 to -3)
  bad: -1.5, terrible: -3, awful: -3, horrible: -3, poor: -1.8, broken: -2.5, error: -2, bug: -1.8,
  fail: -2.5, failure: -2.5, crash: -2.5, slow: -1.5, lag: -1.5, ugly: -2, confusing: -2, worst: -3,
  hate: -2.8, difficult: -1.2, messy: -1.8, useless: -2.8, painful: -2.2, issue: -1.5, problem: -1.5,
  wrong: -2, invalid: -1.8, defective: -2.5, catastrophic: -3, boring: -1.5, disappointed: -2.5, vulnerable: -2
};

const INTENSIFIERS = {
  very: 1.5, extremely: 2.0, incredibly: 2.0, absolutely: 2.0, super: 1.6, really: 1.4, highly: 1.6,
  barely: 0.4, slightly: 0.6, somewhat: 0.7, hardly: 0.3
};

const NEGATIONS = new Set(['not', 'no', 'never', 'hardly', 'barely', 'scarcely', 'neither', 'nor', 'cannot', 'without']);

// Known Named Entity Knowledge Dictionaries
const KNOWN_ENTITIES = {
  tech: [
    'react', 'vue', 'angular', 'svelte', 'next.js', 'vite', 'javascript', 'typescript', 'python',
    'golang', 'rust', 'c++', 'c#', 'java', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'cloud', 'node.js', 'express', 'postgresql', 'mongodb', 'redis', 'graphql', 'html5', 'css3',
    'tailwind', 'canvas', 'webgl', 'three.js', 'pytorch', 'tensorflow', 'linux', 'git', 'github',
    'electron', 'llm', 'rag', 'nlp', 'transformer', 'gpu', 'cuda', 'api', 'rest', 'json', 'sql'
  ],
  organizations: [
    'google', 'microsoft', 'openai', 'apple', 'meta', 'amazon', 'anthropic', 'netflix', 'tesla',
    'nvidia', 'deepmind', 'github', 'vercel', 'netlify', 'stripe', 'uber', 'twitter', 'x', 'ibm', 'oracle'
  ],
  locations: [
    'usa', 'united states', 'california', 'silicon valley', 'new york', 'tokyo', 'london', 'paris',
    'berlin', 'india', 'bengaluru', 'san francisco', 'japan', 'china', 'germany', 'canada', 'mars', 'earth'
  ]
};

/**
 * Tokenize a string into alphanumeric words
 */
export function tokenizeWords(text) {
  if (!text || typeof text !== 'string') return [];
  return text.toLowerCase().match(/\b[a-z0-9+#.-]+\b/g) || [];
}

/**
 * Sentence splitter preserving punctuation
 */
export function splitSentences(text) {
  if (!text || typeof text !== 'string') return [];
  return text.split(/(?<=[.!?])\s+(?=[A-Z0-9#])/).map(s => s.trim()).filter(Boolean);
}

/**
 * Syllable counter heuristic for Flesch Readability Ease
 */
function countSyllables(word) {
  const w = word.toLowerCase().replace(/(?:[^laeiouy]|ed|es|e)$/, '').replace(/^y/, '');
  const matches = w.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

/**
 * 1. Sentiment & Emotion Analysis
 */
export function analyzeSentiment(text) {
  const words = tokenizeWords(text);
  if (words.length === 0) {
    return { score: 0, label: 'Neutral', polarity: 'neutral', confidence: 0.5, emotion: 'Analytical' };
  }

  let totalScore = 0;
  let matchesCount = 0;
  let multiplier = 1.0;
  let negateNext = false;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    if (NEGATIONS.has(w)) {
      negateNext = true;
      continue;
    }

    if (INTENSIFIERS[w]) {
      multiplier = INTENSIFIERS[w];
      continue;
    }

    if (SENTIMENT_LEXICON[w] !== undefined) {
      let val = SENTIMENT_LEXICON[w] * multiplier;
      if (negateNext) val = -val * 0.8;
      totalScore += val;
      matchesCount++;
      negateNext = false;
      multiplier = 1.0;
    }
  }

  // Normalized score between -1 and +1
  const normalized = matchesCount > 0 ? Math.max(-1, Math.min(1, totalScore / (matchesCount * 2.2))) : 0;

  let label = 'Neutral';
  let emotion = 'Analytical / Objective';

  if (normalized > 0.25) {
    label = 'Positive';
    emotion = normalized > 0.65 ? 'Joy / Highly Enthusiastic' : 'Constructive / Optimistic';
  } else if (normalized < -0.25) {
    label = 'Negative';
    emotion = normalized < -0.65 ? 'Frustrated / Critical' : 'Concerned / Problematic';
  } else {
    // Check question or conversational cues
    if (text.includes('?')) {
      emotion = 'Curious / Inquisitive';
    } else if (text.length > 200 && text.includes('```')) {
      emotion = 'Technical / Algorithmic';
    }
  }

  return {
    score: parseFloat(normalized.toFixed(2)),
    label,
    confidence: Math.min(0.98, Math.max(0.55, 0.5 + Math.abs(normalized) * 0.45)),
    emotion
  };
}

/**
 * 2. Named Entity Recognition (NER)
 */
export function extractNamedEntities(text) {
  if (!text || typeof text !== 'string') return [];
  const entities = [];
  const textLower = text.toLowerCase();

  // A. Tech / Frameworks
  for (const tech of KNOWN_ENTITIES.tech) {
    const regex = new RegExp(`\\b${tech.replace('+', '\\+')}\\b`, 'gi');
    if (regex.test(textLower)) {
      entities.push({ text: tech.toUpperCase(), type: 'Technology', category: 'code' });
    }
  }

  // B. Organizations
  for (const org of KNOWN_ENTITIES.organizations) {
    const regex = new RegExp(`\\b${org}\\b`, 'gi');
    if (regex.test(textLower)) {
      entities.push({ text: org.charAt(0).toUpperCase() + org.slice(1), type: 'Organization', category: 'org' });
    }
  }

  // C. Locations
  for (const loc of KNOWN_ENTITIES.locations) {
    const regex = new RegExp(`\\b${loc}\\b`, 'gi');
    if (regex.test(textLower)) {
      entities.push({ text: loc.charAt(0).toUpperCase() + loc.slice(1), type: 'Location', category: 'geo' });
    }
  }

  // D. Numbers / Quantities / Currency
  const numbersMatch = text.match(/(\$\d+[\d,.]*|\b\d+[\d,.]*(?:ms|fps|gb|mb|tb|kb|px|hz|ghz|%|k)\b)/gi);
  if (numbersMatch) {
    numbersMatch.slice(0, 4).forEach(num => {
      entities.push({ text: num, type: 'Quantity / Metric', category: 'metric' });
    });
  }

  // E. URLs
  const urlMatch = text.match(/https?:\/\/[^\s)]+/gi);
  if (urlMatch) {
    urlMatch.slice(0, 2).forEach(url => {
      entities.push({ text: url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 24) + '...', type: 'URL / Reference', category: 'link' });
    });
  }

  // Remove duplicates by text
  const seen = new Set();
  return entities.filter(e => {
    const key = `${e.text}-${e.type}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
}

/**
 * 3. Intent Classification
 */
export function classifyIntent(text) {
  if (!text || typeof text !== 'string') return { intent: 'conversational', confidence: 0.5, label: 'Conversation' };
  const lower = text.trim().toLowerCase();

  // 1. Code Generation / Execution
  if (/(code|function|script|implement|build an app|algorithm|react|html|css|python|bug|syntax|regex|fix code|refactor)/i.test(lower)) {
    return { intent: 'code_synthesis', confidence: 0.94, label: 'Code & Software Engineering', badgeColor: '#00F0FF' };
  }

  // 2. RAG / Knowledge retrieval intent
  if (/(in the document|according to (the|my) (file|notes|doc|pdf)|knowledge base|uploaded file|from the manual|summarize the doc)/i.test(lower)) {
    return { intent: 'rag_retrieval', confidence: 0.92, label: 'RAG Knowledge Retrieval', badgeColor: '#10b981' };
  }

  // 3. Image generation
  if (/^(?:please\s+)?(?:generate|create|make|draw|paint|render)\s+(?:an?\s+)?(?:image|picture|photo|illustration|art|portrait)/i.test(lower)) {
    return { intent: 'image_synthesis', confidence: 0.96, label: 'AI Image Synthesis', badgeColor: '#FF007A' };
  }

  // 4. Video generation
  if (/^(?:please\s+)?(?:generate|create|make|animate|render)\s+(?:an?\s+)?(?:video|clip|animation|motion|simulation)/i.test(lower)) {
    return { intent: 'video_synthesis', confidence: 0.95, label: '60FPS Video Generation', badgeColor: '#9B72CB' };
  }

  // 5. Deep Cognitive / Math / Physics Reasoning
  if (/(derive|proof|theorem|axiom|quantum|complexity|trade-offs|architecture|big-o|mathematical|formula)/i.test(lower)) {
    return { intent: 'deep_reasoning', confidence: 0.90, label: 'Deep Cognitive Reasoning', badgeColor: '#FFAE42' };
  }

  // 6. Summarization / NLP transformation
  if (/^(summarize|tldr|paraphrase|rewrite|rephrase|proofread|grammar check)/i.test(lower)) {
    return { intent: 'text_transformation', confidence: 0.88, label: 'NLP Text Transformation', badgeColor: '#38bdf8' };
  }

  // 7. Live Knowledge Search
  if (/(latest|news|weather|price of|score|release date|today|who is the current)/i.test(lower)) {
    return { intent: 'knowledge_search', confidence: 0.85, label: 'Live Web Knowledge', badgeColor: '#4285F4' };
  }

  return { intent: 'conversational', confidence: 0.75, label: 'Multimodal Chat', badgeColor: '#a855f7' };
}

/**
 * 4. Keyphrase & Keyword Extraction
 */
export function extractKeyphrases(text, topN = 6) {
  const words = tokenizeWords(text).filter(w => !STOPWORDS.has(w) && w.length > 2 && !/^\d+$/.test(w));
  if (words.length === 0) return [];

  const freqMap = {};
  for (const w of words) {
    freqMap[w] = (freqMap[w] || 0) + 1;
  }

  return Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([term, count]) => ({ term, count }));
}

/**
 * 5. Text Statistics & Readability Metrics
 */
export function computeTextMetrics(text) {
  if (!text || typeof text !== 'string') {
    return { words: 0, characters: 0, sentences: 0, readTimeSeconds: 0, readingEase: 100, level: 'Simple' };
  }

  const words = tokenizeWords(text);
  const sentences = splitSentences(text);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);

  // Total syllables
  let syllableCount = 0;
  for (const w of words) {
    syllableCount += countSyllables(w);
  }

  // Flesch Reading Ease Formula
  // 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  let readingEase = 100;
  if (wordCount > 0) {
    const raw = 206.835 - (1.015 * (wordCount / sentenceCount)) - (84.6 * (syllableCount / wordCount));
    readingEase = Math.max(0, Math.min(100, Math.round(raw)));
  }

  let level = 'Plain English (Conversational)';
  if (readingEase >= 80) level = 'Very Easy & Accessible';
  else if (readingEase >= 60) level = 'Standard / Clear';
  else if (readingEase >= 45) level = 'Fairly Complex / Technical';
  else level = 'Advanced / Academic';

  // Average reading speed: 200 words per minute (3.33 words / sec)
  const readTimeSeconds = Math.max(1, Math.round(wordCount / 3.33));

  // Lexical Diversity (Type-Token Ratio)
  const uniqueWords = new Set(words).size;
  const lexicalDiversity = wordCount > 0 ? parseFloat((uniqueWords / wordCount).toFixed(2)) : 1.0;

  return {
    words: wordCount,
    characters: text.length,
    sentences: sentenceCount,
    readTimeSeconds,
    readingEase,
    level,
    lexicalDiversity
  };
}

/**
 * 6. Full Suite NLP Analysis Object
 */
export function runFullNLPAnalysis(text) {
  return {
    timestamp: Date.now(),
    sentiment: analyzeSentiment(text),
    entities: extractNamedEntities(text),
    intent: classifyIntent(text),
    keyphrases: extractKeyphrases(text, 6),
    metrics: computeTextMetrics(text)
  };
}

/**
 * 7. Fast Extractive Summarizer
 */
export function extractKeySentences(text, maxSentences = 3) {
  const sentences = splitSentences(text);
  if (sentences.length <= maxSentences) return text;

  const keyphrases = extractKeyphrases(text, 10).map(k => k.term);
  const scores = sentences.map((sent, idx) => {
    let score = 0;
    const lower = sent.toLowerCase();
    for (const kp of keyphrases) {
      if (lower.includes(kp)) score += 2;
    }
    // Boost first sentence and conclusion
    if (idx === 0) score += 3;
    if (idx === sentences.length - 1) score += 2;
    return { sentence: sent, score, idx };
  });

  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, maxSentences).sort((a, b) => a.idx - b.idx);
  return top.map(t => t.sentence).join(' ');
}
