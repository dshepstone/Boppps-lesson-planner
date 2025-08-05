import React from 'react';
import TextRenderer from './renderers/TextRenderer';
import HeadlineRenderer from './renderers/HeadlineRenderer';
import BoxRenderer from './renderers/BoxRenderer';
import VideoRenderer from './renderers/VideoRenderer';
import ImageRenderer from './renderers/ImageRenderer';
import GalleryRenderer from './renderers/GalleryRenderer';
import AudioRenderer from './renderers/AudioRenderer';
import CardRenderer from './renderers/CardRenderer';

const BlockRenderer = ({ block, isEditMode, onBlockUpdate, htmlModes, toggleHtmlMode }) => {
    const commonProps = {
        block,
        isEditMode,
        onBlockUpdate,
        htmlModes,
        toggleHtmlMode
    };

    switch (block.type) {
        case 'text':
        case 'heading':
        case 'list':
            return <TextRenderer {...commonProps} />;

        case 'headline':
            return <HeadlineRenderer {...commonProps} />;

        case 'info-box':
        case 'exercise-box':
        case 'warning-box':
            return <BoxRenderer {...commonProps} />;

        case 'video':
            return <VideoRenderer {...commonProps} />;

        case 'image':
            return <ImageRenderer {...commonProps} />;

        case 'gallery':
            return <GalleryRenderer {...commonProps} />;

        case 'audio':
            return <AudioRenderer {...commonProps} />;

        case 'cards':
            return <CardRenderer {...commonProps} />;

        default:
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">Unknown content type: {block.type}</p>
                </div>
            );
    }
};

export default BlockRenderer;