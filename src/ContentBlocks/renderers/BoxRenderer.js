// ===== STEP 2: CREATE BOXRENDERER.JS =====
// File: ContentBlocks/renderers/BoxRenderer.js  
// COPY AND PASTE this EXACT code:

import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import RichTextEditor from '../../RichTextEditor'; // Adjust path if needed

const BoxRenderer = ({ block, isEditMode, onBlockUpdate, htmlModes, toggleHtmlMode }) => {
    const boxConfig = {
        'info-box': {
            bg: 'bg-blue-50',
            border: 'border-l-4 border-blue-400',
            icon: <AlertCircle className="text-blue-500" size={20} />
        },
        'exercise-box': {
            bg: 'bg-emerald-50',
            border: 'border-l-4 border-emerald-400',
            icon: <CheckCircle className="text-emerald-500" size={20} />
        },
        'warning-box': {
            bg: 'bg-amber-50',
            border: 'border-l-4 border-amber-400',
            icon: <AlertTriangle className="text-amber-500" size={20} />
        }
    }[block.type];

    return (
        <div className={`p-4 rounded-lg ${boxConfig.bg} ${boxConfig.border}`}>
            <div className="flex items-start gap-3">
                {boxConfig.icon}
                <div className="flex-1">
                    {isEditMode ? (
                        <RichTextEditor
                            content={block.content}
                            onChange={(content) => onBlockUpdate({ ...block, content })}
                            isHtmlMode={htmlModes[block.id] || false}
                            onToggleHtmlMode={() => toggleHtmlMode(block.id)}
                            isPreviewMode={false}
                        />
                    ) : (
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BoxRenderer;