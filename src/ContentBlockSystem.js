// Add these imports to the top of your LessonTemplate.js
import React, { useState } from 'react';
import { ChevronDown, Plus, Type, Image, Video, CreditCard, Volume2 } from 'lucide-react';

// Content Block Types Components
const TextBlock = ({ content, onUpdate, blockId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(content || '');

    const handleSave = () => {
        onUpdate(blockId, { type: 'text', content: text });
        setIsEditing(false);
    };

    return (
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
            {isEditing ? (
                <div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your text content..."
                    />
                    <div className="mt-2 flex gap-2">
                        <button
                            onClick={handleSave}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div onClick={() => setIsEditing(true)} className="cursor-pointer min-h-[50px]">
                    {text || <span className="text-gray-400">Click to add text content...</span>}
                </div>
            )}
        </div>
    );
};

const ImageBlock = ({ content, onUpdate, blockId }) => {
    const [imageUrl, setImageUrl] = useState(content?.url || '');
    const [caption, setCaption] = useState(content?.caption || '');

    const handleUpdate = () => {
        onUpdate(blockId, {
            type: 'image',
            content: { url: imageUrl, caption }
        });
    };

    return (
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="space-y-3">
                <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onBlur={handleUpdate}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter image URL..."
                />
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt={caption || 'Content image'}
                        className="max-w-full h-auto rounded"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                )}
                <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onBlur={handleUpdate}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter image caption..."
                />
            </div>
        </div>
    );
};

