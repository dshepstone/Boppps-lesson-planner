// ===== STEP 1: CREATE TEXTRENDERER.JS =====
// File: ContentBlocks/renderers/TextRenderer.js
// COPY AND PASTE this EXACT code:

import React from 'react';
import RichTextEditor from '../../RichTextEditor';

const TextRenderer = ({ block, isEditMode, onBlockUpdate, htmlModes, toggleHtmlMode }) => {
    return isEditMode ? (
        <RichTextEditor
            content={block.content}
            onChange={(content) => onBlockUpdate({ ...block, content })}
            isHtmlMode={htmlModes[block.id] || false}
            onToggleHtmlMode={() => toggleHtmlMode(block.id)}
            isPreviewMode={false}
        />
    ) : (
        <div className="rich-editor-content" dangerouslySetInnerHTML={{ __html: block.content }} />
    );
};

export default TextRenderer;