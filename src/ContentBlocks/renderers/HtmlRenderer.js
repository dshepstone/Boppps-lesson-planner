import React from 'react';

const HtmlRenderer = ({ block, isEditMode, onBlockUpdate }) => {
  return isEditMode ? (
    <textarea
      value={block.content}
      onChange={(e) => onBlockUpdate({ ...block, content: e.target.value })}
      className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg font-mono text-sm"
    />
  ) : (
    <div
      className="html-block-preview rich-editor-content"
      dangerouslySetInnerHTML={{ __html: block.content }}
    />
  );
};

export default HtmlRenderer;
