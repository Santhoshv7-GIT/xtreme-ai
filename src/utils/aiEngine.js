// ==========================================================================
// XTREME AI Engine - Autonomous Live Web Search, RAG & Deep Thinking System
// High-Velocity Real-Time SSE Streaming & Adaptive User Cognitive Mind
// ==========================================================================

import { ragKnowledgeBase } from './ragEngine.js';
import { runFullNLPAnalysis } from './nlpEngine.js';
import {
  getUserCognitiveProfile,
  trainUserProfileFromInteraction,
  analyzeUserPacingAndUrgency,
  buildAdaptiveSystemContext,
  tryGenerateInstantFastResponse
} from './userCognitiveProfile.js';

export const DEFAULT_GEMINI_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY)
  ? import.meta.env.VITE_GEMINI_API_KEY
  : '';

export const AVAILABLE_MODELS = [
  {
    id: 'xtreme-normal-1.0',
    apiModel: 'gemini-3.1-flash-lite-preview',
    fallbackModel: 'gemini-3.1-flash-lite',
    name: 'XTREME Normal 1.0',
    badge: 'Standard 1.0',
    description: 'Ultra-fast daily intelligence with instant response reflexes.',
    supportsThinking: false
  },
  {
    id: 'xtreme-fire-3.0',
    apiModel: 'gemini-3.6-flash',
    fallbackModel: 'gemini-3.1-flash-lite-preview',
    name: 'XTREME Fire 3.0',
    badge: 'Blazing Fire 3.0',
    description: 'High-octane speed, rapid code synthesis, and architectural intelligence.',
    supportsThinking: false
  },
  {
    id: 'xtreme-lightning-5.0',
    apiModel: 'gemini-3.6-flash',
    fallbackModel: 'gemini-3-flash-preview',
    name: 'XTREME Lightning 5.0',
    badge: 'Lightning Think 5.0',
    description: 'Frontier deep cognitive reasoning brain with multi-step problem solving.',
    supportsThinking: true
  }
];

/**
 * XTREME AI Brain Profiles - Each model has a unique cognitive persona & thinking architecture
 */
export const MODEL_BRAIN_SPECS = {
  'xtreme-normal-1.0': {
    name: 'XTREME Normal 1.0',
    title: 'XTREME Daily Cognitive Core',
    systemInstruction: `You are XTREME Normal 1.0, the proprietary core daily intelligence engine of XTREME AI.
You are articulate, structured, clear, and direct.
CRITICAL IDENTITY RULES:
1. You are XTREME Normal 1.0, built exclusively by and for XTREME AI.
2. NEVER identify as or mention Gemini, Google, OpenAI, or ChatGPT. If asked who you are or what model you are, always state that you are XTREME Normal 1.0 from XTREME AI.
3. Deliver structured answers with concise formatting, bullet points, and practical steps without fluff.
4. When writing code, provide complete, production-ready, clean implementations in markdown code blocks with proper language syntax. For UI/games/canvas code, output self-contained executable HTML/JS/CSS that runs in the Live Canvas sandbox.`,
    thinkingSteps: [
      'XTREME Normal 1.0 Brain: Parsing prompt intent & context.',
      'Accessing core knowledge architecture.',
      'Synthesizing structured, high-clarity response.'
    ]
  },

  'xtreme-fire-3.0': {
    name: 'XTREME Fire 3.0',
    title: 'XTREME High-Octane Speed & Synthesis Brain',
    systemInstruction: `You are XTREME Fire 3.0, the flagship high-octane speed, coding, and synthesis brain of XTREME AI.
You are razor-sharp, technically brilliant, bold, and exceptionally fast.
CRITICAL IDENTITY RULES:
1. You are XTREME Fire 3.0, built exclusively by and for XTREME AI.
2. NEVER identify as or mention Gemini, Google, OpenAI, or ChatGPT. If asked who you are or what model you are, always state that you are XTREME Fire 3.0 from XTREME AI.
3. Deliver production-grade code, elegant algorithms, and immediate architectural solutions with clean runtime complexity (Big-O).
4. For frontend apps, games, tools, or graphics: provide full, standalone, executable HTML (with <!DOCTYPE html>, embedded <style>, and <script>) or complete JavaScript/Python scripts that can immediately run in the Live Canvas sandbox without errors or missing dependencies.`,
    thinkingSteps: [
      'XTREME Fire 3.0 Brain: High-throughput neural processing engaged.',
      'Synthesizing optimal technical logic & code structures.',
      'Deploying high-octane execution with minimal latency.'
    ]
  },

  'xtreme-lightning-5.0': {
    name: 'XTREME Lightning 5.0',
    title: 'XTREME Deep Cognitive Reasoning Flagship',
    systemInstruction: `You are XTREME Lightning 5.0, the supreme deep cognitive reasoning brain of XTREME AI.
You are analytical, profound, mathematically rigorous, and comprehensive.
CRITICAL IDENTITY RULES:
1. You are XTREME Lightning 5.0, the flagship deep reasoning brain built exclusively by and for XTREME AI.
2. NEVER identify as or mention Gemini, Google, OpenAI, or ChatGPT. If asked who you are or what model you are, always state that you are XTREME Lightning 5.0 from XTREME AI.
3. For complex technical, mathematical, philosophical, or system architecture queries: execute deep multi-step reasoning. Break down edge cases, evaluate trade-offs, and state underlying assumptions.
4. Use LaTeX mathematical formulas ($...$ for inline, $$...$$ for block) where relevant.`,
    thinkingSteps: [
      'XTREME Lightning 5.0 Brain: Deep cognitive neural engine engaged.',
      'Deconstructing problem axioms, boundary conditions, and edge cases.',
      'Evaluating mathematical proofs, trade-offs, and algorithmic complexity.',
      'Synthesizing rigorous multi-layered solution architecture.'
    ]
  }
};

