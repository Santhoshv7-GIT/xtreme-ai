import React, { useMemo } from 'react';
import CodeBlock from './CodeBlock';

// Helper to render LaTeX math using window.katex if available
function renderMath(text) {
  if (typeof window !== 'undefined' && window.katex) {
    // Replace display math $$...$$
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
      try {
        return window.katex.renderToString(expr.trim(), { displayMode: true, throwOnError: false });
      } catch (e) {
        return match;
      }
    });

    // Replace inline math $...$
    text = text.replace(/\$([^\$\n]+?)\$/g, (match, expr) => {
      try {
        return window.katex.renderToString(expr.trim(), { displayMode: false, throwOnError: false });
      } catch (e) {
        return match;
      }
    });
  }
  return text;
}

export default function MarkdownRenderer({ content = '', onRunCode }) {
  // Parse content into chunks of plain text and fenced code blocks
  const parts = useMemo(() => {
    const segments = [];
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          value: content.slice(lastIndex, match.index)
        });
      }

      segments.push({
        type: 'code',
        language: match[1] || 'plaintext',
        value: match[2].trimEnd()
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      segments.push({
        type: 'text',
        value: content.slice(lastIndex)
      });
    }

    return segments;
  }, [content]);

  // Render a text chunk with simple markdown elements and math formulas
  const renderTextSegment = (text, key) => {
    // Process math formulas first
    const processedWithMath = renderMath(text);

    // Simple line-by-line markdown rendering
    const lines = processedWithMath.split('\n');
    const elements = [];
    let listBuffer = [];
    let isOrdered = false;

    const flushList = () => {
      if (listBuffer.length > 0) {
        if (isOrdered) {
          elements.push(
            <ol key={`ol-${elements.length}`} style={{ paddingLeft: '24px', margin: '10px 0' }}>
              {listBuffer.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} style={{ paddingLeft: '24px', margin: '10px 0' }}>
              {listBuffer.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}
            </ul>
          );
        }
        listBuffer = [];
      }
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      // Heading 1
      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={lineIdx} dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(2)) }} />);
        return;
      }
      // Heading 2
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={lineIdx} dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(3)) }} />);
        return;
      }
      // Heading 3
      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={lineIdx} dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(4)) }} />);
        return;
      }
      // Heading 4
      if (trimmed.startsWith('#### ')) {
        flushList();
        elements.push(<h4 key={lineIdx} style={{ fontSize: '15px', marginTop: '14px', marginBottom: '6px' }} dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(5)) }} />);
        return;
      }

      // Horizontal Rule
      if (trimmed === '---' || trimmed === '***') {
        flushList();
        elements.push(<hr key={lineIdx} style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />);
        return;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={lineIdx} dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(2)) }} />
        );
        return;
      }

      // Unordered list item
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        isOrdered = false;
        listBuffer.push(formatInline(trimmed.slice(2)));
        return;
      }

      // Ordered list item (e.g. 1. )
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (orderedMatch) {
        isOrdered = true;
        listBuffer.push(formatInline(orderedMatch[2]));
        return;
      }

      // Table line (simple detection)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushList();
        elements.push(
          <div key={lineIdx} style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', margin: '4px 0', overflowX: 'auto' }} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
        );
        return;
      }

      // Empty line
      if (trimmed === '') {
        flushList();
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={lineIdx} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
      );
    });

    flushList();

    return <div key={key} className="model-text-content">{elements}</div>;
  };

  // Inline formatting: bold, italic, inline code, links
  const formatInline = (str) => {
    let out = str;
    // Bold: **text**
    out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*
    out = out.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Inline code: `code`
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Markdown links: [text](url)
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--text-link);text-decoration:underline;">$1</a>');
    return out;
  };

  return (
    <div>
      {parts.map((part, idx) => {
        if (part.type === 'code') {
          return (
            <CodeBlock 
              key={idx} 
              language={part.language} 
              code={part.value} 
              onRunCode={onRunCode}
            />
          );
        }
        return renderTextSegment(part.value, idx);
      })}
    </div>
  );
}
