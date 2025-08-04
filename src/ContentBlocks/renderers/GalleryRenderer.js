// ===== STEP 3: CREATE GALLERYRENDERER.JS =====
// File: ContentBlocks/renderers/GalleryRenderer.js

import React from 'react';
import { generateImageCitation } from '../../Utils/contentUtils';

const GalleryRenderer = ({ block, isEditMode, onBlockUpdate, htmlModes, toggleHtmlMode }) => {
    const cols = block.columns || '2';
    let gridClass;
    switch (cols) {
        case '4':
            gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';
            break;
        case '3':
            gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
            break;
        case '2':
        default:
            gridClass = 'grid-cols-1 sm:grid-cols-2';
            break;
    }

    return (
        <div className="my-6">
            <div className={`grid ${gridClass} gap-4 print-gallery-cols-${cols}`}>
                {block.items.map((item, index) => {
                    const itemCitation = generateImageCitation(item.imageTitle, item.imageAuthor, item.imageSource, item.imageDate);
                    return (
                        <div key={index} className="group flex flex-col">
                            <div className="flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
                                <img src={item.src} alt={item.alt} className="max-w-full h-auto object-contain self-center rounded-lg shadow-md group-hover:shadow-lg transition-shadow" />
                            </div>
                            {item.caption && (
                                <div className="bg-gray-50 border border-gray-200 p-2 mt-2 rounded-lg text-sm text-gray-600"
                                    dangerouslySetInnerHTML={{ __html: item.caption }} />
                            )}
                            {itemCitation && (
                                <div className="bg-gray-50 border border-gray-200 p-2 mt-1 rounded-lg text-sm text-gray-600"
                                    dangerouslySetInnerHTML={{ __html: itemCitation }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GalleryRenderer;