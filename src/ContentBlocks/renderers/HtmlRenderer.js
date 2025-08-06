import React, { useEffect, useRef } from 'react';
import { Indent, Outdent } from 'lucide-react';

const HtmlRenderer = ({ block, isEditMode, onBlockUpdate }) => {
  const textareaRef = useRef(null);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const maxHeight = 600;
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  };

  useEffect(() => {
    if (isEditMode) autoResize();
  }, [block.content, isEditMode]);

  const handleChange = (e) => {
    onBlockUpdate({ ...block, content: e.target.value });
  };

  const handleIndent = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart, selectionEnd } = ta;
    const value = block.content;
    const before = value.slice(0, selectionStart);
    const selected = value.slice(selectionStart, selectionEnd);
    const after = value.slice(selectionEnd);
    const lines = selected.split('\n');
    const indented = lines.map((line) => `  ${line}`).join('\n');
    const newValue = before + indented + after;
    onBlockUpdate({ ...block, content: newValue });
    requestAnimationFrame(() => {
      ta.selectionStart = selectionStart + 2;
      ta.selectionEnd = selectionEnd + 2 * lines.length;
    });
  };

  const handleOutdent = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart, selectionEnd } = ta;
    const value = block.content;
    const before = value.slice(0, selectionStart);
    const selected = value.slice(selectionStart, selectionEnd);
    const after = value.slice(selectionEnd);
    let removed = 0;
    const lines = selected.split('\n');
    const outdented = lines
      .map((line) => {
        if (line.startsWith('  ')) {
          removed += 2;
          return line.slice(2);
        }
        if (line.startsWith('\t')) {
          removed += 1;
          return line.slice(1);
        }
        return line;
      })
      .join('\n');
    const newValue = before + outdented + after;
    onBlockUpdate({ ...block, content: newValue });
    requestAnimationFrame(() => {
      ta.selectionStart = Math.max(selectionStart - 2, 0);
      ta.selectionEnd = Math.max(selectionEnd - removed, 0);
    });
  };

  return isEditMode ? (
    <div className="space-y-2">
      <div className="flex gap-2 text-gray-600">
        <button
          type="button"
          onClick={handleIndent}
          className="p-1 hover:text-black"
          title="Indent"
        >
          <Indent className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleOutdent}
          className="p-1 hover:text-black"
          title="Outdent"
        >
          <Outdent className="w-4 h-4" />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={handleChange}
        className="w-full min-h-[150px] max-h-[600px] overflow-auto resize-y p-3 border border-gray-300 rounded-lg font-mono text-sm"
      />
    </div>
  ) : (
    <div
      className="html-block-preview rich-editor-content"
      dangerouslySetInnerHTML={{ __html: block.content }}
    />
  );
};

export default HtmlRenderer;
