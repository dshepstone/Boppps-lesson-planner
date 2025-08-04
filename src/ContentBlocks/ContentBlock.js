// ContentBlock Component with Dropdown Menu - FIXED VERSION
import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronDown,
    Plus,
    Video,
    Image,
    Music,
    CreditCard,
    List,
    AlertCircle,
    CheckCircle,
    AlertTriangle,
    FileText,
    Edit3,
    X,
    GripVertical,
    ChevronUp
} from 'lucide-react';

// Import your modular components
import RichTextEditor from '../RichTextEditor';

// Import utility functions and components (adjust paths based on your structure)
import {
    generateVideoCitation, // FIXED: Changed from generateAPACitation
    generateImageCitation,
    generateAudioCitation
} from '../Utils/contentUtils';

// Simple AudioPlayer component fallback if the external one doesn't exist
const AudioPlayer = ({ src, description, citation }) => {
    return (
        <div className="my-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <audio controls className="w-full mb-3">
                <source src={src} type="audio/mpeg" />
                <source src={src} type="audio/wav" />
                <source src={src} type="audio/ogg" />
                Your browser does not support the audio element.
            </audio>
            {description && (
                <div className="text-sm text-gray-600 mb-2">{description}</div>
            )}
            {citation && (
                <div className="bg-white border border-gray-200 p-3 rounded-lg text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ __html: citation }} />
            )}
        </div>
    );
};

