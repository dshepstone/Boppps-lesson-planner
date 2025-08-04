// ===== STEP 4: CREATE AUDIORENDERER.JS =====
// File: ContentBlocks/renderers/AudioRenderer.js

import React from 'react';
import { generateAudioCitation } from '../../Utils/contentUtils';
import AudioPlayer from '../AudioPlayer'; // Adjust path to your AudioPlayer component

const AudioRenderer = ({ block, isEditMode, onBlockUpdate, htmlModes, toggleHtmlMode }) => {
    const audioCitation = generateAudioCitation(block.audioTitle, block.audioCreator, block.audioSourceInfo, block.audioDateInfo);

    return (
        <AudioPlayer
            src={block.src}
            description={block.description}
            citation={audioCitation}
        />
    );
};

export default AudioRenderer;