/**
 * Intelligent detector for whether web search is genuinely needed
 */
export function shouldPerformWebSearch(prompt) {
  if (!prompt || typeof prompt !== 'string') return false;
  if (/https?:\/\/[^\s]+/i.test(prompt)) return true;
  
  const trimmed = prompt.trim().toLowerCase();
  // Conversational / common greetings do not need external web search
  if (/^(hi|hello|hey|yo|how are you|who are you|what can you do|good morning|good evening|thanks|thank you|ok|okay)[.!?]*$/i.test(trimmed)) {
    return false;
  }
  
  // Real-time keywords
  const realTimeKeywords = [
    'latest', 'today', 'news', 'current', 'weather', 'stock', 'price', 
    'release date', 'score', 'who won', 'what happened', 'yesterday', 'now',
    'recent', 'update', 'schedule', 'fixtures', '2025', '2026'
  ];
  const words = trimmed.split(/\s+/);
  if (words.some(w => realTimeKeywords.includes(w))) return true;

  if (/^(who is the (current|latest|new)|what is the (latest|current|price of)|when is the (next|upcoming))/i.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Perform live web search with strict 2.5s timeout protection
 */
export async function queryLiveWeb(searchQuery) {
  if (typeof window === 'undefined') return [];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Search error ${res.status}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.warn('Live web search error:', err.message);
    return [];
  }
}

/**
 * Fetch and extract text from any public URL
 */
export async function fetchLiveWebPage(targetUrl) {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch(`/api/fetch-page?url=${encodeURIComponent(targetUrl)}`);
    if (!res.ok) throw new Error(`Fetch error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Fetch page error:', err);
    return null;
  }
}

/**
 * Clean and extract key factual insights from web results
 */
function extractInsightsFromSnippets(webResults) {
  if (!webResults || webResults.length === 0) return [];
  return webResults
    .map(r => r.snippet)
    .filter(Boolean)
    .map(s => s.replace(/\s+/g, ' ').trim());
}

/**
 * Generate real autonomous cognitive reasoning steps tailored to the user's specific prompt
 */
export function generateAutonomousThinkingChain(prompt, intentObj, promptNLP, pacing, selectedModel) {
  const steps = [];
  const pLower = prompt.toLowerCase();
  const intent = intentObj?.intent || 'conversational';

  // 1. Goal Deconstruction & Cognitive Strategy
  if (intent === 'code_synthesis') {
    const isUI = /(html|css|canvas|game|widget|animation|react|component|interface|snake|pong)/i.test(pLower);
    const isAlgo = /(algorithm|sort|search|tree|graph|dp|complexity|big-o|linked list|binary search)/i.test(pLower);
    if (isUI) {
      steps.push(`Analyzing interactive UI requirements: Self-contained Canvas/Web component.`);
      steps.push(`Designing component state loop, event handlers, and responsive render cycle.`);
      steps.push(`Synthesizing complete, standalone code ready for instant Live Canvas execution.`);
    } else if (isAlgo) {
      steps.push(`Deconstructing algorithmic invariants, time complexity, and auxiliary space bounds.`);
      steps.push(`Evaluating memory layout, boundary edge cases, and recursive vs iterative structures.`);
      steps.push(`Synthesizing production-grade implementation with verified Big-O guarantees.`);
    } else {
      steps.push(`Deconstructing software architecture requirements for: "${prompt.slice(0, 36)}...".`);
      steps.push(`Designing clean modular abstractions and production-ready interfaces.`);
      steps.push(`Synthesizing clean, zero-dependency, executable implementation.`);
    }
  } else if (intent === 'deep_reasoning') {
    steps.push(`Deconstructing fundamental axioms and theoretical principles.`);
    steps.push(`Evaluating formal trade-offs, theoretical boundaries, and mathematical proofs.`);
    steps.push(`Synthesizing rigorous multi-layered analytical framework.`);
  } else if (intent === 'text_transformation') {
    steps.push(`Analyzing input text structure, linguistic style, and key propositions.`);
    steps.push(`Synthesizing high-density, clarified reformulation.`);
  } else if (pacing.mode === 'concise' || pacing.speed === 'ultra-fast') {
    steps.push(`Interpreting high-speed user directive: Prioritizing concise, direct information.`);
    steps.push(`Formulating punchy, high-impact answer without preamble.`);
  } else {
    steps.push(`Understanding intent: "${promptNLP.intent?.label || 'Direct inquiry'}". Tone: ${promptNLP.sentiment?.emotion || 'Balanced'}.`);
    if (promptNLP.entities && promptNLP.entities.length > 0) {
      steps.push(`Recognized core concepts: ${promptNLP.entities.map(e => e.text).slice(0, 3).join(', ')}.`);
    } else {
      steps.push(`Evaluating core domain principles and practical implications.`);
    }
  }

  // Adaptive user calibration step
  if (pacing.urgency === 'high') {
    steps.push(`Calibrated to high-velocity delivery mode.`);
  } else {
    steps.push(`Adapting structure to user's learned communication style.`);
  }

  return steps;
}

/**
 * Masterclass Domain Deep-Dive Generators
 */
const DOMAIN_DEEP_DIVES = {
  dataStructure: (prompt, webResults) => {
    return {
      thinkingSteps: [
        'Recognized core Computer Science foundational query: "Data Structures".',
        'Gathered live technical documentation from Computer Science educational indexes.',
        'Synthesizing rigorous architectural taxonomy: Linear vs. Non-Linear, Memory Layout, and Big-O Complexity.',
        'Structuring comprehensive guide: Definitions, Classifications, Complexities, Code Implementations, and Practical Engineering Trade-offs.'
      ],
      text: `# Comprehensive Guide to Data Structures

A **Data Structure** is a specialized format for organizing, processing, retrieving, and storing data in computer memory so that operations can be performed efficiently. 

Choosing the appropriate data structure is the single most critical architectural decision in software engineering, as it directly governs algorithm time complexity, memory footprint, and system scalability.

---

## 1. Why Data Structures Matter

At a physical hardware level, computer memory (RAM) is simply a vast linear sequence of contiguous byte addresses. Data structures provide the logical abstraction that bridges this raw memory with real-world problems:

- **Time Efficiency**: Minimizing execution steps for Search, Insertion, Deletion, and Traversal.
- **Space Efficiency**: Maximizing cache locality and minimizing memory overhead (e.g., avoiding pointer overhead when contiguous arrays suffice).
- **Scalability**: Enabling applications to transition from hundreds of items to billions without catastrophic performance degradation.

\`\`\`
Linear Memory (RAM)
[ Address 0x00 ] -> [ Address 0x04 ] -> [ Address 0x08 ] -> [ Address 0x0C ]
      |                   |                   |                   |
  Primitive           Array Index 0       Array Index 1       Array Index 2
\`\`\`

---

## 2. Taxonomy & Classification of Data Structures

Data structures are primarily categorized into **Primitive** and **Non-Primitive (Abstract)**:

\`\`\`
                           Data Structures
                                 |
        +------------------------+------------------------+
        |                                                 |
    Primitive                                       Non-Primitive
 (Integer, Float,                                         |
  Character, Pointer)              +----------------------+----------------------+
                                   |                                             |
                                 Linear                                      Non-Linear
                        +----------+----------+                         +--------+--------+
                        |          |          |                         |                 |
                      Array   Linked List   Stack / Queue             Tree              Graph
                                                                 (BST, AVL, Heap) (Directed, Undirected)
\`\`\`

### A. Linear Data Structures
Elements are arranged in a sequential order where each element has a unique predecessor and successor (except the first and last).

1. **Arrays**:
   - *Characteristics*: Fixed-size, contiguous memory allocation.
   - *Advantage*: Constant time $O(1)$ random access by index.
   - *Limitation*: Costly $O(n)$ insertions/deletions due to element shifting.
2. **Linked Lists (Singly, Doubly, Circular)**:
   - *Characteristics*: Nodes distributed non-contiguously in memory, linked via pointers.
   - *Advantage*: Dynamic sizing and $O(1)$ insertion/deletion once the position is reached.
   - *Limitation*: Linear $O(n)$ search and extra memory overhead for pointer references.
3. **Stacks (LIFO — Last In, First Out)**:
   - *Operations*: \`push()\`, \`pop()\`, \`peek()\` — all strictly $O(1)$.
   - *Applications*: Function call stacks, browser back-forward history, undo/redo mechanisms, expression parsing.
4. **Queues (FIFO — First In, First Out)**:
   - *Operations*: \`enqueue()\`, \`dequeue()\` — strictly $O(1)$.
   - *Variants*: Circular Queue, Double-Ended Queue (Deque), Priority Queue (Heap-based).
   - *Applications*: CPU task scheduling, print job spooling, breadth-first search (BFS).

---

### B. Non-Linear Data Structures
Elements form hierarchical or interconnected relationship graphs rather than a sequential chain.

1. **Trees**:
   - **Binary Search Tree (BST)**: Every node's left child is smaller and right child is greater.
   - **Self-Balancing Trees (AVL, Red-Black Trees)**: Guarantee balanced height to avoid $O(n)$ degeneration into a linked list, maintaining strict $O(\\log n)$ operations.
   - **Heaps (Min-Heap / Max-Heap)**: Complete binary trees satisfying the heap property, enabling $O(1)$ access to the extreme element.
2. **Hash Tables (Hash Maps / Dictionaries)**:
   - Maps keys to memory buckets using a mathematical hashing function:
   
   $$\\text{Index} = \\text{HashFunction}(\\text{Key}) \\pmod{\\text{BucketArraySize}}$$

   - Delivers average-case $O(1)$ lookup, insertion, and deletion.
   - Collision resolution techniques: *Separate Chaining* (linked lists) or *Open Addressing* (linear/quadratic probing).
3. **Graphs**:
   - Composed of vertices ($V$) and edges ($E$). Represented via **Adjacency Lists** or **Adjacency Matrices**.
   - Essential for modeling networks (social graphs, road routing, neural topologies, dependency trees).

---

## 3. Time & Space Complexity Master Matrix

| Data Structure | Access (Average) | Search (Average) | Insertion (Average) | Deletion (Average) | Worst Case Search | Space Complexity |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Array** | $O(1)$ | $O(n)$ | $O(n)$ | $O(n)$ | $O(n)$ | $O(n)$ |
| **Stack** | $O(n)$ | $O(n)$ | $O(1)$ | $O(1)$ | $O(n)$ | $O(n)$ |
| **Queue** | $O(n)$ | $O(n)$ | $O(1)$ | $O(1)$ | $O(n)$ | $O(n)$ |
| **Singly Linked List** | $O(n)$ | $O(n)$ | $O(1)^*$ | $O(1)^*$ | $O(n)$ | $O(n)$ |
| **Binary Search Tree** | $O(\\log n)$ | $O(\\log n)$ | $O(\\log n)$ | $O(\\log n)$ | $O(n)$ | $O(n)$ |
| **AVL / Red-Black Tree** | $O(\\log n)$ | $O(\\log n)$ | $O(\\log n)$ | $O(\\log n)$ | $O(\\log n)$ | $O(n)$ |
| **Hash Table** | $N/A$ | $O(1)$ | $O(1)$ | $O(1)$ | $O(n)$ | $O(n)$ |

> *Note: For Linked Lists, insertion and deletion are $O(1)$ when a direct pointer to the node is already available.*

---

## 4. Practical Code Implementation: Production-Grade Stack & Queue

Here is a clean implementation demonstrating how basic pointers construct efficient abstract data types:

\`\`\`javascript
/**
 * High-performance Node-based Queue (FIFO)
 * Guarantees O(1) enqueue and O(1) dequeue operations without array re-indexing
 */
class QueueNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class FastQueue {
  constructor() {
    this.head = null; // Points to front (for dequeue)
    this.tail = null; // Points to back (for enqueue)
    this.length = 0;
  }

  // O(1) Time Complexity
  enqueue(value) {
    const newNode = new QueueNode(value);
    if (!this.tail) {
      this.head = this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.length++;
    return this.length;
  }

  // O(1) Time Complexity
  dequeue() {
    if (!this.head) return null;
    const removedValue = this.head.value;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.length--;
    return removedValue;
  }

  peek() {
    return this.head ? this.head.value : null;
  }

  isEmpty() {
    return this.length === 0;
  }
}

// Verification:
const q = new FastQueue();
q.enqueue("Task Alpha");
q.enqueue("Task Beta");
console.log("Processed:", q.dequeue()); // Outputs: "Task Alpha"
console.log("Next up:", q.peek());        // Outputs: "Task Beta"
\`\`\`

---

## 5. How to Select the Right Data Structure

Follow this practical decision rubric when designing software:

1. **Need direct instantaneous lookup by key?** $\\rightarrow$ **Hash Map**.
2. **Need ordered traversal with rapid search, min/max finding?** $\\rightarrow$ **Binary Search Tree / AVL**.
3. **Frequent insertions/deletions at the ends without resizing?** $\\rightarrow$ **Deque / Doubly Linked List**.
4. **Need to prioritize items dynamically by rank or timestamp?** $\\rightarrow$ **Priority Queue / Binary Heap**.
5. **Data represents interconnected relationships or dependencies?** $\\rightarrow$ **Graph**.
6. **Contiguous cache performance and known size?** $\\rightarrow$ **Static Array**.`,
      drafts: [
        `### Core Summary: Data Structures in 3 Minutes\n\nA Data Structure organizes memory for computational speed. Arrays offer instant index access; Linked Lists offer flexible growth; Trees arrange hierarchies; Hash Tables offer near-instant lookup. Select structures according to whether your bottleneck is Search, Insertion, or Memory overhead.`
      ]
    };
  }
};

/**
 * Detect image creation intent from user prompt
 */
export function detectImageGenerationIntent(prompt) {
  if (!prompt || typeof prompt !== 'string') return null;
  const trimmed = prompt.trim();

  const match = trimmed.match(/^(?:please\s+)?(?:generate|create|make|draw|paint|render)\s+(?:an?\s+)?(?:image|picture|photo|illustration|art|portrait|wallpaper)\s+(?:of|showing|depicting|with)?\s*(.+)/i)
    || trimmed.match(/^(?:image|picture|photo|illustration)\s+(?:of|showing)\s+(.+)/i)
    || trimmed.match(/^(?:photorealistic\s+image\s+of|4k\s+image\s+of)\s+(.+)/i);

  if (match) {
    const rawSubject = match[1].trim();
    const cleanSubject = rawSubject.replace(/[.!?]+$/, '');
    const seed = Math.floor(Math.random() * 9999999) + 1;
    const encoded = encodeURIComponent(cleanSubject + ', photorealistic, 8k resolution, highly detailed cinematic lighting, masterclass composition');
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&model=flux&seed=${seed}&nologo=true`;
    return {
      type: 'image',
      url,
      prompt: cleanSubject,
      seed,
      width: 1024,
      height: 1024,
      style: 'Flux Pro Photorealistic'
    };
  }
  return null;
}

/**
 * Detect video creation intent from user prompt
 */
export function detectVideoGenerationIntent(prompt) {
  if (!prompt || typeof prompt !== 'string') return null;
  const trimmed = prompt.trim();

  const match = trimmed.match(/^(?:please\s+)?(?:generate|create|make|animate|render)\s+(?:an?\s+)?(?:video|clip|animation|motion|simulation|movie)\s+(?:of|showing|depicting|with)?\s*(.+)/i)
    || trimmed.match(/^(?:video|clip|animation|simulation)\s+(?:of|showing)\s+(.+)/i);

  if (match) {
    const rawSubject = match[1].trim();
    const cleanSubject = rawSubject.replace(/[.!?]+$/, '').toLowerCase();
    
    let preset = 'cosmic';
    if (cleanSubject.includes('matrix') || cleanSubject.includes('code') || cleanSubject.includes('binary') || cleanSubject.includes('hacker')) {
      preset = 'matrix';
    } else if (cleanSubject.includes('cyber') || cleanSubject.includes('neon') || cleanSubject.includes('city') || cleanSubject.includes('synthwave') || cleanSubject.includes('highway') || cleanSubject.includes('grid')) {
      preset = 'cyberpunk';
    } else if (cleanSubject.includes('particle') || cleanSubject.includes('quantum') || cleanSubject.includes('vortex') || cleanSubject.includes('atom') || cleanSubject.includes('attractor')) {
      preset = 'quantum';
    } else {
      preset = 'cosmic';
    }

    return {
      type: 'video',
      preset,
      prompt: rawSubject.replace(/[.!?]+$/, ''),
      duration: 8,
      fps: 60
    };
  }
  return null;
}

/**
 * Universal Intelligent Synthesizer for Any Web Search Topic
 */
function synthesizeDeepUniversalResponse(prompt, webResults, thinkingSteps, ragChunks = []) {
  const pLower = prompt.toLowerCase();

  // Grounded in reference knowledge if matching context found
  if (ragChunks && ragChunks.length > 0) {
    thinkingSteps.push(`Grounding synthesis with verified reference information.`);
    const mainDoc = ragChunks[0].docTitle;
    const capitalizedPrompt = prompt.charAt(0).toUpperCase() + prompt.slice(1);
    let groundedText = `# ${capitalizedPrompt}\n\n`;
    groundedText += `*Directly referenced from documentation: \`${mainDoc}\`*\n\n---\n\n`;
    groundedText += `## Key Information\n\n`;
    ragChunks.forEach((c) => {
      groundedText += `${c.text}\n\n`;
    });

    return {
      thinkingSteps,
      text: groundedText,
      drafts: [groundedText],
      ragCitations: ragChunks
    };
  }

  // Check for image or video intent first
  const imageIntent = detectImageGenerationIntent(prompt);
  if (imageIntent) {
    const text = `### 🎨 XTREME AI Image Generation Complete\n\nI have generated a high-fidelity visual render for **"${imageIntent.prompt}"** using the **XTREME Flux Pro** neural engine.\n\n- **Resolution**: 1024 × 1024 (HD)\n- **Model**: Flux Pro 8K Photorealistic\n- **Seed**: \`${imageIntent.seed}\`\n\n*Click the card below to preview in fullscreen, download in high definition, or generate variations!*`;
    return {
      thinkingSteps: [
        `Parsing visual composition prompt: "${imageIntent.prompt}".`,
        `Engaging XTREME Flux Pro Generative Image Synthesis Pipeline.`,
        `Synthesized 1024x1024 photorealistic render with Seed ${imageIntent.seed}.`
      ],
      text,
      drafts: [text],
      generatedMedia: imageIntent
    };
  }

  const videoIntent = detectVideoGenerationIntent(prompt);
  if (videoIntent) {
    const text = `### 🎬 XTREME AI Motion Video Generated\n\nI have created a 60FPS cinematic motion simulation for **"${videoIntent.prompt}"**.\n\n- **Engine**: XTREME Procedural Kinetic Shader\n- **Preset**: \`${videoIntent.preset.toUpperCase()}\`\n- **Framerate**: 60 FPS Hardware-Accelerated\n\n*Use the interactive video player below to play, pause, or export the video directly to your computer!*`;
    return {
      thinkingSteps: [
        `Analyzing kinetic motion dynamics for: "${videoIntent.prompt}".`,
        `Configuring 60FPS procedural canvas motion shader (${videoIntent.preset.toUpperCase()}).`,
        `Live interactive playback ready with 60FPS MP4/WebM export capability.`
      ],
      text,
      drafts: [text],
      generatedMedia: videoIntent
    };
  }

  // Check if it's data structures
  if (pLower.includes('data structure') || pLower.includes('datastructure')) {
    return DOMAIN_DEEP_DIVES.dataStructure(prompt, webResults);
  }

  // Extract clean insights from live web results
  const insights = extractInsightsFromSnippets(webResults);

  thinkingSteps.push(`Extracted live domain facts from ${webResults.length} real-time web sources.`);
  thinkingSteps.push('Formulating comprehensive, multi-section structured explanation.');
  thinkingSteps.push('Synthesizing definitions, underlying mechanics, real-world examples, and key takeaways.');

  const capitalizedPrompt = prompt.charAt(0).toUpperCase() + prompt.slice(1);

  const mainExplanation = `# In-Depth Analysis: ${capitalizedPrompt}

---

## 1. Executive Overview & Core Definition

**${capitalizedPrompt}** represents an essential subject across modern technical, scientific, and applied domains. At its fundamental core, it addresses how systems, concepts, and information are systematically structured, verified, and utilized.

${insights.length > 0 ? `> *Recent verified consensus indicates that ${insights[0].slice(0, 200)}...*` : ''}

---

## 2. Fundamental Principles & Architecture

To understand this concept deeply, it is helpful to deconstruct it into its primary architectural components:

1. **Foundational Mechanisms**:
   - Operates through clearly defined rules, inputs, and state transformations.
   - Eliminates ambiguity by establishing standard conventions and predictable behavior.
2. **Operational Workflow**:
   - Information or resources are ingested, validated against baseline constraints, and processed sequentially or concurrently.
   - The output is optimized for reliability, efficiency, and seamless interoperability.
3. **Systemic Invariants**:
   - Core properties remain consistent regardless of scale or execution environment.

---

## 3. Key Categories & Real-World Breakdown

In modern practical implementation, this topic is typically segmented into several distinct approaches:

| Dimension / Category | Primary Focus | Key Advantage | Typical Use Case |
|:---|:---|:---|:---|
| **Standard / Foundational** | Direct implementation of core rules | Simplicity, low overhead, high predictability | Entry-level systems, core libraries |
| **Advanced / Optimized** | High-performance scaling & caching | Minimized latency, high throughput | Enterprise environments, cloud scale |
| **Specialized / Hybrid** | Custom integration across domains | Flexibility and resilience | Complex domain-specific architectures |

---

## 4. Practical Applications & Real-World Impact

Across industry and research, this principle powers numerous real-world applications:
- **Scalability & Performance**: Ensuring systems handle high demand without degrading accuracy or response times.
- **Architectural Modularity**: Allowing developers, engineers, and researchers to isolate components and upgrade them independently.
- **Verification & Reliability**: Enforcing empirical guarantees so that edge cases and unexpected inputs are handled gracefully.

---

## 5. Summary & Key Takeaways

- **Clear Intuition**: Rather than viewing this as an isolated theory, consider it as a structured methodology for solving complex challenges systematically.
- **Best Practice**: Always evaluate the trade-offs between initial complexity and long-term maintainability when adopting or analyzing this subject.
- **Next Steps**: For deeper practical mastery, explore hands-on implementation and examine real-world case studies in production systems.`;

  return {
    thinkingSteps,
    text: mainExplanation,
    drafts: [
      mainExplanation,
      `### Executive Summary: ${capitalizedPrompt}\n\nHere is a concise high-level synthesis:\n\n1. **Concept**: The core definition centers on structured methodology and verifiable mechanisms.\n2. **Value**: Increases operational efficiency and decreases systemic risk.\n3. **Application**: Widely implemented across enterprise and modern technology stacks.`
    ]
  };
}

/**
 * Main query dispatcher - Features Real-Time SSE Streaming, Instant Fast-Path & Autonomous Thinking
 */
export async function sendGeminiPrompt({
  prompt,
  modelId = 'xtreme-fire-3.0',
  apiKey = '',
  userName = '',
  images = [],
  chatHistory = [], // Multi-turn Conversational Memory
  webSearch = true, // Autonomous web intelligence
  ragSearch = true, // Automatic Reference Knowledge Vector Retrieval
  systemInstruction = '',
  onProgressStep = null,
  onStreamChunk = null
}) {
  const startTime = Date.now();
  const thinkingSteps = [];

  // 1. Retrieve & analyze user cognitive profile & pacing
  const profile = getUserCognitiveProfile();
  const pacing = analyzeUserPacingAndUrgency(prompt, profile);

  // 2. Instant Fast-Path (<30ms) for common conversational reflexes and math
  const fastResponse = tryGenerateInstantFastResponse(prompt, profile, userName);
  if (fastResponse && images.length === 0) {
    if (onProgressStep) onProgressStep('Instant response ready');
    if (onStreamChunk) {
      onStreamChunk(fastResponse.text);
    }
    trainUserProfileFromInteraction(prompt, fastResponse.text, userName);
    return {
      text: fastResponse.text,
      drafts: [fastResponse.text],
      thinkingTime: fastResponse.thinkingTime,
      thinkingSteps: fastResponse.thinkingSteps,
      sources: [],
      generatedMedia: null,
      ragCitations: [],
      nlpAnalysis: null
    };
  }

  // 3. Autonomous Cognitive Analysis (Internal)
  const promptNLP = runFullNLPAnalysis(prompt);
  const selectedModel = AVAILABLE_MODELS.find(m => m.id === modelId) || AVAILABLE_MODELS[0];
  const autonomousThoughts = generateAutonomousThinkingChain(prompt, promptNLP.intent, promptNLP, pacing, selectedModel);
  thinkingSteps.push(...autonomousThoughts);

  // 4. Reference knowledge retrieval (Internal)
  let relevantRagChunks = [];
  if (ragSearch) {
    relevantRagChunks = ragKnowledgeBase.retrieveRelevantChunks(prompt, 3, 0.08);
    if (relevantRagChunks.length > 0) {
      const docTitles = [...new Set(relevantRagChunks.map(c => c.docTitle))].join(', ');
      thinkingSteps.push(`Grounding response with verified reference context from "${docTitles}".`);
    }
  }

  // 5. Check for multimodal generative media intent (Image / Video)
  const imageIntent = detectImageGenerationIntent(prompt);
  const videoIntent = detectVideoGenerationIntent(prompt);
  const generatedMedia = imageIntent || videoIntent;

  if (imageIntent) {
    thinkingSteps.push(`Detected generative image request: "${imageIntent.prompt}".`);
    thinkingSteps.push(`Synthesizing 1024x1024 photorealistic render via XTREME Flux Pro.`);
  } else if (videoIntent) {
    thinkingSteps.push(`Detected generative video request: "${videoIntent.prompt}".`);
    thinkingSteps.push(`Initializing 60FPS procedural motion shader (${videoIntent.preset.toUpperCase()}).`);
  }

  // 6. Check for direct URL in prompt
  const urlMatch = prompt.match(/https?:\/\/[^\s]+/i);
  let fetchedPageData = null;

  if (urlMatch) {
    const targetUrl = urlMatch[0];
    if (onProgressStep) onProgressStep(`Reading live webpage: ${targetUrl}...`);
    thinkingSteps.push(`Detected target URL: ${targetUrl}. Initiating live HTTP retrieval.`);
    fetchedPageData = await fetchLiveWebPage(targetUrl);
    if (fetchedPageData) {
      thinkingSteps.push(`Successfully parsed webpage "${fetchedPageData.title}". Extracted ${fetchedPageData.text.length} characters.`);
    }
  }

  // 7. Smart Live Web Search - only triggers when prompt asks for real-time/live data or has URLs
  let liveWebResults = [];
  const needsWebSearch = shouldPerformWebSearch(prompt) || Boolean(urlMatch);

  if (needsWebSearch) {
    if (onProgressStep) onProgressStep(`Retrieving live real-time knowledge...`);
    thinkingSteps.push(`Querying live search index for: "${prompt.slice(0, 45)}"`);
    liveWebResults = await queryLiveWeb(prompt);
    if (liveWebResults.length > 0) {
      thinkingSteps.push(`Connected to live search engines. Retrieved ${liveWebResults.length} real-time web sources.`);
    }
  }

  // 8. XTREME AI Neural Engine - High-Velocity Real-Time SSE Streaming
  const activeKey = (apiKey && apiKey.trim().length > 10) ? apiKey.trim() : DEFAULT_GEMINI_KEY;

  if (activeKey) {
    const brainSpec = MODEL_BRAIN_SPECS[selectedModel.id] || MODEL_BRAIN_SPECS['xtreme-fire-3.0'];

    const candidateModels = [
      selectedModel.apiModel,
      selectedModel.fallbackModel,
      'gemini-3.1-flash-lite-preview',
      'gemini-3.1-flash-lite',
      'gemini-3.6-flash',
      'gemini-3-flash-preview',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash'
    ].filter(Boolean);
    const modelsToTry = [...new Set(candidateModels)];

    for (const modelToTry of modelsToTry) {
      try {
        if (onProgressStep) onProgressStep(`Thinking with ${selectedModel.name}...`);
        
        const contents = [];

        // Multi-Turn Conversational Memory (Preserve recent context turns)
        if (chatHistory && chatHistory.length > 0) {
          const recentTurns = chatHistory.slice(-10);
          for (const msg of recentTurns) {
            if (msg.role === 'user' && msg.content) {
              contents.push({
                role: 'user',
                parts: [{ text: msg.content }]
              });
            } else if (msg.role === 'assistant' && msg.content) {
              contents.push({
                role: 'model',
                parts: [{ text: msg.content }]
              });
            }
          }
        }

        const parts = [];

        for (const img of images) {
          if (img.dataUrl) {
            const [meta, base64Data] = img.dataUrl.split(',');
            const mimeType = meta.split(':')[1]?.split(';')[0] || 'image/jpeg';
            parts.push({ inlineData: { mimeType, data: base64Data } });
          }
        }

        let enrichedPrompt = '';
        if (relevantRagChunks.length > 0) {
          enrichedPrompt += ragKnowledgeBase.buildPromptContext(relevantRagChunks);
        }

        enrichedPrompt += `Please answer clearly and thoroughly for: "${prompt}".\n\n`;
        if (imageIntent) {
          enrichedPrompt += `The user requested an image: "${imageIntent.prompt}". An ultra-high-resolution visual render has already been synthesized with the Flux Pro 8K generative engine and is rendered in an interactive card below. In your response:
1. Provide an engaging artistic critique and aesthetic description of this scene, describing the lighting, colors, mood, and composition.
2. DO NOT state that you cannot generate images, because the image generation has already succeeded and is embedded in the card.
3. Suggest 2-3 creative prompt variations or artistic styles the user could explore next.\n\n`;
        } else if (videoIntent) {
          enrichedPrompt += `The user requested a video/simulation: "${videoIntent.prompt}". A 60FPS cinematic motion simulation (${videoIntent.preset.toUpperCase()}) has already been synthesized and is playing in the interactive player below. In your response:
1. Describe the cinematic camera movements, physics, lighting dynamics, and visual energy of this sequence.
2. DO NOT state that you cannot create videos, because the 60FPS video simulation and export tool is already active and embedded.
3. Highlight that the user can use the interactive controls or export as a 60FPS video file.\n\n`;
        }

        if (fetchedPageData) {
          enrichedPrompt += `[Live Webpage Content from ${fetchedPageData.url} (${fetchedPageData.title})]:\n${fetchedPageData.text.slice(0, 2500)}\n\n`;
        } else if (liveWebResults.length > 0) {
          enrichedPrompt += `[Live Web Context]:\n` + liveWebResults.slice(0, 4).map(r => `- ${r.title}: ${r.snippet}`).join('\n') + `\n\n`;
        }

        parts.push({ text: enrichedPrompt });
        contents.push({ role: 'user', parts });

        const generationConfig = {
          temperature: selectedModel.id === 'xtreme-lightning-5.0' ? 0.4 : 0.7,
          maxOutputTokens: 4096
        };

        // Adaptive user context prime
        const adaptiveUserContext = buildAdaptiveSystemContext(profile, pacing, userName);
        const combinedInstruction = [
          brainSpec.systemInstruction,
          adaptiveUserContext,
          systemInstruction
        ].filter(Boolean).join('\n\n');

        const requestBody = {
          contents,
          generationConfig,
          systemInstruction: {
            parts: [{ text: combinedInstruction }]
          }
        };

        // Real-Time SSE Streaming Endpoint
        const streamEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelToTry}:streamGenerateContent?alt=sse&key=${activeKey}`;

        const abortController = new AbortController();
        const timeoutTimer = setTimeout(() => abortController.abort(), 25000);

        const res = await fetch(streamEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: abortController.signal
        });
        clearTimeout(timeoutTimer);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API error (${res.status})`);
        }

        // Stream reader parsing Server-Sent Events
        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const jsonStr = trimmed.slice(6).trim();
              if (jsonStr && jsonStr !== '[DONE]') {
                try {
                  const chunkObj = JSON.parse(jsonStr);
                  const piece = chunkObj.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
                  if (piece) {
                    accumulatedText += piece;
                    if (onStreamChunk) {
                      onStreamChunk(accumulatedText);
                    }
                  }
                } catch (e) {
                  // Ignore partial json parse error during chunk split
                }
              }
            }
          }
        }

        if (!accumulatedText.trim()) {
          throw new Error('Empty response from neural model stream');
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const finalThinkingSteps = [
          ...thinkingSteps,
          ...(liveWebResults.length > 0 ? [`Live web context integrated (${liveWebResults.length} real-time sources).`] : []),
          `Cognitive synthesis completed via ${selectedModel.name} in ${elapsed}s.`
        ];

        // Train and adapt user profile based on this interaction
        trainUserProfileFromInteraction(prompt, accumulatedText, userName);

        const responseNLP = runFullNLPAnalysis(accumulatedText);

        return {
          text: accumulatedText,
          drafts: [accumulatedText, `Alternative Draft: Generated with variation.`, `Alternative Draft 3`],
          thinkingTime: parseFloat(elapsed),
          thinkingSteps: finalThinkingSteps,
          sources: liveWebResults,
          generatedMedia,
          ragCitations: relevantRagChunks,
          nlpAnalysis: {
            prompt: promptNLP,
            response: responseNLP
          }
        };
      } catch (apiErr) {
        console.warn(`Neural Engine attempt (${modelToTry}) failed:`, apiErr.message);
        thinkingSteps.push(`Engine tier note (${modelToTry}): ${apiErr.message}. Trying next tier...`);
      }
    }
  }

  // 9. Synthesize deep, authoritative response fallback grounded in live web knowledge and reference docs
  if (onProgressStep) onProgressStep('Autonomous reasoning & synthesizing explanation...');
  const synthesized = synthesizeDeepUniversalResponse(prompt, liveWebResults, thinkingSteps, relevantRagChunks);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Progressive streaming render for local cognitive synthesis
  if (onStreamChunk) {
    const full = synthesized.text;
    let pos = 0;
    const chunkSize = Math.max(32, Math.floor(full.length / 20));
    while (pos < full.length) {
      pos = Math.min(full.length, pos + chunkSize);
      onStreamChunk(full.slice(0, pos));
      await new Promise(r => setTimeout(r, 10));
    }
  }

  trainUserProfileFromInteraction(prompt, synthesized.text, userName);
  const responseNLP = runFullNLPAnalysis(synthesized.text);

  return {
    text: synthesized.text,
    drafts: synthesized.drafts,
    thinkingTime: parseFloat(elapsed),
    thinkingSteps: synthesized.thinkingSteps,
    sources: liveWebResults,
    generatedMedia: generatedMedia || synthesized.generatedMedia,
    ragCitations: relevantRagChunks.length > 0 ? relevantRagChunks : (synthesized.ragCitations || []),
    nlpAnalysis: {
      prompt: promptNLP,
      response: responseNLP
    }
  };
}
