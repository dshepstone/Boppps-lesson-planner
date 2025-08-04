// ===== STEP 1: CREATE TEXTRENDERER.JS =====
// File: ContentBlocks/renderers/TextRenderer.js
// COPY AND PASTE this EXACT code:

import React from 'react';
import RichTextEditor from '../../RichTextEditor'; // Adjust path if needed

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
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />
    );
};

export default TextRenderer;