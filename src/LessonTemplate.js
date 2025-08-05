/*
  LessonTemplate.js - Integrated with Modular Component System
  Preserves all original UI and functionality while using extracted Utils and ContentBlocks
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Upload, Eye, Edit3, Save, Plus, Video, Image, Music, CreditCard, X, Settings, ChevronDown, ChevronRight, GripVertical, Trash2, Copy, FileText, List, AlertCircle, CheckCircle, AlertTriangle, Play, Pause, Clock, ChevronUp } from 'lucide-react';
import { LogoProvider, useLogo } from './LogoContext';
import SchoolLogoSettings from './SchoolLogoSettings';

// Enhanced Tiptap imports - including all new extensions
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import CodeBlock from '@tiptap/extension-code-block';

// Import extracted components and utilities
import { ContentBlock } from './ContentBlocks';
import AudioPlayer from './ContentBlocks/AudioPlayer';
import RichTextEditor from './RichTextEditor';

// Phase 1 Utility Imports - Content Utils
import {
  generateId,
  extractVideoId,
  generateImageCitation,
  generateVideoCitation,
  generateAudioCitation,
  htmlToText,
  formatTime,
  formatFileSize,
  validateContent
} from './Utils/contentUtils';

// Phase 1 Utility Imports - Constants
import {
  CONTENT_TYPES,
  BOPPPS_SECTIONS,
  VIDEO_PLATFORMS,
  CARD_LAYOUTS,
  CARD_STYLES,
  BOX_CONFIGS,
  IMAGE_SIZES,
  GALLERY_COLUMNS,
  AUTO_SAVE_CONFIG
} from './Utils/constants';

// Phase 1 Utility Imports - Export Utils
import {
  blockToHtml,
  getVideoEmbedHtml,
  generateCompleteHtml
} from './Utils/exportUtils';

// Phase 1 Utility Imports - Validation Utils
import {
  validateImageFile,
  validateAudioFile,
  validateVideoUrl,
  validateEmail,
  validateFormData
} from './Utils/validationUtils';

// Test in console
console.log('✅ generateId:', generateId());
console.log('✅ CARD_STYLES:', CARD_STYLES);

const generateVideoEmbed = (platform, videoId, embedCode, aspectRatio) => {
  const aspectClass = {
    '16-9': 'pb-[56.25%]',
    '4-3': 'pb-[75%]',
    '1-1': 'pb-[100%]',
    '21-9': 'pb-[42.85%]'
  }[aspectRatio] || 'pb-[56.25%]';

  switch (platform) {
    case 'youtube':
      return `<div class="relative w-full ${aspectClass} overflow-hidden rounded-xl bg-gray-900 shadow-lg"><iframe src="https://www.youtube.com/embed/${videoId}" class="absolute top-0 left-0 w-full h-full border-0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`;
    case 'vimeo':
      return `<div class="relative w-full ${aspectClass} overflow-hidden rounded-xl bg-gray-900 shadow-lg"><iframe src="https://player.vimeo.com/video/${videoId}" class="absolute top-0 left-0 w-full h-full border-0" allowfullscreen allow="autoplay; fullscreen; picture-in-picture"></iframe></div>`;
    case 'panopto':
      return `<div class="relative w-full ${aspectClass} overflow-hidden rounded-xl bg-gray-900 shadow-lg"><iframe src="${videoId}" class="absolute top-0 left-0 w-full h-full border-0" allowfullscreen></iframe></div>`;
    case 'embed':
      return `<div class="relative w-full ${aspectClass} overflow-hidden rounded-xl bg-gray-900 shadow-lg">${embedCode}</div>`;
    default:
      return '';
  }
};

const generateAPACitation = (title, author, date, source, url) => {
  let citation = '';
  if (author) citation += `<strong>${author}.</strong> `;
  if (date) {
    const videoDate = new Date(date + 'T00:00:00');
    citation += `(${videoDate.getFullYear()}). `;
  } else if (author || title || source || url) {
    citation += `(n.d.). `;
  }
  if (title) citation += `<em>${title}</em> [Video]. `;
  if (source) citation += `${source}. `;
  if (url) citation += `<a href="${url}" target="_blank" class="text-blue-600 hover:text-blue-800">${url}</a>`;
  return citation || '';
};

// Auto-save functionality
const useAutoSave = (data, key, interval = 30000) => {
  const [lastSaved, setLastSaved] = useState(new Date());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [data]);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        try {
          localStorage.setItem(key, JSON.stringify({
            ...data,
            timestamp: new Date().toISOString(),
            autoSaved: true
          }));
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, interval);

    return () => clearInterval(autoSaveInterval);
  }, [data, hasUnsavedChanges, key, interval]);

  const loadAutoSavedData = useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsedData = JSON.parse(saved);
        if (parsedData.autoSaved) {
          return parsedData;
        }
      }
    } catch (error) {
      console.error('Failed to load auto-saved data:', error);
    }
    return null;
  }, [key]);

  const clearAutoSavedData = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return { lastSaved, hasUnsavedChanges, loadAutoSavedData, clearAutoSavedData };
};

// Save Indicator Component
const SaveIndicator = ({ message, type, show }) => (
  <div className={`fixed top-6 right-6 px-4 py-3 rounded-lg text-white text-sm font-medium z-50 transition-all duration-300 shadow-lg ${show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
    } ${type === 'saving' ? 'bg-amber-500' : type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
    }`}>
    <div className="flex items-center gap-2">
      {type === 'saving' ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : type === 'error' ? (
        <AlertTriangle size={16} />
      ) : (
        <CheckCircle size={16} />
      )}
      {message}
    </div>
  </div>
);

// Auto-save Recovery Modal
const AutoSaveRecoveryModal = ({ isOpen, onRecover, onDiscard, timestamp }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Auto-saved Content Found</h3>
              <p className="text-sm text-gray-600">
                Last saved: {new Date(timestamp).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-gray-700 mb-6">
            We found auto-saved changes from your previous session. Would you like to recover them?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onRecover}
              className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
            >
              Recover Changes
            </button>
            <button
              onClick={onDiscard}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// App.js (near your imports)
const studentFriendlyTitles = {
  'bridge-in': 'Getting Started',
  'outcomes': "What You'll Learn Today",
  'pre-assessment': 'Quick Check-In',
  'participatory-learning': "Let's Dive In",
  'post-assessment': "Your Turn: Show What You Know",
  'summary': 'Key Takeaways',
  // you can add Resources & Materials or Overview if you like:
  'overview': 'Session Overview',
  'resources': 'Resources & Materials',
};

// Section Component
const Section = ({ section, onUpdate, isEditMode, onAddContent, onDeleteSection, onBlockEdit, isOpen, onToggle, htmlModes, toggleHtmlMode, onAddBlockBelow }) => {
  const [draggedBlock, setDraggedBlock] = useState(null);

  const handleBlockDragStart = (e, blockId) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBlockDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedBlock === null) return;

    const sourceIndex = section.blocks.findIndex(b => b.id === draggedBlock);
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;

    const newBlocks = [...section.blocks];
    const [movedBlock] = newBlocks.splice(sourceIndex, 1);
    newBlocks.splice(targetIndex, 0, movedBlock);

    onUpdate({ ...section, blocks: newBlocks });
    setDraggedBlock(null);
  };

  const handleBlockUpdate = (updatedBlock) => {
    const newBlocks = section.blocks.map(b => (b.id === updatedBlock.id ? updatedBlock : b));
    onUpdate({ ...section, blocks: newBlocks });
  };

  const handleBlockEdit = (blockId) => {
    const blockToEdit = section.blocks.find(b => b.id === blockId);
    if (blockToEdit) {
      onBlockEdit(blockToEdit, section.id);
    }
  };

  const handleBlockDelete = (blockId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      const newBlocks = section.blocks.filter(b => b.id !== blockId);
      onUpdate({ ...section, blocks: newBlocks });
    }
  };

  const handleBlockMove = (blockId, direction) => {
    const index = section.blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;

    const newBlocks = [...section.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    // Swap elements
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

    onUpdate({ ...section, blocks: newBlocks });
  };

  const sectionColors = {
    'overview': { bg: 'bg-slate-600', hover: 'hover:bg-slate-700' },
    'bridge-in': { bg: 'bg-red-500', hover: 'hover:bg-red-600' },
    'outcomes': { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
    'pre-assessment': { bg: 'bg-amber-500', hover: 'hover:bg-amber-600' },
    'participatory-learning': { bg: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    'post-assessment': { bg: 'bg-purple-500', hover: 'hover:bg-purple-600' },
    'summary': { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600' },
    'resources': { bg: 'bg-gray-600', hover: 'hover:bg-gray-700' }
  };

  const colorConfig = sectionColors[section.id] || { bg: 'bg-slate-600', hover: 'hover:bg-slate-700' };

  const headerLabel = studentFriendlyTitles[section.id]
    ? `${section.title} (${studentFriendlyTitles[section.id]})`
    : section.title;

  return (
    <div
      id={section.id}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden transition-all duration-200 hover:shadow-md print-break-inside-avoid"
    >
      <div
        className={`${colorConfig.bg} ${colorConfig.hover} text-white px-8 py-6 cursor-pointer flex justify-between items-center relative overflow-hidden transition-colors no-print`}
        onClick={onToggle}
      >
        <h2 className="text-xl font-semibold">
          {headerLabel}
        </h2>

        <div className="flex items-center gap-3">
          {isEditMode &&
            section.id !== 'overview' &&
            section.id !== 'resources' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      `Are you sure you want to delete the entire "${section.title}" section?`
                    )
                  ) {
                    onDeleteSection(section.id);
                  }
                }}
                className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
            <ChevronRight size={20} />
          </div>
        </div>
      </div>

      <div className={`accordion-content-wrapper ${isOpen ? 'is-open' : ''}`}>
        {/* This inner div is essential for the grid animation to work correctly */}
        <div>
          <div className="p-8">
            {section.blocks.map((block, index) => (
              <ContentBlock
                key={block.id}
                block={block}
                isEditMode={isEditMode}
                onEdit={() => handleBlockEdit(block.id)}
                onDelete={() => handleBlockDelete(block.id)}
                onBlockUpdate={handleBlockUpdate}
                onDragStart={(e) => handleBlockDragStart(e, block.id)}
                onDrop={(e) => handleBlockDrop(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onMoveUp={() => handleBlockMove(block.id, 'up')}
                onMoveDown={() => handleBlockMove(block.id, 'down')}
                isFirst={index === 0}
                isLast={index === section.blocks.length - 1}
                htmlModes={htmlModes}
                toggleHtmlMode={toggleHtmlMode}
                onAddBlockBelow={onAddBlockBelow}
                sectionId={section.id}
              />
            ))}

            {isEditMode && (
              <div className="mt-6 flex justify-center no-print">
                <button
                  onClick={() => onAddContent(section.id)}
                  className="w-10 h-10 bg-slate-600 text-white rounded-xl flex items-center justify-center hover:bg-slate-700 shadow-md transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Control Panel Component
const ControlPanel = ({
  isEditMode,
  onToggleEditMode,
  onExportPDF,
  onExportHTML,
  onSave,
  onLoad,
  onAddSection,
  onAddContent,
  week,
  onWeekChange,
  date,
  onDateChange,
  isOpen,
  onToggle,
  onOpenLogoSettings,
  hasUnsavedChanges,
  lastSaved,
  sections,
  defaultSection,
  onDefaultSectionChange,
  instructorName,
  instructorEmail,
  onHeaderDataChange,
  headerData,
}) => (
  <div className={`fixed top-6 right-6 z-50 transition-all duration-300 no-print ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 min-w-80 max-w-96">
      <div className="bg-slate-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
        <h3 className="font-semibold text-lg">Template Controls</h3>
        <button onClick={onToggle} className="text-white hover:text-gray-300 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 max-h-[75vh] overflow-y-auto">
        {hasUnsavedChanges && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-amber-700">
              <Clock size={16} />
              <span className="text-sm font-medium">Auto-saving...</span>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Week:</label>
          <select
            value={week}
            onChange={(e) => onWeekChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            {Array.from({ length: 15 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Week {i + 1}</option>
            ))}
          </select>

          {/* Instructor Info */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Instructor Name</label>
            <input
              type="text"
              value={instructorName}
              onChange={e => onHeaderDataChange('instructorName', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent mb-4"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-2">Instructor Email</label>
            <input
              type="email"
              value={instructorEmail}
              onChange={e => onHeaderDataChange('instructorEmail', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent mb-4"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title</label>
            <input
              type="text"
              value={headerData.courseTopic}
              onChange={e => onHeaderDataChange('courseTopic', e.target.value)}
              placeholder="Enter course title"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          {/* FOOTER SETTINGS SECTION - Add this block to your ControlPanel component */}
          <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">🦶 Footer Information</h4>

            <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title & Code</label>
            <input
              type="text"
              value={headerData.footerCourseInfo}
              onChange={e => onHeaderDataChange('footerCourseInfo', e.target.value)}
              placeholder="e.g., Animation Foundations - DSGN1140"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent mb-4"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-2">Institution Name</label>
            <input
              type="text"
              value={headerData.footerInstitution}
              onChange={e => onHeaderDataChange('footerInstitution', e.target.value)}
              placeholder="e.g., Conestoga College"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent mb-4"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-2">Copyright Notice</label>
            <input
              type="text"
              value={headerData.footerCopyright}
              onChange={e => onHeaderDataChange('footerCopyright', e.target.value)}
              placeholder="e.g., © 2025 All Rights Reserved"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <label className="block text-sm font-semibold text-gray-700 mb-2">Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={onToggleEditMode}
          className={`w-full p-4 mb-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${isEditMode
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
            : 'bg-slate-700 hover:bg-slate-800 text-white shadow-md'
            }`}
        >
          {isEditMode ? <Eye size={18} /> : <Edit3 size={18} />}
          {isEditMode ? 'Preview Mode' : 'Edit Mode'}
        </button>

        <div className="h-px bg-gray-200 my-4"></div>

        {/* NEW: Logo Settings Button */}
        <button
          onClick={onOpenLogoSettings}
          className="w-full p-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Settings size={16} />
          School Logo Settings
        </button>

        <div className="h-px bg-gray-200 my-4"></div>

        <div className="space-y-3">
          <button onClick={onExportPDF} className="w-full p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Download size={16} />
            Export PDF
          </button>

          <button onClick={onExportHTML} className="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Download size={16} />
            Export Locked HTML
          </button>

          <button onClick={onSave} className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Save size={16} />
            Save Content
          </button>

          <input
            type="file"
            accept=".json"
            onChange={onLoad}
            className="hidden"
            id="loadFile"
          />
          <button
            onClick={() => document.getElementById('loadFile').click()}
            className="w-full p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Upload size={16} />
            Load Content
          </button>
        </div>

        <div className="h-px bg-gray-200 my-4"></div>

        <button onClick={onAddSection} className="w-full p-3 mb-4 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
          <Plus size={16} />
          Add Section
        </button>

        <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Add Content to Section:
          </label>
          <select
            value={defaultSection}
            onChange={(e) => onDefaultSectionChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            {sections.map((section) => {
              const student = studentFriendlyTitles[section.id];
              const label = student
                ? `${section.title} (${student})`
                : section.title;

              return (
                <option key={section.id} value={section.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => onAddContent('video')} className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition-colors">
            <Video size={14} />
            Video
          </button>
          <button onClick={() => onAddContent('image')} className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition-colors">
            <Image size={14} />
            Image
          </button>
          <button onClick={() => onAddContent('audio')} className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition-colors">
            <Music size={14} />
            Audio
          </button>
          <button onClick={() => onAddContent('cards')} className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition-colors">
            <CreditCard size={14} />
            Cards
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Helper component for individual image metadata forms, memoized to prevent unnecessary re-renders
const ImageMetadataForm = React.memo(({ index, fileName, isMultiple, formData, onFieldChange }) => {
  const baseFieldName = isMultiple ? `image_${index}` : 'image';

  const handleChange = (field, value) => {
    onFieldChange(`${baseFieldName}_${field}`, value);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 space-y-4">
      <h4 className="font-semibold text-gray-800 mb-2 truncate">
        {isMultiple ? `Image ${index + 1}: ${fileName}` : 'Image Details'}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text:</label>
          <input
            type="text"
            placeholder="Descriptive alt text"
            value={formData[`${baseFieldName}_alt`] || ''}
            onChange={(e) => handleChange('alt', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
        </div>
        {!isMultiple && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size:</label>
            <select
              value={formData.image_size || 'medium'}
              onChange={(e) => handleChange('size', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="full">Full Width</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Caption:</label>
        <input
          type="text"
          placeholder="Optional caption"
          value={formData[`${baseFieldName}_caption`] || ''}
          onChange={(e) => handleChange('caption', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        />
      </div>

      <div className="pt-3">
        <h5 className="text-sm font-semibold text-gray-600 mb-2">APA Citation (Optional)</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Image Title:</label>
            <input
              type="text"
              value={formData[`${baseFieldName}_title`] || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Author/Creator:</label>
            <input
              type="text"
              value={formData[`${baseFieldName}_author`] || ''}
              onChange={(e) => handleChange('author', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Source:</label>
            <input
              type="text"
              value={formData[`${baseFieldName}_source`] || ''}
              onChange={(e) => handleChange('source', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date:</label>
            <input
              type="date"
              value={formData[`${baseFieldName}_date`] || ''}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

// Replace the ContentModal component with this fixed version
const ContentModal = ({ isOpen, contentType, onClose, onSave, initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [imageSource, setImageSource] = useState('upload');
  const [modalHtmlMode, setModalHtmlMode] = useState(false); // ADD THIS LINE
  const [isLoadingVideoInfo, setIsLoadingVideoInfo] = useState(false);

  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setIsHtmlMode(false);
      setModalHtmlMode(false);
      setImageSource('upload');
    }
  }, [isOpen, initialData]);

  // NEW: Initialize metadata fields when files change
  useEffect(() => {
    if (imageSource === 'upload' && formData.imageFiles) {
      const files = Array.from(formData.imageFiles);
      if (files.length > 0) {
        const newFormData = { ...formData };

        // Initialize metadata fields for each file if they don't exist
        files.forEach((file, index) => {
          const baseFieldName = files.length > 1 ? `image_${index}` : 'image';

          // Only initialize if the field doesn't already exist
          if (!newFormData[`${baseFieldName}_alt`]) {
            newFormData[`${baseFieldName}_alt`] = file.name.replace(/\.[^/.]+$/, ""); // filename without extension
          }
          if (!newFormData[`${baseFieldName}_caption`]) {
            newFormData[`${baseFieldName}_caption`] = '';
          }
          if (!newFormData[`${baseFieldName}_title`]) {
            newFormData[`${baseFieldName}_title`] = '';
          }
          if (!newFormData[`${baseFieldName}_author`]) {
            newFormData[`${baseFieldName}_author`] = '';
          }
          if (!newFormData[`${baseFieldName}_source`]) {
            newFormData[`${baseFieldName}_source`] = '';
          }
          if (!newFormData[`${baseFieldName}_date`]) {
            newFormData[`${baseFieldName}_date`] = '';
          }
        });

        setFormData(newFormData);
      }
    }
  }, [formData.imageFiles, imageSource]);

  // NEW: Initialize metadata fields when server filenames change
  useEffect(() => {
    if (imageSource === 'server' && formData.imageFilenames) {
      const filenames = formData.imageFilenames.split('\n').filter(Boolean);
      if (filenames.length > 0) {
        const newFormData = { ...formData };

        filenames.forEach((filename, index) => {
          const baseFieldName = filenames.length > 1 ? `image_${index}` : 'image';

          // Only initialize if the field doesn't already exist
          if (!newFormData[`${baseFieldName}_alt`]) {
            newFormData[`${baseFieldName}_alt`] = filename.replace(/\.[^/.]+$/, "");
          }
          if (!newFormData[`${baseFieldName}_caption`]) {
            newFormData[`${baseFieldName}_caption`] = '';
          }
          if (!newFormData[`${baseFieldName}_title`]) {
            newFormData[`${baseFieldName}_title`] = '';
          }
          if (!newFormData[`${baseFieldName}_author`]) {
            newFormData[`${baseFieldName}_author`] = '';
          }
          if (!newFormData[`${baseFieldName}_source`]) {
            newFormData[`${baseFieldName}_source`] = '';
          }
          if (!newFormData[`${baseFieldName}_date`]) {
            newFormData[`${baseFieldName}_date`] = '';
          }
        });

        setFormData(newFormData);
      }
    }
  }, [formData.imageFilenames, imageSource]);

  const handleFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const fetchVideoInfo = async (url, platform) => {
    setIsLoadingVideoInfo(true);

    try {
      const videoId = extractVideoId(url, platform);

      if (platform === 'youtube' && videoId) {
        setFormData(prev => ({
          ...prev,
          videoTitle: '',
          videoAuthor: '',
          videoSource: 'YouTube',
          videoUrl: url
        }));
        alert('📝 YouTube URL detected! Please manually enter the video title and author.');

      } else if (platform === 'vimeo' && videoId) {
        setFormData(prev => ({
          ...prev,
          videoTitle: '',
          videoAuthor: '',
          videoSource: 'Vimeo',
          videoUrl: url
        }));
        alert('📝 Vimeo URL detected! Please manually enter the video title and author.');

      } else if (platform === 'panopto' && url.includes('panopto.com')) {
        try {
          const urlObj = new URL(url);
          const hostname = urlObj.hostname;

          setFormData(prev => ({
            ...prev,
            videoTitle: 'Panopto Session',
            videoAuthor: '',
            videoSource: hostname || 'Panopto',
            videoUrl: url
          }));
          alert('✅ Panopto URL processed! Please update the title and author.');
        } catch (error) {
          alert('❌ Invalid Panopto URL format.');
        }
      } else {
        alert('❌ Invalid URL for the selected platform. Please check the URL and platform selection.');
      }

    } catch (error) {
      console.error('Error processing video info:', error);
      alert('❌ Error processing URL. Please enter information manually.');
    } finally {
      setIsLoadingVideoInfo(false);
    }
  };

  // CORRECTED handleSubmit function for the ContentModal
  // This should replace the existing handleSubmit function

  const handleSubmit = async () => {
    let processedData = { ...formData };

    switch (contentType) {
      case 'image': {
        const files = imageSource === 'upload' ? Array.from(formData.imageFiles || []) : [];
        const filenames = imageSource === 'server' ? (formData.imageFilenames || '').split('\n').filter(name => name.trim()) : [];

        // FIXED: Consistent calculation
        const sourceArray = imageSource === 'upload' ? files : filenames;
        const isMultiple = sourceArray.length > 1;

        // VALIDATION: Check if files/filenames are provided
        if (sourceArray.length === 0 && !formData.isEditing) {
          if (imageSource === 'upload') {
            alert('❌ Please select at least one image file to upload.');
          } else {
            alert('❌ Please enter at least one image filename.');
          }
          return;
        }

        try {
          if (isMultiple) {
            const items = [];

            // Process files sequentially to avoid async issues
            for (let i = 0; i < sourceArray.length; i++) {
              const sourceItem = sourceArray[i];
              let itemSrc;

              if (imageSource === 'upload') {
                itemSrc = await handleFileToBase64(sourceItem);
              } else {
                const path = formData.imagePath || '';
                const separator = path.endsWith('/') ? '' : '/';
                itemSrc = `${path}${separator}${sourceItem}`;
              }

              const baseFieldName = `image_${i}`;

              items.push({
                src: itemSrc,
                alt: formData[`${baseFieldName}_alt`] || (imageSource === 'upload' ? sourceItem.name : sourceItem),
                caption: formData[`${baseFieldName}_caption`] ? `<strong>Figure ${i + 1}:</strong> ${formData[`${baseFieldName}_caption`]}` : '',
                imageTitle: formData[`${baseFieldName}_title`] || '',
                imageAuthor: formData[`${baseFieldName}_author`] || '',
                imageSource: formData[`${baseFieldName}_source`] || '',
                imageDate: formData[`${baseFieldName}_date`] || ''
              });
            }

            // FIXED: Don't add ID here, let handleModalSave do it
            // Also, don't spread formData as it contains file objects
            const galleryBlock = {
              type: 'gallery',
              columns: formData.galleryColumns || '2',
              items: items,
              sectionId: formData.sectionId,  // Preserve sectionId for handleModalSave
              isEditing: formData.isEditing,  // Preserve isEditing flag
              insertAfterBlockId: formData.insertAfterBlockId
            };

            console.log('Gallery block being saved:', galleryBlock); // Debug log
            onSave(galleryBlock);

          } else {
            // Single image logic
            const singleItem = sourceArray[0];

            if (!singleItem && !formData.isEditing) {
              if (imageSource === 'upload') {
                alert('❌ Please select an image file to upload.');
              } else {
                alert('❌ Please enter an image filename.');
              }
              return;
            }

            let imageSrc;

            if (singleItem) {
              if (imageSource === 'upload') {
                imageSrc = await handleFileToBase64(singleItem);
              } else {
                const path = formData.imagePath || '';
                const separator = path.endsWith('/') ? '' : '/';
                imageSrc = `${path}${separator}${singleItem}`;
              }
            } else {
              imageSrc = formData.src; // For editing existing images
            }

            // FIXED: Don't add ID here, follow original pattern
            const imageBlock = {
              type: 'image',
              src: imageSrc,
              alt: formData.image_alt || (singleItem ? (imageSource === 'upload' ? singleItem.name : singleItem) : 'Image'),
              size: formData.image_size || 'medium',
              caption: formData.image_caption ? `<strong>Figure:</strong> ${formData.image_caption}` : '',
              imageTitle: formData.image_title || '',
              imageAuthor: formData.image_author || '',
              imageSource: formData.image_source || '',
              imageDate: formData.image_date || '',
              sectionId: formData.sectionId,  // Preserve sectionId
              isEditing: formData.isEditing,   // Preserve isEditing flag
              insertAfterBlockId: formData.insertAfterBlockId
            };

            console.log('Image block being saved:', imageBlock); // Debug log
            onSave(imageBlock);
          }

        } catch (error) {
          console.error('Error processing image(s):', error);
          alert(`❌ Error processing image file(s): ${error.message}`);
          return;
        }
        break;
      }

      case 'video':
        const platform = formData.videoPlatform || 'youtube';
        const videoId = extractVideoId(formData.videoUrl, platform);

        if ((platform !== 'embed' && !videoId)) {
          alert('Invalid video URL. Please check the link and try again.');
          return;
        }

        if (platform === 'embed') {
          processedData.src = formData.embedCode;
        } else if (videoId) {
          const embedHtml = generateVideoEmbed(platform, videoId, null, formData.aspectRatio);
          processedData.src = embedHtml.match(/src="([^"]*)"/)?.[1];
        }

        onSave({ ...processedData, type: 'video', sectionId: formData.sectionId, isEditing: formData.isEditing, insertAfterBlockId: formData.insertAfterBlockId });
        break;

      case 'audio':
        if (formData.audioFile) {
          try {
            const base64 = await handleFileToBase64(formData.audioFile);
            processedData.src = base64;
          } catch (error) {
            console.error('Error processing audio:', error);
            alert('❌ Error processing audio file. Please try again.');
            return;
          }
        }

        processedData.description = formData.audioDescription;
        processedData.audioTitle = formData.audioTitle;
        processedData.audioCreator = formData.audioCreator;
        processedData.audioSourceInfo = formData.audioSourceInfo;
        processedData.audioDateInfo = formData.audioDateInfo;

        onSave({ ...processedData, type: 'audio', sectionId: formData.sectionId, isEditing: formData.isEditing, insertAfterBlockId: formData.insertAfterBlockId });
        break;

      case 'cards':
        const textToHtml = (text) => {
          if (!text) return '';
          const lines = text.split('\n').filter(line => line.trim());
          const htmlLines = lines.map(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('- ')) {
              return `<li>${trimmedLine.substring(2)}</li>`;
            } else if (/^\d+\./.test(trimmedLine)) {
              return `<li>${trimmedLine.replace(/^\d+\.\s*/, '')}</li>`;
            } else if (trimmedLine) {
              return `<p>${trimmedLine}</p>`;
            }
            return '';
          }).filter(line => line);

          let result = '';
          let inList = false;
          htmlLines.forEach(line => {
            if (line.startsWith('<li>')) {
              if (!inList) {
                result += '<ul>';
                inList = true;
              }
              result += line;
            } else {
              if (inList) {
                result += '</ul>';
                inList = false;
              }
              result += line;
            }
          });
          if (inList) {
            result += '</ul>';
          }
          return result;
        };

        const cardItems = formData.cardItems || [{ title: '', content: '' }];
        processedData.items = cardItems
          .filter(card => card.title || card.content)
          .map(card => ({
            title: card.title || '',
            content: textToHtml(card.content || '')
          }));

        processedData.layout = formData.cardLayout || '2x1';
        processedData.style = formData.cardStyle || 'info';
        onSave({ ...processedData, type: 'cards', sectionId: formData.sectionId, isEditing: formData.isEditing, insertAfterBlockId: formData.insertAfterBlockId });
        break;

      default:
        onSave({ ...processedData, type: contentType, sectionId: formData.sectionId, isEditing: formData.isEditing, insertAfterBlockId: formData.insertAfterBlockId });
        break;
    }

    onClose();
  };

  if (!isOpen) return null;

  // FIXED: Use consistent calculation
  const files = imageSource === 'upload' ? Array.from(formData.imageFiles || []) : [];
  const filenames = imageSource === 'server' ? (formData.imageFilenames || '').split('\n').filter(Boolean) : [];
  const sourceArray = imageSource === 'upload' ? files : filenames;
  const isMultipleImages = sourceArray.length > 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Add {contentType} Content</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col flex-grow overflow-hidden">
          <div className="p-6 flex-grow overflow-y-auto">
            {/* Text-based content types */}
            {(['text', 'heading', 'list', 'info-box', 'exercise-box', 'warning-box'].includes(contentType)) && (
              <RichTextEditor
                content={formData.content || ''}
                onChange={(content) => setFormData({ ...formData, content })}
                isHtmlMode={modalHtmlMode}
                onToggleHtmlMode={() => setModalHtmlMode(!modalHtmlMode)}
                isPreviewMode={false}
              />
            )}

            {/* Video content */}
            {contentType === 'video' && (
              <div className="space-y-6">
                {/* Platform Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video Platform</label>
                  <select
                    value={formData.videoPlatform || 'youtube'}
                    onChange={(e) => handleFieldChange('videoPlatform', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="panopto">Panopto</option>
                    <option value="embed">Custom Embed Code</option>
                  </select>
                </div>

                {/* Conditional Input: URL or Embed Code */}
                {formData.videoPlatform === 'embed' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Embed Code</label>
                    <textarea
                      value={formData.embedCode || ''}
                      onChange={(e) => handleFieldChange('embedCode', e.target.value)}
                      rows={5}
                      placeholder='Paste your full embed code here (e.g., <iframe... ></iframe>)'
                      className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.videoUrl || ''}
                        onChange={(e) => handleFieldChange('videoUrl', e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => fetchVideoInfo(formData.videoUrl, formData.videoPlatform)}
                        disabled={isLoadingVideoInfo || !formData.videoUrl}
                        className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-gray-300 transition-colors font-medium flex items-center justify-center"
                      >
                        {isLoadingVideoInfo ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Fetch Info"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Metadata and Citation Fields (Not for 'embed') */}
                {formData.videoPlatform !== 'embed' && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                    <h4 className="font-semibold text-gray-800">APA Citation Details (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
                        <input type="text" value={formData.videoTitle || ''} onChange={(e) => handleFieldChange('videoTitle', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Author/Channel</label>
                        <input type="text" value={formData.videoAuthor || ''} onChange={(e) => handleFieldChange('videoAuthor', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source (Platform Name)</label>
                        <input type="text" value={formData.videoSource || ''} onChange={(e) => handleFieldChange('videoSource', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date</label>
                        <input type="date" value={formData.videoDate || ''} onChange={(e) => handleFieldChange('videoDate', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Aspect Ratio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
                  <select
                    value={formData.aspectRatio || '16-9'}
                    onChange={(e) => handleFieldChange('aspectRatio', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="16-9">16:9 (Widescreen)</option>
                    <option value="4-3">4:3 (Standard)</option>
                    <option value="1-1">1:1 (Square)</option>
                    <option value="21-9">21:9 (Cinematic)</option>
                  </select>
                </div>
              </div>
            )}

            {/* FIXED: Image content */}
            {contentType === 'image' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Source:</label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="imageSource"
                        value="upload"
                        checked={imageSource === 'upload'}
                        onChange={(e) => setImageSource(e.target.value)}
                        className="mr-2"
                      />
                      Upload File(s)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="imageSource"
                        value="server"
                        checked={imageSource === 'server'}
                        onChange={(e) => setImageSource(e.target.value)}
                        className="mr-2"
                      />
                      Use Server Path
                    </label>
                  </div>
                </div>

                {imageSource === 'upload' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Image(s): <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setFormData({ ...formData, imageFiles: e.target.files })}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors ${!formData.imageFiles || formData.imageFiles.length === 0
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                        }`}
                    />
                    {(!formData.imageFiles || formData.imageFiles.length === 0) && (
                      <p className="text-red-500 text-sm mt-1">
                        ⚠️ Please select at least one image file
                      </p>
                    )}
                    {formData.imageFiles && formData.imageFiles.length > 0 && (
                      <p className="text-green-600 text-sm mt-1">
                        ✅ {formData.imageFiles.length} file(s) selected
                        {formData.imageFiles.length > 1 && ' (will create gallery)'}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Server Path (without filename):
                      </label>
                      <input
                        type="text"
                        value={formData.imagePath || ''}
                        onChange={(e) => setFormData({ ...formData, imagePath: e.target.value })}
                        placeholder="e.g., /content/enforced/123456-Course/images/"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Filename(s): <span className="text-red-500">*</span>
                        <span className="text-gray-500 font-normal">(one per line for multiple)</span>
                      </label>
                      <textarea
                        value={formData.imageFilenames || ''}
                        onChange={(e) => setFormData({ ...formData, imageFilenames: e.target.value })}
                        placeholder={`diagram.jpg\nchart.png\nphoto.gif`}
                        rows={4}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-sm transition-colors ${!formData.imageFilenames || !formData.imageFilenames.trim()
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                          }`}
                      />
                      {(!formData.imageFilenames || !formData.imageFilenames.trim()) && (
                        <p className="text-red-500 text-sm mt-1">
                          ⚠️ Please enter at least one image filename
                        </p>
                      )}
                      {formData.imageFilenames && formData.imageFilenames.trim() && (
                        <p className="text-green-600 text-sm mt-1">
                          ✅ {formData.imageFilenames.split('\n').filter(Boolean).length} filename(s) entered
                          {formData.imageFilenames.split('\n').filter(Boolean).length > 1 && ' (will create gallery)'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {isMultipleImages && (
                  <div className="my-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Columns:</label>
                    <select
                      value={formData.galleryColumns || '2'}
                      onChange={(e) => setFormData({ ...formData, galleryColumns: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    >
                      <option value="2">2 Columns</option>
                      <option value="3">3 Columns</option>
                      <option value="4">4 Columns</option>
                    </select>
                  </div>
                )}

                {/* FIXED: Always show metadata forms for selected images */}
                <div className="space-y-4 mt-4">
                  {sourceArray.map((sourceItem, index) => (
                    <ImageMetadataForm
                      key={`${sourceItem.name || sourceItem}-${index}`}
                      index={index}
                      fileName={sourceItem.name || sourceItem}
                      isMultiple={isMultipleImages}
                      formData={formData}
                      onFieldChange={handleFieldChange}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Audio content */}
            {contentType === 'audio' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Audio File:</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setFormData({ ...formData, audioFile: e.target.files[0] })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description:</label>
                  <textarea
                    value={formData.audioDescription || ''}
                    onChange={(e) => setFormData({ ...formData, audioDescription: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>

                {/* Citation fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Audio Title:</label>
                    <input
                      type="text"
                      value={formData.audioTitle || ''}
                      onChange={(e) => setFormData({ ...formData, audioTitle: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Creator:</label>
                    <input
                      type="text"
                      value={formData.audioCreator || ''}
                      onChange={(e) => setFormData({ ...formData, audioCreator: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source:</label>
                    <input
                      type="text"
                      value={formData.audioSourceInfo || ''}
                      onChange={(e) => setFormData({ ...formData, audioSourceInfo: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date:</label>
                    <input
                      type="date"
                      value={formData.audioDateInfo || ''}
                      onChange={(e) => setFormData({ ...formData, audioDateInfo: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cards content */}
            {contentType === 'cards' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Layout:</label>
                    <select
                      value={formData.cardLayout || '2x1'}
                      onChange={(e) => setFormData({ ...formData, cardLayout: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    >
                      <option value="2x1">2 Columns</option>
                      <option value="3x1">3 Columns</option>
                      <option value="1x3">Single Column</option>
                      <option value="2x2">2x2 Grid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Style:</label>
                    <select
                      value={formData.cardStyle || 'info'}
                      onChange={(e) => setFormData({ ...formData, cardStyle: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    >
                      <option value="info">Info (Blue)</option>
                      <option value="exercise">Exercise (Green)</option>
                      <option value="warning">Warning (Yellow)</option>
                      <option value="success">Success (Green)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700">Cards (Max 4):</label>
                    <span className="text-sm text-gray-500">
                      {(formData.cardItems || []).length}/4 cards
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Initialize with at least one card if none exist */}
                    {(() => {
                      const cards = formData.cardItems || [{ title: '', content: '' }];
                      return cards.map((card, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-gray-700">Card {index + 1}</h4>
                            {cards.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = [...cards];
                                  newItems.splice(index, 1);
                                  setFormData({ ...formData, cardItems: newItems });
                                }}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Card Title"
                              value={card?.title || ''}
                              onChange={(e) => {
                                const newItems = [...cards];
                                newItems[index] = {
                                  ...newItems[index],
                                  title: e.target.value
                                };
                                setFormData({ ...formData, cardItems: newItems });
                              }}
                              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            />

                            {/* UPDATED: Replace textarea with RichTextEditor */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                <span className="text-sm font-medium text-gray-700">Card Content</span>
                              </div>
                              <RichTextEditor
                                content={card?.content || ''}
                                onChange={(content) => {
                                  const newItems = [...cards];
                                  newItems[index] = {
                                    ...newItems[index],
                                    content: content
                                  };
                                  setFormData({ ...formData, cardItems: newItems });
                                }}
                                isHtmlMode={false}
                                onToggleHtmlMode={() => { }} // Not needed for cards
                                isPreviewMode={false}
                              />
                            </div>
                          </div>
                        </div>
                      ));
                    })()}

                    {/* Add Card Button - only show if less than 4 cards */}
                    {(formData.cardItems || []).length < 4 && (
                      <button
                        type="button"
                        onClick={() => {
                          const currentItems = formData.cardItems || [];
                          const newItems = [...currentItems, { title: '', content: '' }];
                          setFormData({ ...formData, cardItems: newItems });
                        }}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Add Card ({(formData.cardItems || []).length + 1}/4)
                      </button>
                    )}

                    {(formData.cardItems || []).length >= 4 && (
                      <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          ✅ Maximum of 4 cards reached
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-800 mb-2">💡 Tips for Cards:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use the rich text editor for formatting (bold, italic, lists, etc.)</li>
                    <li>• Add links, headings, and styled text</li>
                    <li>• Keep titles short and descriptive</li>
                    <li>• Cards work great for key points, steps, or highlights</li>
                  </ul>
                </div>
              </div>
            )}

          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Application Component
const LectureTemplateSystem = ({ initialData }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [week, setWeek] = useState('1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState({ show: false, message: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContentType, setModalContentType] = useState('');
  const [modalInitialData, setModalInitialData] = useState({});
  const [htmlModes, setHtmlModes] = useState({});
  const [modalHtmlMode, setModalHtmlMode] = useState(false);
  const [showAutoSaveRecovery, setShowAutoSaveRecovery] = useState(false);
  const [autoSaveData, setAutoSaveData] = useState(null);
  const [defaultSection, setDefaultSection] = useState('overview');
  const [activeSectionId, setActiveSectionId] = useState('');
  const [openSectionIds, setOpenSectionIds] = useState(['overview']); // Can hold multiple IDs

  const [showLogoSettings, setShowLogoSettings] = useState(false);

  // NEW: Use the logo context
  const { getLogoHtml, hasLogo } = useLogo();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const handleTitleSave = () => {
    const newTitle = tempTitle.trim();
    if (newTitle) {
      handleHeaderDataChange('courseTopic', newTitle);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTempTitle(headerData.courseTopic.replace(/Week \d+/, `Week ${week}`));
      setIsEditingTitle(false);
    }
  };

  // Header data
  const [headerData, setHeaderData] = useState({
    courseTopic: 'Course Topic - Week 1',
    instructorName: 'Instructor: Your Name',
    instructorEmail: 'email@institution.edu',
    footerCourseInfo: 'Course Title - Course Code',
    footerInstitution: 'Institution Name',
    footerCopyright: '© 2025 All Rights Reserved'
  });

  const smoothScrollTo = (elementY, duration = 1000) => {
    const startingY = window.pageYOffset;
    const diff = elementY - startingY;
    let start;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const time = timestamp - start;
      const percent = Math.min(time / duration, 1);

      // easeInOutCubic timing function for a soft start and end
      const easing = percent < 0.5 ? 4 * percent * percent * percent : 1 - Math.pow(-2 * percent + 2, 3) / 2;

      window.scrollTo(0, startingY + diff * easing);

      if (time < duration) {
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
  }

  // Initial sections data - UPDATED to handle initialData prop
  const [sections, setSections] = useState(() => {
    if (initialData && initialData.sections) {
      return initialData.sections;
    }
    return [
      {
        id: 'overview',
        title: 'Session Overview',
        type: 'content',
        blocks: [
          {
            id: generateId(),
            type: 'text',
            content: 'Welcome to this week\'s lesson. This session covers the main learning objectives and key concepts that students will explore and master.'
          },
          {
            id: generateId(),
            type: 'info-box',
            content: '<h3>This Week\'s Focus</h3><p>By the end of this session, students will understand:</p><ul><li>Key concept 1: Fundamental principles</li><li>Key concept 2: Practical applications</li><li>Key concept 3: Real-world connections</li><li>Key concept 4: Assessment criteria</li></ul><p><strong>Goal:</strong> Students will demonstrate understanding through practical application and reflection.</p>'
          }
        ]
      },
      {
        id: 'bridge-in',
        title: 'Bridge-In',
        type: 'boppps',
        blocks: [
          {
            id: generateId(),
            type: 'heading',
            content: '<h3>Connecting to Previous Learning</h3>'
          },
          {
            id: generateId(),
            type: 'text',
            content: 'This bridge-in activity connects today\'s lesson with what students already know. Use this space to create connections, ask engaging questions, or provide a thought-provoking scenario.'
          },
          {
            id: generateId(),
            type: 'exercise-box',
            content: '<h4>Opening Activity</h4><p>Consider this question/scenario/problem...</p><ul><li>Discussion point 1</li><li>Discussion point 2</li><li>Discussion point 3</li></ul>'
          }
        ]
      },
      {
        id: 'outcomes',
        title: 'Learning Outcomes',
        type: 'boppps',
        blocks: [
          {
            id: generateId(),
            type: 'text',
            content: 'By the end of today\'s session, you will be able to:'
          },
          {
            id: generateId(),
            type: 'list',
            content: '<ul><li>Learning outcome 1: Demonstrate understanding of...</li><li>Learning outcome 2: Apply knowledge to...</li><li>Learning outcome 3: Analyze and evaluate...</li><li>Learning outcome 4: Create and synthesize...</li></ul>'
          }
        ]
      },
      {
        id: 'pre-assessment',
        title: 'Pre-Assessment',
        type: 'boppps',
        blocks: [
          {
            id: generateId(),
            type: 'heading',
            content: '<h3>What Do You Already Know?</h3>'
          },
          {
            id: generateId(),
            type: 'text',
            content: 'Before we dive into new content, let\'s assess your current understanding:'
          }
        ]
      },
      {
        id: 'participatory-learning',
        title: 'Participatory Learning',
        type: 'boppps',
        blocks: [
          {
            id: generateId(),
            type: 'heading',
            content: '<h3>Main Learning Activities</h3>'
          },
          {
            id: generateId(),
            type: 'text',
            content: 'This is the core content delivery section. Include your main concepts, demonstrations, activities, and student interactions.'
          }
        ]
      },
      {
        id: 'post-assessment',
        title: 'Post-Assessment',
        type: 'boppps',
        blocks: [
          {
            id: generateId(),
            type: 'heading',
            content: '<h3>Check Your Understanding</h3>'
          },
          {
            id: generateId(),
            type: 'text',
            content: 'Let\'s verify that you\'ve achieved today\'s learning outcomes:'
          }
        ]
      },
      {
        id: 'summary',
        title: 'Summary & Next Steps',
        type: 'boppps',
        blocks: [
          {
            id: generateId(),
            type: 'heading',
            content: '<h3>Key Takeaways</h3>'
          },
          {
            id: generateId(),
            type: 'list',
            content: '<ul><li>Main concept 1: Summary of key learning</li><li>Main concept 2: Important connections made</li><li>Main concept 3: Skills developed</li><li>Main concept 4: Applications to remember</li></ul>'
          }
        ]
      },
      {
        id: 'resources',
        title: 'Resources & Materials',
        type: 'content',
        blocks: [
          {
            id: generateId(),
            type: 'heading',
            content: '<h3>Required Readings</h3>'
          },
          {
            id: generateId(),
            type: 'list',
            content: '<ul><li>Textbook Chapter X: [Chapter title and pages]</li><li>Article: [Author, Title, Source]</li><li>Online Resource: [Description and URL]</li></ul>'
          }
        ]
      }
    ];
  });

  // Auto-save functionality
  const autoSaveKey = `lecture-template-autosave-${week}-${date}`;
  const { lastSaved, hasUnsavedChanges, loadAutoSavedData, clearAutoSavedData } = useAutoSave({
    headerData,
    week,
    date,
    sections
  }, autoSaveKey);

  // ADDED: Load initial data if provided
  useEffect(() => {
    if (initialData) {
      if (initialData.headerData) {
        setHeaderData(initialData.headerData);
      }
      if (initialData.week) {
        setWeek(initialData.week);
      }
      if (initialData.date) {
        setDate(initialData.date);
      }
      if (initialData.sections) {
        setSections(initialData.sections);
      }
    }
  }, [initialData]);

  // Check for auto-saved data on mount - UPDATED to not run if initialData is present
  useEffect(() => {
    const savedData = loadAutoSavedData();
    if (savedData && savedData.timestamp && !initialData) {
      setAutoSaveData(savedData);
      setShowAutoSaveRecovery(true);
    }
  }, [loadAutoSavedData, initialData]);

  // Update tempTitle when editing starts
  useEffect(() => {
    if (isEditingTitle) {
      setTempTitle(headerData.courseTopic.replace(/Week \d+/, `Week ${week}`));
    }
  }, [isEditingTitle, headerData.courseTopic, week]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (el) observer.unobserve(el);
      });
    };
  }, [sections]);

  const showSaveIndicator = useCallback((message, type = '') => {
    setSaveIndicator({ show: true, message, type });
    setTimeout(() => setSaveIndicator({ show: false, message: '', type: '' }), 3000);
  }, []);

  const toggleHtmlMode = useCallback((blockId) => {
    setHtmlModes(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  }, []);

  const handleRecoverAutoSave = () => {
    if (autoSaveData) {
      if (autoSaveData.headerData) setHeaderData(autoSaveData.headerData);
      if (autoSaveData.week) setWeek(autoSaveData.week);
      if (autoSaveData.date) setDate(autoSaveData.date);
      if (autoSaveData.sections) setSections(autoSaveData.sections);
      showSaveIndicator('✅ Auto-saved content recovered');
    }
    setShowAutoSaveRecovery(false);
  };

  const handleDiscardAutoSave = () => {
    clearAutoSavedData();
    setShowAutoSaveRecovery(false);
    showSaveIndicator('🗑️ Auto-saved content discarded');
  };

  const handleToggleEditMode = () => {
    // If switching from edit mode to preview mode, force save any pending content
    if (isEditMode) {
      // Give any pending editor updates a moment to complete
      setTimeout(() => {
        setIsEditMode(false);
        showSaveIndicator('👁️ Preview mode enabled');
      }, 100);
    } else {
      setIsEditMode(true);
      showSaveIndicator('✏️ Edit mode enabled');
    }
  };

  const handleSectionUpdate = (updatedSection) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === updatedSection.id ? updatedSection : section
      )
    );
  };

  const handleAddContent = (sectionId, contentType = 'text') => {
    if (contentType === 'text' || contentType === 'headline') {
      const newBlock = {
        id: generateId(),
        type: contentType,
        content:
          contentType === 'headline'
            ? '<h1>Headline</h1>'
            : 'Click to edit this text content.'
      };

      setSections(prevSections =>
        prevSections.map(section =>
          section.id === sectionId
            ? { ...section, blocks: [...section.blocks, newBlock] }
            : section
        )
      );
      showSaveIndicator('➕ Text content added');
    } else {
      setModalContentType(contentType);
      setModalInitialData({ sectionId });
      setIsModalOpen(true);
    }
  };

  // Add a new block directly below the specified block within a section
  const handleAddBlockBelow = (blockId, contentType = 'text', sectionId) => {
    if (contentType === 'text' || contentType === 'headline') {
      const newBlock = {
        id: generateId(),
        type: contentType,
        content:
          contentType === 'headline'
            ? '<h1>Headline</h1>'
            : 'Click to edit this text content.'
      };

      setSections(prevSections =>
        prevSections.map(section => {
          if (section.id !== sectionId) return section;
          const blocks = [...section.blocks];
          const index = blocks.findIndex(b => b.id === blockId);
          if (index === -1) {
            blocks.push(newBlock);
          } else {
            blocks.splice(index + 1, 0, newBlock);
          }
          return { ...section, blocks };
        })
      );
      showSaveIndicator('➕ Text content added');
    } else {
      setModalContentType(contentType);
      setModalInitialData({ sectionId, insertAfterBlockId: blockId });
      setIsModalOpen(true);
    }
  };

  const handleDeleteSection = (sectionId) => {
    setSections(prevSections => prevSections.filter(section => section.id !== sectionId));
    showSaveIndicator('🗑️ Section removed');
  };

  const handleAddSection = () => {
    const newSectionId = generateId();
    const newSection = {
      id: newSectionId,
      title: 'New Section',
      type: 'content',
      blocks: [
        {
          id: generateId(),
          type: 'text',
          content: 'This is a new section. Click to edit this content.'
        }
      ]
    };

    setSections(prevSections => {
      const resourcesIndex = prevSections.findIndex(s => s.id === 'resources');
      const newSections = [...prevSections];
      newSections.splice(resourcesIndex, 0, newSection);
      return newSections;
    });
    showSaveIndicator('➕ New section added');
  };

  const handleExportPDF = () => {
    showSaveIndicator('📄 Preparing PDF...', 'saving');

    const logoHtml = getLogoHtml('logo');

    // Create clean header for PDF
    const headerHtml = `
      <header class="header-section">
        <div class="header-content">
          <div class="header-top">
            <div class="date-section">
              <p class="date-text">${displayDate}</p>
              ${logoHtml ? `<div class="logo">${logoHtml}</div>` : ''}
            </div>
            <div class="instructor-info">
              <div class="instructor-grid">
                <span class="instructor-label">Instructor:</span>
                <span class="instructor-value">${headerData.instructorName}</span>
                <span class="instructor-label">Email:</span>
                <span class="instructor-value">${headerData.instructorEmail}</span>
              </div>
            </div>
          </div>
          
          <div class="title-section">
            <h1 class="main-title">${headerData.courseTopic.replace(/Week \d+/, `Week ${week}`)}</h1>
          </div>
        </div>
      </header>
    `;

    // Generate clean sections HTML with minimal spacing
    const sectionsHtml = sections.map((section, index) => {
      const label = studentFriendlyTitles[section.id] || section.title;
      const blocksHtml = section.blocks.map(getBlockHtml).join('');

      const sectionColors = {
        'overview': { bg: '#475569', light: '#64748b' },
        'bridge-in': { bg: '#ef4444', light: '#f87171' },
        'outcomes': { bg: '#10b981', light: '#34d399' },
        'pre-assessment': { bg: '#f59e0b', light: '#fbbf24' },
        'participatory-learning': { bg: '#3b82f6', light: '#60a5fa' },
        'post-assessment': { bg: '#8b5cf6', light: '#a78bfa' },
        'summary': { bg: '#6366f1', light: '#818cf8' },
        'resources': { bg: '#374151', light: '#6b7280' }
      };

      const colors = sectionColors[section.id] || { bg: '#475569', light: '#64748b' };

      return `
        <section class="section-container">
          <div class="section-header" style="background: linear-gradient(135deg, ${colors.bg} 0%, ${colors.light} 100%);">
            <h2 class="section-title">${label}</h2>
          </div>
          <div class="section-content">
            ${blocksHtml}
          </div>
        </section>
      `;
    }).join('');

    // Footer HTML
    const footerHtml = `
      <footer class="footer-section">
        <div class="footer-content">
          <div class="footer-main">${headerData.footerCourseInfo}</div>
          <div class="footer-sub">${headerData.footerInstitution}</div>
          <div class="footer-copyright">${headerData.footerCopyright}</div>
        </div>
      </footer>
    `;

    // Compact PDF-specific styles
    const pdfStyles = `
      <style>
        @page {
          size: A4;
          margin: 0.4in;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.4;
          color: #1f2937;
          background: white;
          font-size: 10pt;
        }
        
        /* Header Styles - Compact */
        .header-section {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-bottom: 3px solid #3b82f6;
          margin-bottom: 0.5rem;
        }
        
        .header-content {
          padding: 0.75rem;
        }
        
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        
        .date-section {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        
        .date-text {
          font-size: 12pt;
          color: #4b5563;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .logo {
          max-height: 40px;
          opacity: 0.9;
        }
        
        .instructor-info {
          text-align: right;
        }
        
        .instructor-grid {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.15rem 0.5rem;
          align-items: center;
          font-size: 9pt;
        }
        
        .instructor-label {
          font-weight: 600;
          color: #374151;
        }
        
        .instructor-value {
          color: #6b7280;
        }
        
        .title-section {
          text-align: center;
          padding: 0.5rem 0;
          background: white;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .main-title {
          font-size: 22pt;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.1;
        }
        
        /* Section Styles - Compact */
        .section-container {
          margin-bottom: 0.5rem;
          break-inside: avoid;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        
        .section-header {
          padding: 0.5rem 1rem;
          color: white;
        }
        
        .section-title {
          font-size: 14pt;
          font-weight: 600;
          margin: 0;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        
        .section-content {
          padding: 0.75rem;
          background: white;
        }
        
        /* Typography - Compact */
        h1 { 
          font-size: 18pt;
          font-weight: 700;
          color: #1e293b;
          margin: 0.25rem 0 0.5rem 0;
          break-after: avoid;
          line-height: 1.2;
        }
        
        h2 { 
          font-size: 14pt;
          font-weight: 600;
          color: #1e293b;
          margin: 0.5rem 0 0.25rem 0;
          break-after: avoid;
          line-height: 1.2;
        }
        
        h3 { 
          font-size: 12pt;
          font-weight: 600;
          color: #374151;
          margin: 0.4rem 0 0.2rem 0;
          break-after: avoid;
          line-height: 1.2;
        }
        
        h4 { 
          font-size: 11pt;
          font-weight: 600;
          color: #4b5563;
          margin: 0.3rem 0 0.15rem 0;
          break-after: avoid;
          line-height: 1.2;
        }
        
        p {
          margin-bottom: 0.4rem;
          line-height: 1.4;
        }
        
        ul, ol {
          margin: 0.3rem 0 0.4rem 1.2rem;
          line-height: 1.4;
        }
        
        li {
          margin-bottom: 0.15rem;
        }
        
        strong {
          font-weight: 600;
          color: #1e293b;
        }
        
        em {
          font-style: italic;
          color: #4b5563;
        }
        
        /* Card Layouts - Compact */
        .grid {
          display: grid;
          gap: 0.5rem;
          margin: 0.5rem 0;
        }
        
        .grid-cols-1 { grid-template-columns: 1fr; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
        
        /* Info Boxes - Compact */
        .p-4.rounded-lg {
          padding: 0.5rem;
          border-radius: 6px;
          margin: 0.5rem 0;
          border-left: 3px solid;
          background: #f8fafc;
        }
        
        .bg-blue-50 { 
          background: #eff6ff !important; 
          border-left-color: #3b82f6;
        }
        
        .bg-emerald-50 { 
          background: #ecfdf5 !important; 
          border-left-color: #10b981;
        }
        
        .bg-amber-50 { 
          background: #fffbeb !important; 
          border-left-color: #f59e0b;
        }
        
        .bg-slate-50 { 
          background: #f8fafc !important; 
          border-left-color: #64748b;
        }
        
        /* Images - Compact */
        img {
          max-width: 100%;
          height: auto;
          break-inside: avoid;
          margin: 0.25rem 0;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        /* Video Placeholder - Compact */
        iframe {
          border: 2px solid #e5e7eb;
          background: #f3f4f6;
          min-height: 120px;
          border-radius: 6px;
          margin: 0.5rem 0;
        }
        
        /* Footer - Compact */
        .footer-section {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          margin-top: 1rem;
          break-before: auto;
        }
        
        .footer-content {
          text-align: center;
          padding: 0.75rem;
        }
        
        .footer-main {
          font-size: 11pt;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .footer-sub {
          font-size: 10pt;
          color: #cbd5e1;
          margin-bottom: 0.25rem;
        }
        
        .footer-copyright {
          font-size: 8pt;
          color: #94a3b8;
        }
        
        /* Remove excessive spacing */
        .my-6 { 
          margin: 0.5rem 0; 
        }
        
        .mb-6 { 
          margin-bottom: 0.5rem; 
        }
        
        .mt-8 { 
          margin-top: 0.5rem; 
        }
        
        .py-8 { 
          padding: 0.5rem 0; 
        }
        
        /* Hide interactive elements */
        .no-print, 
        button, 
        .cursor-pointer,
        [contenteditable] {
          display: none !important;
        }
        
        /* Utility classes */
        .break-inside-avoid { break-inside: avoid; }
        .break-before-page { break-before: page; }
        .text-center { text-align: center; }
        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: 700; }
      </style>
    `;

    // Complete HTML document
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Week ${week} - ${headerData.courseTopic} - PDF Export</title>
        ${pdfStyles}
      </head>
      <body>
        ${headerHtml}
        <main>
          ${sectionsHtml}
        </main>
        ${footerHtml}
        
        <script>
          // Auto-print when page loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(fullHtml);
    printWindow.document.close();

    showSaveIndicator('📄 PDF export ready');
  };

  const getBlockHtml = (block) => {
    switch (block.type) {
      case 'text':
      case 'heading':
      case 'list':
        return `<div class="rich-editor-content">${block.content}</div>`;
      case 'headline':
        return `<div class="headline-preview">${block.content}</div>`;
      case 'info-box':
      case 'exercise-box':
      case 'warning-box':
        const boxConfig = {
          'info-box': { bg: 'bg-blue-50', border: 'border-l-4 border-blue-400' },
          'exercise-box': { bg: 'bg-emerald-50', border: 'border-l-4 border-emerald-400' },
          'warning-box': { bg: 'bg-amber-50', border: 'border-l-4 border-amber-400' }
        }[block.type];
        return `<div class="p-4 rounded-lg ${boxConfig.bg} ${boxConfig.border}"><div class="rich-editor-content">${block.content}</div></div>`;
      case 'video':
        const aspectClass = { '16-9': 'pb-[56.25%]', '4-3': 'pb-[75%]', '1-1': 'pb-[100%]', '21-9': 'pb-[42.85%]' }[block.aspectRatio] || 'pb-[56.25%]';
        const videoCitation = generateAPACitation(block.videoTitle, block.videoAuthor, block.videoDate, block.videoSource, block.videoUrl);
        return `
            <div class="my-6">
                <div class="relative w-full ${aspectClass} overflow-hidden rounded-xl bg-gray-900 shadow-lg">
                    <iframe src="${block.src}" class="absolute top-0 left-0 w-full h-full border-0" allowfullscreen></iframe>
                </div>
                ${videoCitation ? `<div class="bg-gray-50 border border-gray-200 p-3 mt-3 rounded-lg text-sm text-gray-600">${videoCitation}</div>` : ''}
            </div>
        `;
      case 'image':
        const sizeClass = { small: 'max-w-xs', medium: 'max-w-md', large: 'max-w-2xl', full: 'w-full' }[block.size] || 'max-w-md';
        const imageCitation = generateImageCitation(block.imageTitle, block.imageAuthor, block.imageSource, block.imageDate);
        return `
            <div class="my-6 text-center">
                <img src="${block.src}" alt="${block.alt}" class="${sizeClass} h-auto rounded-xl shadow-lg mx-auto" />
                ${block.caption ? `<div class="bg-gray-50 border border-gray-200 p-3 mt-3 rounded-lg text-sm text-gray-600 text-left max-w-2xl mx-auto">${block.caption}</div>` : ''}
                ${imageCitation ? `<div class="bg-gray-50 border border-gray-200 p-3 mt-2 rounded-lg text-sm text-gray-600 text-left max-w-2xl mx-auto">${imageCitation}</div>` : ''}
            </div>
        `;
      case 'gallery':
        const cols = block.columns || '2';
        let gridClass;
        switch (cols) {
          case '4': gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'; break;
          case '3': gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'; break;
          default: gridClass = 'grid-cols-1 sm:grid-cols-2'; break;
        }
        const itemsHtml = block.items.map((item) => {
          const itemCitation = generateImageCitation(item.imageTitle, item.imageAuthor, item.imageSource, item.imageDate);
          return `
                <div class="group flex flex-col">
                    <div class="flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
                        <img src="${item.src}" alt="${item.alt}" class="max-w-full h-auto object-contain self-center rounded-lg shadow-md" />
                    </div>
                    ${item.caption ? `<div class="bg-gray-50 border border-gray-200 p-2 mt-2 rounded-lg text-sm text-gray-600">${item.caption}</div>` : ''}
                    ${itemCitation ? `<div class="bg-gray-50 border border-gray-200 p-2 mt-1 rounded-lg text-sm text-gray-600">${itemCitation}</div>` : ''}
                </div>
            `;
        }).join('');
        return `<div class="my-6"><div class="grid ${gridClass} gap-4">${itemsHtml}</div></div>`;
      case 'audio':
        const audioCitation = generateAudioCitation(block.audioTitle, block.audioCreator, block.audioSourceInfo, block.audioDateInfo);
        return `
            <div class="my-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                ${block.description ? `<div class="text-gray-600 italic mb-4 text-sm">${block.description}</div>` : ''}
                <audio controls src="${block.src}" class="w-full"></audio>
                ${audioCitation ? `<div class="bg-white border border-gray-200 p-3 mt-3 rounded-lg text-sm text-gray-600">${audioCitation}</div>` : ''}
            </div>
        `;
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

        // Generate HTML for each card - content now supports rich text/HTML formatting
        const cardItemsHtml = block.items.map(item => `
    <div class="p-6 rounded-xl border-l-4 ${cardStyleConfig.bg} ${cardStyleConfig.border} shadow-sm hover:shadow-md transition-shadow">
      <h4 class="font-semibold mb-3 ${cardStyleConfig.accent}">${item.title}</h4>
      <div class="text-gray-700 prose prose-sm max-w-none">${item.content}</div>
    </div>
  `).join('');

        return `
    <div class="my-6">
      <div class="grid ${layoutClass} gap-4">
        ${cardItemsHtml}
      </div>
    </div>
  `;

      default:
        return `<div>Unsupported content type: ${block.type}</div>`;
    }
  };

  const handleExportHTML = () => {
    showSaveIndicator('🔒 Preparing locked HTML...', 'saving');
    const logoHtml = getLogoHtml('logo');

    // inside handleExportHTML (App.js)
    const headerHtml = `
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="flex items-start justify-between space-x-6">

        <div class="flex flex-col items-center md:items-start space-y-3">
          <p class="text-lg text-gray-600">${displayDate}</p>
          ${logoHtml ? `<div class="logo">${logoHtml}</div>` : ''}
        </div>

        <div class="flex-1 text-center md:text-left">
          <h1 class="text-4xl font-bold text-gray-900">
            ${headerData.courseTopic.replace(/Week \d+/, `Week ${week}`)}
          </h1>
        </div>

        <div class="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 items-center flex-shrink-0">
          <span class="font-medium text-gray-800 text-right">Instructor:</span>
          <span class="text-gray-600">${headerData.instructorName}</span>
          <span class="font-medium text-gray-800 text-right">Email:</span>
          <span class="text-gray-600">${headerData.instructorEmail}</span>
        </div>

      </div>
    </div>
  </header>
`;

    // inside handleExportHTML (App.js)
    const navHtml = `
<nav class="bg-white border-b border-gray-200 sticky top-0 z-40">
  <div class="max-w-8xl mx-auto px-6">
    <ul class="flex justify-center gap-1 py-2 flex-wrap">
      ${sections.map(section => {
      // only student-friendly label (fallback to formal if missing)
      const label = studentFriendlyTitles[section.id] || section.title;
      return `
        <li>
          <a
            href="#${section.id}"
            class="px-4 py-2 rounded-t-lg transition-all font-medium text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            ${label}
          </a>
        </li>`;
    }).join('')}
    </ul>
  </div>
</nav>
`;

    const sectionColors = {
      'overview': { bg: 'bg-slate-600' }, 'bridge-in': { bg: 'bg-red-500' },
      'outcomes': { bg: 'bg-emerald-500' }, 'pre-assessment': { bg: 'bg-amber-500' },
      'participatory-learning': { bg: 'bg-blue-500' }, 'post-assessment': { bg: 'bg-purple-500' },
      'summary': { bg: 'bg-indigo-500' }, 'resources': { bg: 'bg-gray-600' }
    };

    // inside handleExportHTML (App.js)
    const sectionsHtml = sections.map(section => {
      const label = studentFriendlyTitles[section.id] || section.title;
      const colorConfig = sectionColors[section.id] || { bg: 'bg-slate-600' };
      const blocksHtml = section.blocks.map(getBlockHtml).join('');

      return `
  <div id="${section.id}" class="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
    <div class="${colorConfig.bg} text-white px-8 py-6 cursor-pointer flex justify-between items-center section-header">
      <h2 class="text-xl font-semibold">${label}</h2>
      <div class="toggle-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
    <div class="content-container closed">
      <div>
        <div class="p-8">
          ${blocksHtml}
        </div>
      </div>
    </div>
  </div>`;
    }).join('');

    const footerHtml = `
      <footer class="bg-gray-900 text-white py-8 mt-16">
        <div class="max-w-7xl mx-auto px-6 text-center">
          <p class="mb-2 font-medium">${headerData.footerCourseInfo}</p>
          <p class="mb-2 text-gray-300">${headerData.footerInstitution}</p>
          <p class="text-gray-400 text-sm">${headerData.footerCopyright}</p>
        </div>
      </footer>
    `;

    const accordionJs = `
      <script>
        document.addEventListener('DOMContentLoaded', function() {
            const smoothScrollTo = (elementY, duration = 1000) => {
                const startingY = window.pageYOffset;
                const diff = elementY - startingY;
                let start;

                const step = (timestamp) => {
                    if (!start) start = timestamp;
                    const time = timestamp - start;
                    const percent = Math.min(time / duration, 1);
                    const easing = percent < 0.5 ? 4 * percent * percent * percent : 1 - Math.pow(-2 * percent + 2, 3) / 2;
                    window.scrollTo(0, startingY + diff * easing);
                    if (time < duration) {
                        window.requestAnimationFrame(step);
                    }
                }
                window.requestAnimationFrame(step);
            }

            // Improved section header click handling
            document.querySelectorAll('.section-header').forEach(header => {
                header.addEventListener('click', function() {
                    const content = this.nextElementSibling;
                    const icon = this.querySelector('.toggle-icon');
                    
                    if (content && icon) {
                        // Toggle the closed state
                        const isClosed = content.classList.contains('closed');
                        
                        if (isClosed) {
                            content.classList.remove('closed');
                            icon.classList.add('rotated');
                        } else {
                            content.classList.add('closed');
                            icon.classList.remove('rotated');
                        }
                    }
                });
            });
            
            // Improved navigation click handling
            document.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetSection = document.getElementById(targetId);
                    
                    if (targetSection) {
                        const content = targetSection.querySelector('.content-container');
                        const icon = targetSection.querySelector('.toggle-icon');
                        
                        // Always open the target section when clicking nav
                        if (content && content.classList.contains('closed')) {
                            content.classList.remove('closed');
                            if (icon) icon.classList.add('rotated');
                        }
                        
                        // Smooth scroll to the section
                        const elementPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
                        const offsetPosition = elementPosition - 60; 
                        smoothScrollTo(offsetPosition, 1000);
                    }
                });
            });
        });
      </script>`;

    const fixedStyles = `
      <style>
        .logo {
            max-height: 80px;
            margin-bottom: 15px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
        .toggle-icon { 
            transition: transform 0.3s ease-in-out; 
        }
        .toggle-icon.rotated { 
            transform: rotate(90deg); 
        }
        body { 
            background-color: #f9fafb;
        }

        /* ===== CORRECTED ACCORDION STYLES ===== */
        .content-container {
            display: grid;
            grid-template-rows: 1fr;
            transition: grid-template-rows 0.7s cubic-bezier(0.83, 0, 0.17, 1), opacity 0.5s ease-out;
            opacity: 1;
            overflow: hidden;
        }
        .content-container.closed {
            grid-template-rows: 0fr;
            opacity: 0;
        }
        .content-container > div {
            min-height: 0;
            overflow: hidden;
        }
        
        /* Ensure smooth animation performance */
        .content-container * {
            will-change: auto;
        }
      </style>`;

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Week ${week} - ${headerData.courseTopic}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        ${fixedStyles}
      </head>
      <body class="bg-gray-50">
        ${headerHtml}
        ${navHtml}
        <div class="max-w-7xl mx-auto px-16 py-12">
            ${sectionsHtml}
        </div>
        ${footerHtml}
        ${accordionJs}
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Week${week}_Lecture_${date.replace(/[^a-zA-Z0-9]/g, '_')}_Student.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showSaveIndicator('🔒 Locked HTML exported');
  };

  const handleSave = () => {
    const sectionsObject = sections.reduce((obj, section) => {
      obj[section.id] = section.blocks.map(({ id, ...rest }) => rest);
      return obj;
    }, {});

    const data = {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      ...headerData,
      week,
      date,
      sections: sectionsObject
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Week${week}_Lecture_${date.replace(/[^a-zA-Z0-9]/g, '_')}_v2.json`;
    a.click();
    URL.revokeObjectURL(url);

    clearAutoSavedData();
    showSaveIndicator('💾 Content saved successfully');
  };

  const handleLoad = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    showSaveIndicator('📁 Loading content...', 'saving');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const {
          courseTopic, instructorName, instructorEmail,
          footerCourseInfo, footerInstitution, footerCopyright,
          week: loadedWeek, date: loadedDate, sections: loadedSectionsObject
        } = data;

        setHeaderData({
          courseTopic, instructorName, instructorEmail,
          footerCourseInfo, footerInstitution, footerCopyright
        });
        if (loadedWeek) setWeek(loadedWeek);
        if (loadedDate) setDate(loadedDate);

        if (loadedSectionsObject) {
          const loadedSectionsArray = Object.keys(loadedSectionsObject).map(sectionId => {
            const originalSection = sections.find(s => s.id === sectionId) || { title: 'New Section', type: 'content' };
            return {
              ...originalSection,
              id: sectionId,
              blocks: loadedSectionsObject[sectionId].map(block => ({ ...block, id: generateId() }))
            };
          });
          setSections(loadedSectionsArray);
        }

        clearAutoSavedData();
        showSaveIndicator('📁 Content loaded successfully');
      } catch (error) {
        console.error('Error loading content:', error);
        showSaveIndicator('❌ Error loading content', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // CORRECTED handleModalSave function
  // This should replace the existing handleModalSave function in the main component

  const handleModalSave = (blockData) => {
    const { sectionId, isEditing, insertAfterBlockId, ...content } = blockData;

    console.log('handleModalSave received:', blockData); // Debug log

    if (isEditing) {
      setSections(prevSections =>
        prevSections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              blocks: section.blocks.map(block => {
                if (block.id === content.id) {
                  // Merge the updated content with the existing block
                  let updatedBlock = { ...block, ...content };

                  // Special handling for cards - ensure items are properly set
                  if (block.type === 'cards') {
                    updatedBlock.items = content.cardItems || content.items || [];
                    updatedBlock.layout = content.cardLayout || content.layout || '2x1';
                    updatedBlock.style = content.cardStyle || content.style || 'info';
                  }

                  // ADDED: Special handling for galleries
                  if (block.type === 'gallery') {
                    updatedBlock.items = content.items || [];
                    updatedBlock.columns = content.columns || '2';
                  }

                  return updatedBlock;
                }
                return block;
              })
            };
          }
          return section;
        })
      );
      showSaveIndicator(`💾 ${content.type} content updated`);
    } else {
      // Create new block
      const newBlock = {
        id: generateId(),
        ...content,
        // Don't override the type that comes from content, use modalContentType as fallback
        type: content.type || modalContentType,
      };

      console.log('Creating new block:', newBlock); // Debug log

      const targetSectionId = sectionId || defaultSection || 'overview';
      setSections(prevSections =>
        prevSections.map(section => {
          if (section.id !== targetSectionId) return section;
          const blocks = [...section.blocks];
          if (insertAfterBlockId) {
            const index = blocks.findIndex(b => b.id === insertAfterBlockId);
            if (index !== -1) {
              blocks.splice(index + 1, 0, newBlock);
            } else {
              blocks.push(newBlock);
            }
          } else {
            blocks.push(newBlock);
          }
          return { ...section, blocks };
        })
      );
      showSaveIndicator(`💾 ${content.type || modalContentType} content added`);
    }
  };

  const handleBlockEdit = (blockToEdit, sectionId) => {
    setModalContentType(blockToEdit.type);

    let initialDataForModal = { ...blockToEdit, sectionId, isEditing: true };

    // Helper function to convert HTML to plain text for editing
    const htmlToText = (html) => {
      if (!html) return '';

      // Create a temporary div to parse HTML
      const temp = document.createElement('div');
      temp.innerHTML = html;

      // Convert lists to plain text with bullet points
      const listItems = temp.querySelectorAll('li');
      listItems.forEach(li => {
        li.innerHTML = '• ' + li.innerHTML;
      });

      // Remove HTML tags but preserve line breaks
      return temp.textContent || temp.innerText || '';
    };

    // Special handling for different content types
    if (blockToEdit.type === 'cards') {
      // UPDATED: Preserve HTML content instead of converting to plain text
      const cleanedItems = (blockToEdit.items || []).map(item => ({
        title: item.title || '',
        content: item.content || '' // Keep HTML formatting intact
      }));

      initialDataForModal.cardItems = cleanedItems;
      initialDataForModal.cardLayout = blockToEdit.layout || '2x1';
      initialDataForModal.cardStyle = blockToEdit.style || 'info';
    } else if (blockToEdit.type === 'image') {
      // Handle image editing - map existing image data
      initialDataForModal.image_alt = blockToEdit.alt;
      initialDataForModal.image_size = blockToEdit.size;
      initialDataForModal.image_caption = blockToEdit.caption?.replace('<strong>Figure:</strong> ', '') || '';
      initialDataForModal.image_title = blockToEdit.imageTitle;
      initialDataForModal.image_author = blockToEdit.imageAuthor;
      initialDataForModal.image_source = blockToEdit.imageSource;
      initialDataForModal.image_date = blockToEdit.imageDate;
    } else if (blockToEdit.type === 'gallery') {
      // Handle gallery editing
      initialDataForModal.galleryColumns = blockToEdit.columns;
      initialDataForModal.imageFiles = null; // Will be populated if user uploads new files
      // Map existing gallery items for display/editing
      if (blockToEdit.items) {
        blockToEdit.items.forEach((item, index) => {
          const baseFieldName = `image_${index}`;
          initialDataForModal[`${baseFieldName}_alt`] = item.alt;
          initialDataForModal[`${baseFieldName}_caption`] = item.caption?.replace(/^<strong>Figure \d+:<\/strong> /, '') || '';
          initialDataForModal[`${baseFieldName}_title`] = item.imageTitle;
          initialDataForModal[`${baseFieldName}_author`] = item.imageAuthor;
          initialDataForModal[`${baseFieldName}_source`] = item.imageSource;
          initialDataForModal[`${baseFieldName}_date`] = item.imageDate;
        });
      }
    } else if (blockToEdit.type === 'video') {
      // Handle video editing
      initialDataForModal.videoPlatform = blockToEdit.videoPlatform || 'youtube';
      initialDataForModal.videoUrl = blockToEdit.videoUrl;
      initialDataForModal.embedCode = blockToEdit.embedCode;
      initialDataForModal.aspectRatio = blockToEdit.aspectRatio || '16-9';
      initialDataForModal.videoTitle = blockToEdit.videoTitle;
      initialDataForModal.videoAuthor = blockToEdit.videoAuthor;
      initialDataForModal.videoDate = blockToEdit.videoDate;
      initialDataForModal.videoSource = blockToEdit.videoSource;
    } else if (blockToEdit.type === 'audio') {
      // Handle audio editing
      initialDataForModal.audioDescription = blockToEdit.description;
      initialDataForModal.audioTitle = blockToEdit.audioTitle;
      initialDataForModal.audioCreator = blockToEdit.audioCreator;
      initialDataForModal.audioSourceInfo = blockToEdit.audioSourceInfo;
      initialDataForModal.audioDateInfo = blockToEdit.audioDateInfo;
      // Note: We can't edit the audio file itself in edit mode, only metadata
    }

    setModalInitialData(initialDataForModal);
    setIsModalOpen(true);
  };

  const handleHeaderDataChange = (field, value) => {
    setHeaderData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleSection = (sectionId) => {
    setOpenSectionIds(prevOpenIds => {
      if (prevOpenIds.includes(sectionId)) {
        return prevOpenIds.filter(id => id !== sectionId);
      } else {
        return [...prevOpenIds, sectionId];
      }
    });
  };

  const handleToggleAllSections = () => {
    // If any sections are open, close them all.
    if (openSectionIds.length > 0) {
      setOpenSectionIds([]);
    } else {
      // If all sections are closed, open them all.
      const allSectionIds = sections.map(section => section.id);
      setOpenSectionIds(allSectionIds);
    }
  };

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (!openSectionIds.includes(sectionId)) {
      setOpenSectionIds(prev => [...prev, sectionId]);
    }
    // Use a timeout to allow the accordion to start opening before scrolling
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        // Offset to account for the sticky nav bar (adjust 60 if your nav is taller/shorter)
        const offsetPosition = elementPosition - 60;
        smoothScrollTo(offsetPosition, 1000); // Using the new function
      }
    }, 100);
  };

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SaveIndicator {...saveIndicator} />

      {/* Auto-save Recovery Modal */}
      <AutoSaveRecoveryModal
        isOpen={showAutoSaveRecovery}
        onRecover={handleRecoverAutoSave}
        onDiscard={handleDiscardAutoSave}
        timestamp={autoSaveData?.timestamp}
      />

      {/* Control Panel Toggle Button */}
      <button
        onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
        className={`fixed top-6 z-50 bg-slate-700 hover:bg-slate-800 text-white rounded-xl flex items-center gap-2 shadow-lg transition-all no-print h-12 px-4 ${isControlPanelOpen ? 'right-[26rem]' : 'right-6'
          }`}
      >
        <Settings size={20} />
        <span>Customize Template</span>
      </button>

      <ControlPanel
        isEditMode={isEditMode}
        onToggleEditMode={handleToggleEditMode}
        onExportPDF={handleExportPDF}
        onExportHTML={handleExportHTML}
        onSave={handleSave}
        onLoad={handleLoad}
        onAddSection={handleAddSection}
        onAddContent={(type) => handleAddContent(defaultSection, type)}
        week={week}
        onWeekChange={setWeek}
        date={date}
        onDateChange={setDate}
        isOpen={isControlPanelOpen}
        onToggle={() => setIsControlPanelOpen(!isControlPanelOpen)}
        hasUnsavedChanges={hasUnsavedChanges}
        lastSaved={lastSaved}
        sections={sections}
        defaultSection={defaultSection}
        onDefaultSectionChange={setDefaultSection}
        onOpenLogoSettings={() => setShowLogoSettings(true)}
        instructorName={headerData.instructorName}
        instructorEmail={headerData.instructorEmail}
        onHeaderDataChange={handleHeaderDataChange}
        headerData={headerData}
      />

      <header className="bg-white border-b border-gray-200 shadow-sm print-break-inside-avoid">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between space-x-6">

            {/* ← LEFT COLUMN: Date over Logo */}
            <div className="flex flex-col items-center md:items-start space-y-3">
              <p className="text-lg text-gray-600">{displayDate}</p>
              {hasLogo && (
                <div
                  className="flex-shrink-0"
                  dangerouslySetInnerHTML={{ __html: getLogoHtml('max-h-20') }}
                />
              )}
            </div>

            {/* ← MIDDLE COLUMN: Editable Title */}
            <div className={`text-center md:text-left transition-all duration-200 ${isEditingTitle ? 'flex-[2]' : 'flex-1'}`}>
              {!isEditingTitle ? (
                <h1
                  className="text-4xl font-bold text-gray-900 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors duration-200"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {headerData.courseTopic.replace(/Week \d+/, `Week ${week}`)}
                </h1>
              ) : (
                <input
                  type="text"
                  className="text-4xl font-bold text-gray-900 bg-transparent border-2 border-blue-500 rounded px-2 py-1 w-full min-w-full focus:outline-none"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyDown}
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  style={{ minWidth: '100%' }}
                />
              )}
              <p className="text-xs text-gray-500 italic mt-1">Click the title to edit</p>
            </div>

            {/* ← RIGHT COLUMN: Instructor Info */}
            <div className="flex-shrink-0">
              <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 items-center">
                <span className="font-medium text-gray-800 text-right">Instructor:</span>
                <p
                  className="text-gray-600"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleHeaderDataChange('instructorName', e.currentTarget.textContent)}
                >
                  {headerData.instructorName}
                </p>

                <span className="font-medium text-gray-800 text-right">Email:</span>
                <p
                  className="text-gray-600"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => handleHeaderDataChange('instructorEmail', e.currentTarget.textContent)}
                >
                  {headerData.instructorEmail}
                </p>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-6">
          <div className="py-2 flex justify-center">
            <ul className="flex justify-center gap-1 flex-wrap">
              {sections.map(section => (
                <li key={section.id}>
                  {/* FIX: Added the opening <a> tag here */}
                  <a
                    href={`#${section.id}`}
                    onClick={(e) => handleNavClick(e, section.id)}
                    className={`px-4 py-2 rounded-t-lg transition-all font-medium text-sm ${activeSectionId === section.id
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Control Bar */}
      <div className="bg-gray-50 border-b border-gray-200 no-print">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (!isEditMode) handleToggleEditMode(); }}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${isEditMode
                ? 'bg-slate-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Edit Mode
            </button>
            <button
              onClick={() => { if (isEditMode) handleToggleEditMode(); }}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${!isEditMode
                ? 'bg-slate-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Preview Mode
            </button>
            <button
              onClick={handleToggleAllSections}
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              title={openSectionIds.length > 0 ? "Collapse All Sections" : "Expand All Sections"}
            >
              {openSectionIds.length > 0 ? (
                <React.Fragment>
                  <ChevronUp size={16} />
                  Collapse All
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <ChevronDown size={16} />
                  Expand All
                </React.Fragment>
              )}
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
            <input
              type="file"
              accept=".json"
              onChange={handleLoad}
              className="hidden"
              id="toolbarLoadFile"
            />
            <button
              onClick={() => document.getElementById('toolbarLoadFile').click()}
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Upload size={16} />
              Load
            </button>
            <div className="ml-auto text-sm text-gray-500">
              {openSectionIds.length}/{sections.length} open
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-16 py-12">
        {sections.map(section => (
          <Section
            key={section.id}
            section={section}
            onUpdate={handleSectionUpdate}
            isEditMode={isEditMode}
            onAddContent={(sectionId) => handleAddContent(sectionId)}
            onDeleteSection={handleDeleteSection}
            onBlockEdit={handleBlockEdit}
            isOpen={openSectionIds.includes(section.id)}
            onToggle={() => handleToggleSection(section.id)}
            htmlModes={htmlModes}
            toggleHtmlMode={toggleHtmlMode}
            onAddBlockBelow={handleAddBlockBelow}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16 print-break-before">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="mb-2 font-medium">{headerData.footerCourseInfo}</p>
          <p className="mb-2 text-gray-300">{headerData.footerInstitution}</p>
          <p className="text-gray-400 text-sm">{headerData.footerCopyright}</p>
        </div>
      </footer>

      {/* Content Modal */}
      <ContentModal
        isOpen={isModalOpen}
        contentType={modalContentType}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        initialData={modalInitialData}
      />

      {/* School Logo Settings Modal */}
      {showLogoSettings && (
        <SchoolLogoSettings onClose={() => setShowLogoSettings(false)} />
      )}

      {/* Back to Top Button */}
      <button
        onClick={() => smoothScrollTo(0, 1000)}
        className="fixed bottom-8 right-8 w-12 h-12 bg-slate-700 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-lg transition-all no-print opacity-0 invisible hover:opacity-100 hover:visible"
        style={{
          opacity: typeof window !== 'undefined' && window.pageYOffset > 300 ? 1 : 0,
          visibility: typeof window !== 'undefined' && window.pageYOffset > 300 ? 'visible' : 'hidden'
        }}
      >
        ↑
      </button>

      {/* Print and Animation Styles */}
      <style jsx="true">{`
        @media print {
          .no-print, .no-print * {
            display: none !important;
          }
          
          body {
            background: white !important;
            font-size: 12pt;
            line-height: 1.4;
          }
          
          .print-break-inside-avoid {
            break-inside: avoid;
          }
          
          .print-break-before {
            break-before: page;
          }
          
          h1 { font-size: 24pt; }
          h2 { font-size: 18pt; }
          h3 { font-size: 16pt; }
          h4 { font-size: 14pt; }
          
          .bg-gradient-to-br {
            background: white !important;
          }
          
          .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl {
            box-shadow: none !important;
          }
          
          .rounded-2xl, .rounded-xl, .rounded-lg {
            border-radius: 8px !important;
          }
          
          .border-gray-200 {
            border-color: #d1d5db !important;
          }
          
          /* Ensure proper spacing for printed content */
          .section {
            margin-bottom: 2rem;
          }
          
          /* Video placeholders for print */
          iframe {
            border: 2px solid #d1d5db;
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          iframe::after {
            content: 'Video content available in digital version';
            color: #6b7280;
            font-style: italic;
          }
          
          .print-gallery-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
          .print-gallery-cols-3 { grid-template-columns: repeat(3, 1fr) !important; }
          .print-gallery-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }
          
          .group, img {
             break-inside: avoid;
          }
        }

        .accordion-content-wrapper {
    display: grid;
    grid-template-rows: 0fr;
    transition: 
      grid-template-rows 0.7s cubic-bezier(0.83, 0, 0.17, 1),
      opacity 0.5s ease-out;
    opacity: 0;
    overflow: hidden;
  }

  .accordion-content-wrapper.is-open {
    grid-template-rows: 1fr;
    opacity: 1;
  }

  .accordion-content-wrapper > div {
    min-height: 0;
    overflow: hidden;
  }
  /* Card content formatting - ensures rich text displays properly */
.card-content {
  line-height: 1.6;
}

.card-content p {
  margin-bottom: 0.75rem;
}

.card-content p:last-child {
  margin-bottom: 0;
}

.card-content ul, .card-content ol {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.card-content ul {
  list-style-type: disc;
}

.card-content ol {
  list-style-type: decimal;
}

.card-content li {
  margin-bottom: 0.25rem;
  line-height: 1.5;
}

.card-content strong {
  font-weight: 600;
}

.card-content em {
  font-style: italic;
}

.card-content h1, .card-content h2, .card-content h3, .card-content h4 {
  font-weight: 600;
  margin: 0.75rem 0 0.5rem 0;
  line-height: 1.3;
}

.card-content h1 { font-size: 1.25rem; }
.card-content h2 { font-size: 1.125rem; }
.card-content h3 { font-size: 1rem; }
.card-content h4 { font-size: 0.875rem; }

.card-content a {
  color: #3b82f6;
  text-decoration: underline;
}

.card-content a:hover {
  color: #1d4ed8;
}
/* ========================================
   HTML MODE STYLES - Added for HTML editing functionality
   ======================================== */

/* HTML Mode Textarea */
.html-editor-textarea {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace !important;
  font-size: 13px;
  line-height: 1.5;
  tab-size: 2;
}

/* Rich Text Editor Improvements */
.rich-editor-content .ProseMirror {
  outline: none;
  min-height: 100px;
  padding: 1rem;
}

.rich-editor-content .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
  font-style: italic;
}

/* HTML/Rich Text Toggle Button */
.mode-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  cursor: pointer;
}

.mode-toggle.html-active {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #fbbf24;
}

.mode-toggle.rich-active {
  background-color: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
}

/* HTML Error Messages */
.html-error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 4px;
  margin-bottom: 8px;
}

/* Quick Insert Buttons in HTML Mode */
.html-quick-insert {
  font-size: 11px;
  padding: 4px 8px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.html-quick-insert:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

      `}</style>
    </div>
  );
};

const App = ({ initialData }) => {
  return (
    <LogoProvider>
      <LectureTemplateSystem initialData={initialData} />
    </LogoProvider>
  );
};

export default App;