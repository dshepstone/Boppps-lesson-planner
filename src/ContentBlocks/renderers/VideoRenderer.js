// ===== STEP 1: CREATE VIDEORENDERER.JS =====
// File: ContentBlocks/renderers/VideoRenderer.js

import React from 'react';
import { generateVideoCitation } from '../../Utils/contentUtils'; // Note: you had generateAPACitation - check your actual function name

const VideoRenderer = ({ block, isEditMode, onBlockUpdate, htmlModes, toggleHtmlMode }) => {
    const aspectClass = {
        '16-9': 'pb-[56.25%]',
        '4-3': 'pb-[75%]',
        '1-1': 'pb-[100%]',
        '21-9': 'pb-[42.85%]'
    }[block.aspectRatio] || 'pb-[56.25%]';

    // Note: You had generateAPACitation - adjust this to match your actual function name
    const videoCitation = generateVideoCitation(block.videoTitle, block.videoAuthor, block.videoDate, block.videoSource, block.videoUrl);

    return (
        <div className="my-6">
            <div className={`relative w-full ${aspectClass} overflow-hidden rounded-xl bg-gray-900 shadow-lg`}>
                <iframe
                    src={block.src}
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
            </div>
            {videoCitation && (
                <div className="bg-gray-50 border border-gray-200 p-3 mt-3 rounded-lg text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ __html: videoCitation }} />
            )}
        </div>
    );
};

export default VideoRenderer;