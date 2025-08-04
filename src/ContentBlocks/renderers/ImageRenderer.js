// ===== STEP 2: CREATE IMAGERENDERER.JS =====
// File: ContentBlocks/renderers/ImageRenderer.js

import React from 'react';
import { generateImageCitation } from '../../Utils/contentUtils';

const ImageRenderer = ({ block, isEditMode, onBlockUpdate, htmlModes, toggleHtmlMode }) => {
    const sizeClass = {
        small: 'max-w-xs',
        medium: 'max-w-md',
        large: 'max-w-2xl',
        full: 'w-full'
    }[block.size] || 'max-w-md';

    const imageCitation = generateImageCitation(block.imageTitle, block.imageAuthor, block.imageSource, block.imageDate);

    return (
        <div className="my-6 text-center">
            <img src={block.src} alt={block.alt} className={`${sizeClass} h-auto rounded-xl shadow-lg mx-auto`} />
            {block.caption && (
                <div className="bg-gray-50 border border-gray-200 p-3 mt-3 rounded-lg text-sm text-gray-600 text-left max-w-2xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: block.caption }} />
            )}
            {imageCitation && (
                <div className="bg-gray-50 border border-gray-200 p-3 mt-2 rounded-lg text-sm text-gray-600 text-left max-w-2xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: imageCitation }} />
            )}
        </div>
    );
};

export default ImageRenderer;