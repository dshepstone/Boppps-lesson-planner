// ===== STEP 5: CREATE CARDRENDERER.JS =====
// File: ContentBlocks/renderers/CardRenderer.js

import React from 'react';

const CardRenderer = ({ block, isEditMode, onBlockUpdate, htmlModes, toggleHtmlMode }) => {
    const layoutClass = {
        '2x1': 'grid-cols-1 md:grid-cols-2',
        '2x2': 'grid-cols-1 md:grid-cols-2',
        '3x1': 'grid-cols-1 md:grid-cols-3',
        '1x3': 'grid-cols-1'
    }[block.layout] || 'grid-cols-1 md:grid-cols-2';

    const cardStyleConfig = {
        info: { bg: 'bg-slate-50', border: 'border-l-slate-400', accent: 'text-slate-700' },
        exercise: { bg: 'bg-emerald-50', border: 'border-l-emerald-400', accent: 'text-emerald-700' },
        warning: { bg: 'bg-amber-50', border: 'border-l-amber-400', accent: 'text-amber-700' },
        success: { bg: 'bg-green-50', border: 'border-l-green-400', accent: 'text-green-700' }
    }[block.style] || { bg: 'bg-slate-50', border: 'border-l-slate-400', accent: 'text-slate-700' };

    return (
        <div className="my-6">
            <div className={`grid ${layoutClass} gap-4`}>
                {block.items.map((item, index) => (
                    <div key={index} className={`p-6 rounded-xl border-l-4 ${cardStyleConfig.bg} ${cardStyleConfig.border} shadow-sm hover:shadow-md transition-shadow`}>
                        <h4 className={`font-semibold mb-3 ${cardStyleConfig.accent}`}>{item.title}</h4>
                        <div className="text-gray-700 card-content" dangerouslySetInnerHTML={{ __html: item.content }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CardRenderer;