const ContentBlock = ({
    block,
    onEdit,
    onDelete,
    isEditMode,
    onDragStart,
    onDrop,
    onDragOver,
    onBlockUpdate,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
    htmlModes,
    toggleHtmlMode,
    onAddBlockBelow, // NEW: Function to add block below current block
    sectionId // NEW: Current section ID
}) => {
    // Now your existing state variables should work:
    const [isDragging, setIsDragging] = React.useState(false);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const blockRef = React.useRef(null);
    const dropdownRef = React.useRef(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // FIXED: Only handle drag events from the drag handle, not the entire block
    const handleDragStart = (e) => {
        if (e.target.closest('.drag-handle')) {
            setIsDragging(true);
            onDragStart && onDragStart(e, block.id);
        } else {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        onDrop && onDrop(e);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        onDragOver && onDragOver(e);
    };

    const handleBlockMouseDown = (e) => {
        if (e.target.closest('.drag-handle')) {
            e.stopPropagation();
        }
    };

    // NEW: Handle adding content below this block
    const handleAddContent = (contentType) => {
        if (onAddBlockBelow) {
            onAddBlockBelow(block.id, contentType, sectionId);
        } else {
            // Fallback - you can implement a default behavior here
            alert(`Add ${contentType} block functionality needs to be implemented in the parent component`);
        }
        setShowDropdown(false);
    };

    // Content type options for dropdown
    const contentOptions = [
        { type: 'text', icon: FileText, label: 'Text Block', color: 'text-gray-600' },
        { type: 'heading', icon: FileText, label: 'Heading', color: 'text-blue-600' },
        { type: 'list', icon: List, label: 'List', color: 'text-green-600' },
        { type: 'info-box', icon: AlertCircle, label: 'Info Box', color: 'text-blue-500' },
        { type: 'exercise-box', icon: AlertCircle, label: 'Exercise Box', color: 'text-emerald-500' },
        { type: 'warning-box', icon: AlertCircle, label: 'Warning Box', color: 'text-amber-500' },
        { type: 'video', icon: Video, label: 'Video', color: 'text-red-500' },
        { type: 'image', icon: Image, label: 'Image/Gallery', color: 'text-purple-500' },
        { type: 'audio', icon: Music, label: 'Audio', color: 'text-indigo-500' },
        { type: 'cards', icon: CreditCard, label: 'Cards', color: 'text-yellow-600' },
    ];

    const renderContent = () => {
        switch (block.type) {
            case 'text':
            case 'heading':
            case 'list':
                return isEditMode ? (
                    <div onClick={(e) => e.stopPropagation()}>
                        <RichTextEditor
                            content={block.content}
                            onChange={(content) => onBlockUpdate({ ...block, content })}
                            isHtmlMode={htmlModes[block.id] || false}
                            onToggleHtmlMode={() => toggleHtmlMode(block.id)}
                            isPreviewMode={false}
                        />
                    </div>
                ) : (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />
                );

            case 'info-box':
            case 'exercise-box':
            case 'warning-box':
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
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <RichTextEditor
                                            content={block.content}
                                            onChange={(content) => onBlockUpdate({ ...block, content })}
                                            isHtmlMode={htmlModes[block.id] || false}
                                            onToggleHtmlMode={() => toggleHtmlMode(block.id)}
                                            isPreviewMode={false}
                                        />
                                    </div>
                                ) : (
                                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} />
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'video':
                const aspectClass = {
                    '16-9': 'pb-[56.25%]',
                    '4-3': 'pb-[75%]',
                    '1-1': 'pb-[100%]',
                    '21-9': 'pb-[42.85%]'
                }[block.aspectRatio] || 'pb-[56.25%]';
                // FIXED: Changed from generateAPACitation to generateVideoCitation
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

            case 'image':
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

            case 'gallery':
                const cols = block.columns || '2';
                let gridClass;
                switch (cols) {
                    case '4': gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'; break;
                    case '3': gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'; break;
                    case '2':
                    default: gridClass = 'grid-cols-1 sm:grid-cols-2'; break;
                }
                return (
                    <div className="my-6">
                        <div className={`grid ${gridClass} gap-4 print-gallery-cols-${cols}`}>
                            {block.items && block.items.map((item, index) => {
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

            case 'audio':
                const audioCitation = generateAudioCitation(block.audioTitle, block.audioCreator, block.audioSourceInfo, block.audioDateInfo);
                return (
                    <AudioPlayer
                        src={block.src}
                        description={block.description}
                        citation={audioCitation}
                    />
                );

            case 'cards':
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
                            {block.items && block.items.map((item, index) => (
                                <div key={index} className={`p-6 rounded-xl border-l-4 ${cardStyleConfig.bg} ${cardStyleConfig.border} shadow-sm hover:shadow-md transition-shadow`}>
                                    <h4 className={`font-semibold mb-3 ${cardStyleConfig.accent}`}>{item.title}</h4>
                                    <div className="text-gray-700 card-content" dangerouslySetInnerHTML={{ __html: item.content }} />
                                </div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">Unknown content type: {block.type}</div>;
        }
    };

    return (
        <div className="relative">
            {/* Main Block Container */}
            <div
                ref={blockRef}
                className={`relative group transition-all duration-200 ${isEditMode
                    ? 'border-2 border-dashed border-gray-300 p-4 m-2 rounded-xl hover:border-slate-400 hover:bg-slate-50/50'
                    : ''
                    } ${isDragging ? 'opacity-50' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onMouseDown={handleBlockMouseDown}
                onDragEnd={handleDragEnd}
            >
                {/* FIXED: Control buttons positioned to not cover HTML button */}
                {isEditMode && (
                    <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            title="Edit"
                            className="w-8 h-8 bg-slate-700 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-slate-800 transition-colors"
                        >
                            <Edit3 size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            title="Delete"
                            className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                        >
                            <X size={14} />
                        </button>

                        {/* Drag Handle */}
                        <div
                            className="drag-handle w-8 h-8 bg-gray-400 text-white rounded-lg flex items-center justify-center shadow-md cursor-grab hover:bg-gray-500 active:cursor-grabbing transition-colors"
                            title="Drag to reorder"
                            draggable={true}
                            onDragStart={handleDragStart}
                        >
                            <GripVertical size={14} />
                        </div>

                        {!isFirst && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveUp();
                                }}
                                className="w-8 h-8 bg-gray-400 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-gray-500 transition-colors"
                                title="Move Up"
                            >
                                <ChevronUp size={16} />
                            </button>
                        )}
                        {!isLast && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveDown();
                                }}
                                className="w-8 h-8 bg-gray-400 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-gray-500 transition-colors"
                                title="Move Down"
                            >
                                <ChevronDown size={16} />
                            </button>
                        )}
                    </div>
                )}

                {/* Content wrapper that doesn't interfere with editor */}
                <div className="content-wrapper" style={{ pointerEvents: isEditMode && isDragging ? 'none' : 'auto' }}>
                    {renderContent()}
                </div>
            </div>

            {/* NEW: Add Content Below Button & Dropdown */}
            {isEditMode && (
                <div className="relative flex justify-center my-2">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDropdown(!showDropdown);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                            title="Add content below this block"
                        >
                            <Plus size={16} />
                            <span className="text-sm font-medium">Add Below</span>
                            <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                                    Text Content
                                </div>
                                {contentOptions.slice(0, 6).map((option) => (
                                    <button
                                        key={option.type}
                                        onClick={() => handleAddContent(option.type)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <option.icon size={16} className={option.color} />
                                        <span>{option.label}</span>
                                    </button>
                                ))}

                                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 border-t border-gray-100 mt-1">
                                    Media Content
                                </div>
                                {contentOptions.slice(6).map((option) => (
                                    <button
                                        key={option.type}
                                        onClick={() => handleAddContent(option.type)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <option.icon size={16} className={option.color} />
                                        <span>{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentBlock;