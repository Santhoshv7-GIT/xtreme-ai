// ==========================================================================
// XTREME AI - Retrieval-Augmented Generation (RAG) Vector Engine
// In-Memory & LocalStorage Vector Indexing, Semantic Chunking & Retrieval
// ==========================================================================

import { tokenizeWords } from './nlpEngine.js';

const STORAGE_KEY = 'xtreme_rag_knowledge_base';

// Default Sample Knowledge Base Document
const DEFAULT_SAMPLE_DOC = {
  id: 'doc-xtreme-architecture',
  title: 'XTREME_AI_Architecture_Spec.md',
  type: 'markdown',
  enabled: true,
  createdAt: new Date().toISOString(),
  content: `# XTREME AI System Architecture Specification

## 1. Cognitive Architecture & Frontier Models
XTREME AI employs a tri-tier neural intelligence matrix:
- **XTREME Lightning 5.0**: Frontier cognitive reasoning brain with multi-step chain-of-thought, mathematical proofs, and Big-O computational complexity evaluation.
- **XTREME Fire 3.0**: High-octane speed and architectural synthesis engine optimized for zero-latency coding, full-stack app creation, and real-time execution.
- **XTREME Normal 1.0**: Daily conversational core intelligence delivering crisp, structured formatting.

## 2. Multimodal Generation Engines
- **Code Studio**: Live sandbox executing full-stack HTML5, Canvas 2D, WebGL shaders, CSS, and modern JavaScript with 1-click execution and source download.
- **Image Studio**: 8K photorealistic generative rendering powered by Flux Pro neural weights, supporting customizable aspect ratios (1:1, 16:9, 9:16, 4:3) and artistic style filters.
- **Video Studio**: 60FPS procedural kinetic motion simulation with hardware-accelerated MediaRecorder video synthesis, exporting clean WebM and MP4 video files.

## 3. Autonomous Web Intelligence
XTREME AI autonomously queries live web indexes with zero manual toggle requirement, retrieving real-time news, documentation, and page contents under strict 2.5s timeout barriers.

## 4. Privacy, Security & Client Execution
All document embeddings, chat histories, RAG vector chunking, and NLP calculations execute strictly client-side. No sensitive document chunks leave the user device without explicit permission.`
};

/**
 * Split text into semantic chunks with sliding overlap
 */
export function chunkDocument(text, chunkSize = 450, overlap = 90) {
  if (!text || typeof text !== 'string') return [];

  // Split into paragraphs first
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const chunks = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    if ((currentChunk + '\n\n' + para).length <= chunkSize) {
      currentChunk = currentChunk ? currentChunk + '\n\n' + para : para;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        // Overlap: take the last sentence or slice of previous chunk
        const words = currentChunk.split(/\s+/);
        const overlapWords = words.slice(-Math.min(words.length, 18)).join(' ');
        currentChunk = overlapWords + '\n\n' + para;
      } else {
        // Single paragraph larger than chunkSize -> split by sentences
        const sentences = para.split(/(?<=[.!?])\s+/);
        for (const sent of sentences) {
          if ((currentChunk + ' ' + sent).length <= chunkSize) {
            currentChunk = currentChunk ? currentChunk + ' ' + sent : sent;
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = sent;
          }
        }
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Compute Term Frequencies (TF) for a token list
 */
function computeTF(tokens) {
  const tf = {};
  const len = tokens.length || 1;
  for (const t of tokens) {
    tf[t] = (tf[t] || 0) + 1;
  }
  for (const t in tf) {
    tf[t] = tf[t] / len;
  }
  return tf;
}

/**
 * Compute Vector Norm (Euclidean Length)
 */
function computeNorm(vector) {
  let sum = 0;
  for (const t in vector) {
    sum += vector[t] * vector[t];
  }
  return Math.sqrt(sum) || 1e-9;
}

/**
 * RAG Knowledge Base Manager Class
 */
class RagKnowledgeBase {
  constructor() {
    this.documents = [];
    this.indexedChunks = [];
    this.idfMap = {};
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.documents = Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_SAMPLE_DOC];
      } else {
        this.documents = [DEFAULT_SAMPLE_DOC];
      }
    } catch (e) {
      console.warn('Failed to load RAG storage:', e);
      this.documents = [DEFAULT_SAMPLE_DOC];
    }
    this.reindexAll();
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.documents));
    } catch (e) {
      console.warn('Failed to save RAG storage:', e);
    }
  }

  /**
   * Rebuild the entire vector index (TF-IDF & Embeddings) across all active documents
   */
  reindexAll() {
    const allChunks = [];
    const docFrequency = {};

    // 1. Chunk active documents
    for (const doc of this.documents) {
      if (!doc.enabled) continue;
      const rawChunks = chunkDocument(doc.content);

      rawChunks.forEach((chunkText, idx) => {
        const tokens = tokenizeWords(chunkText);
        const uniqueTokens = new Set(tokens);
        uniqueTokens.forEach(t => {
          docFrequency[t] = (docFrequency[t] || 0) + 1;
        });

        allChunks.push({
          id: `${doc.id}-chunk-${idx}`,
          docId: doc.id,
          docTitle: doc.title,
          chunkIndex: idx + 1,
          totalChunks: rawChunks.length,
          text: chunkText,
          tokens,
          tf: computeTF(tokens)
        });
      });
    }

    // 2. Compute IDF: log(1 + N / df) + 1
    const N = allChunks.length || 1;
    const idf = {};
    for (const t in docFrequency) {
      idf[t] = Math.log(1 + (N / (1 + docFrequency[t]))) + 1;
    }
    this.idfMap = idf;

    // 3. Compute TF-IDF Vectors & Pre-normalize
    this.indexedChunks = allChunks.map(chunk => {
      const vector = {};
      for (const t in chunk.tf) {
        vector[t] = chunk.tf[t] * (idf[t] || 1);
      }
      return {
        ...chunk,
        vector,
        norm: computeNorm(vector)
      };
    });
  }

  /**
   * Add a new document to the knowledge base and reindex
   */
  addDocument({ title, content, type = 'text' }) {
    if (!content || !content.trim()) return null;
    const cleanTitle = (title && title.trim()) ? title.trim() : `Document_${Date.now()}.${type === 'markdown' ? 'md' : 'txt'}`;
    const newDoc = {
      id: 'doc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      title: cleanTitle,
      type,
      enabled: true,
      createdAt: new Date().toISOString(),
      content: content.trim()
    };
    this.documents.push(newDoc);
    this.saveToStorage();
    this.reindexAll();
    return newDoc;
  }

  /**
   * Remove a document by ID
   */
  removeDocument(docId) {
    this.documents = this.documents.filter(d => d.id !== docId);
    this.saveToStorage();
    this.reindexAll();
  }

  /**
   * Toggle a document's active state
   */
  toggleDocument(docId) {
    this.documents = this.documents.map(d => {
      if (d.id === docId) {
        return { ...d, enabled: !d.enabled };
      }
      return d;
    });
    this.saveToStorage();
    this.reindexAll();
  }

  /**
   * Clear all documents and restore default sample
   */
  resetToDefault() {
    this.documents = [DEFAULT_SAMPLE_DOC];
    this.saveToStorage();
    this.reindexAll();
  }

  /**
   * Retrieve the top-K semantically relevant chunks for a user query
   */
  retrieveRelevantChunks(query, topK = 3, threshold = 0.08) {
    if (!query || typeof query !== 'string' || this.indexedChunks.length === 0) {
      return [];
    }

    const queryTokens = tokenizeWords(query);
    if (queryTokens.length === 0) return [];

    const queryTF = computeTF(queryTokens);
    const queryVector = {};
    for (const t in queryTF) {
      queryVector[t] = queryTF[t] * (this.idfMap[t] || 1);
    }
    const queryNorm = computeNorm(queryVector);

    // Compute Cosine Similarity against all chunks
    const scored = this.indexedChunks.map(chunk => {
      let dot = 0;
      for (const t in queryVector) {
        if (chunk.vector[t]) {
          dot += queryVector[t] * chunk.vector[t];
        }
      }
      const similarity = dot / (queryNorm * chunk.norm);
      return {
        id: chunk.id,
        docId: chunk.docId,
        docTitle: chunk.docTitle,
        chunkIndex: chunk.chunkIndex,
        totalChunks: chunk.totalChunks,
        text: chunk.text,
        similarity: parseFloat(similarity.toFixed(4)),
        relevancePercent: Math.min(100, Math.round(similarity * 100))
      };
    });

    // Sort descending by similarity
    const filtered = scored
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);

    return filtered.slice(0, topK);
  }

  /**
   * Build RAG prompt augmentation string to inject into LLM
   */
  buildPromptContext(relevantChunks) {
    if (!relevantChunks || relevantChunks.length === 0) return '';

    let out = `[VERIFIED REFERENCE KNOWLEDGE]:\n`;
    relevantChunks.forEach((c, idx) => {
      out += `--- SOURCE ${idx + 1}: "${c.docTitle}" ---\n`;
      out += `${c.text}\n\n`;
    });
    out += `[REFERENCE INSTRUCTIONS]: Use the above verified knowledge to answer accurately. If the answer is grounded in this reference, cite the document name naturally without mentioning technical mechanisms.\n\n`;
    return out;
  }

  /**
   * Get stats overview
   */
  getStats() {
    const totalDocs = this.documents.length;
    const activeDocs = this.documents.filter(d => d.enabled).length;
    const totalChunks = this.indexedChunks.length;
    const totalWords = this.documents.reduce((acc, d) => acc + (d.content ? d.content.split(/\s+/).length : 0), 0);
    return {
      totalDocs,
      activeDocs,
      totalChunks,
      totalWords
    };
  }
}

// Export singleton instance
export const ragKnowledgeBase = new RagKnowledgeBase();