const VideoBlock = ({ content, onUpdate, blockId }) => {
    const [videoUrl, setVideoUrl] = useState(content?.url || '');
    const [title, setTitle] = useState(content?.title || '');

    const handleUpdate = () => {
        onUpdate(blockId, {
            type: 'video',
            content: { url: videoUrl, title }
        });
    };

    return (
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="space-y-3">
                <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    onBlur={handleUpdate}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter video URL (YouTube, Vimeo, etc.)..."
                />
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleUpdate}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter video title..."
                />
                {videoUrl && (
                    <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                        <div className="text-center">
                            <Video className="mx-auto mb-2 text-gray-400" size={48} />
                            <p className="text-sm text-gray-600">Video: {title || 'Untitled'}</p>
                            <p className="text-xs text-gray-500 mt-1">URL: {videoUrl}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const CardBlock = ({ content, onUpdate, blockId }) => {
    const [cardTitle, setCardTitle] = useState(content?.title || '');
    const [cardContent, setCardContent] = useState(content?.content || '');
    const [cardType, setCardType] = useState(content?.cardType || 'info');

    const handleUpdate = () => {
        onUpdate(blockId, {
            type: 'card',
            content: { title: cardTitle, content: cardContent, cardType }
        });
    };

    const cardStyles = {
        info: 'border-blue-200 bg-blue-50',
        warning: 'border-yellow-200 bg-yellow-50',
        success: 'border-green-200 bg-green-50',
        error: 'border-red-200 bg-red-50'
    };

    return (
        <div className={`p-4 border rounded-lg ${cardStyles[cardType]}`}>
            <div className="space-y-3">
                <select
                    value={cardType}
                    onChange={(e) => setCardType(e.target.value)}
                    onBlur={handleUpdate}
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="info">Info Card</option>
                    <option value="warning">Warning Card</option>
                    <option value="success">Success Card</option>
                    <option value="error">Error Card</option>
                </select>
                <input
                    type="text"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    onBlur={handleUpdate}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter card title..."
                />
                <textarea
                    value={cardContent}
                    onChange={(e) => setCardContent(e.target.value)}
                    onBlur={handleUpdate}
                    className="w-full p-2 border border-gray-300 rounded min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter card content..."
                />
            </div>
        </div>
    );
};

const AudioBlock = ({ content, onUpdate, blockId }) => {
    const [audioUrl, setAudioUrl] = useState(content?.url || '');
    const [title, setTitle] = useState(content?.title || '');

    const handleUpdate = () => {
        onUpdate(blockId, {
            type: 'audio',
            content: { url: audioUrl, title }
        });
    };

    return (
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="space-y-3">
                <input
                    type="text"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    onBlur={handleUpdate}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter audio URL..."
                />
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleUpdate}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter audio title..."
                />
                {audioUrl && (
                    <div className="p-4 bg-gray-100 rounded flex items-center space-x-3">
                        <Volume2 className="text-gray-400" size={24} />
                        <div>
                            <p className="font-medium">{title || 'Untitled Audio'}</p>
                            <p className="text-sm text-gray-600">URL: {audioUrl}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Dropdown Menu Component
const AddContentDropdown = ({ onAddBlock, blockIndex }) => {
    const [isOpen, setIsOpen] = useState(false);

    const blockTypes = [
        { type: 'text', label: 'Text Block', icon: Type },
        { type: 'image', label: 'Image Block', icon: Image },
        { type: 'video', label: 'Video Block', icon: Video },
        { type: 'card', label: 'Card Block', icon: CreditCard },
        { type: 'audio', label: 'Audio Block', icon: Volume2 }
    ];

    const handleAddBlock = (blockType) => {
        onAddBlock(blockType, blockIndex);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                title="Add content block"
            >
                <Plus size={16} />
                <ChevronDown size={16} />
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                        {blockTypes.map(({ type, label, icon: Icon }) => (
                            <button
                                key={type}
                                onClick={() => handleAddBlock(type)}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                            >
                                <Icon size={16} className="text-gray-600" />
                                <span className="text-sm">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Overlay to close dropdown when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

// Content Block Wrapper Component
const ContentBlockWrapper = ({ block, blockIndex, onUpdateBlock, onAddBlock }) => {
    const renderBlock = () => {
        switch (block.type) {
            case 'text':
                return (
                    <TextBlock
                        content={block.content}
                        onUpdate={onUpdateBlock}
                        blockId={block.id}
                    />
                );
            case 'image':
                return (
                    <ImageBlock
                        content={block.content}
                        onUpdate={onUpdateBlock}
                        blockId={block.id}
                    />
                );
            case 'video':
                return (
                    <VideoBlock
                        content={block.content}
                        onUpdate={onUpdateBlock}
                        blockId={block.id}
                    />
                );
            case 'card':
                return (
                    <CardBlock
                        content={block.content}
                        onUpdate={onUpdateBlock}
                        blockId={block.id}
                    />
                );
            case 'audio':
                return (
                    <AudioBlock
                        content={block.content}
                        onUpdate={onUpdateBlock}
                        blockId={block.id}
                    />
                );
            default:
                return <div>Unknown block type</div>;
        }
    };

    return (
        <div className="relative group mb-6">
            <div className="flex items-start space-x-4">
                <div className="flex-1">
                    {renderBlock()}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <AddContentDropdown
                        onAddBlock={onAddBlock}
                        blockIndex={blockIndex}
                    />
                </div>
            </div>
        </div>
    );
};

// Main Hook for managing content blocks
const useContentBlocks = (initialBlocks = []) => {
    const [blocks, setBlocks] = useState(initialBlocks);

    const generateId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const addBlock = (blockType, afterIndex) => {
        const newBlock = {
            id: generateId(),
            type: blockType,
            content: blockType === 'text' ? '' : {}
        };

        setBlocks(prevBlocks => {
            const newBlocks = [...prevBlocks];
            newBlocks.splice(afterIndex + 1, 0, newBlock);
            return newBlocks;
        });
    };

    const updateBlock = (blockId, blockData) => {
        setBlocks(prevBlocks =>
            prevBlocks.map(block =>
                block.id === blockId ? { ...block, ...blockData } : block
            )
        );
    };

    const removeBlock = (blockId) => {
        setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
    };

    return {
        blocks,
        addBlock,
        updateBlock,
        removeBlock,
        setBlocks
    };
};

// Export the components and hook for use in LessonTemplate.js
export {
    ContentBlockWrapper,
    AddContentDropdown,
    useContentBlocks,
    TextBlock,
    ImageBlock,
    VideoBlock,
    CardBlock,
    AudioBlock
};