/*
  Enhanced App.js with Full Tiptap Editor Integration
  This file includes ALL original functionality plus enhanced Tiptap editor features
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Upload, Eye, Edit3, Save, Plus, Video, Image, Music, CreditCard, X, Settings, ChevronDown, ChevronRight, GripVertical, Trash2, Copy, FileText, List, AlertCircle, CheckCircle, AlertTriangle, Play, Pause, Clock, ChevronUp } from 'lucide-react';
import { LogoProvider, useLogo } from './LogoContext';
import SchoolLogoSettings from './SchoolLogoSettings';

// Enhanced Tiptap imports - including all new extensions
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
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

// Utility functions
const generateId = () => 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

const extractVideoId = (url, platform) => {
  if (!url) return null;
  switch (platform) {
    case 'youtube':
      const youtubeRegExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const youtubeMatch = url.match(youtubeRegExp);
      return youtubeMatch ? youtubeMatch[1] : null;
    case 'vimeo':
      const vimeoRegExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
      const vimeoMatch = url.match(vimeoRegExp);
      return vimeoMatch ? vimeoMatch[1] : null;
    case 'panopto':
      return url.includes('panopto.com') ? url : null;
    default:
      return null;
  }
};

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

const generateImageCitation = (title, author, source, date) => {
  if (!title && !author && !source && !date) return '';
  let citation = '';
  if (author) citation += `<strong>${author}.</strong> `;
  if (date) {
    const imageDate = new Date(date + 'T00:00:00');
    citation += `(${imageDate.getFullYear()}). `;
  } else if (author) {
    citation += `(n.d.). `;
  }
  if (title) citation += `<em>${title}</em> [Image]. `;
  if (source) citation += `${source}.`;
  return citation.trim();
};

const generateAudioCitation = (title, creator, source, date) => {
  if (!title && !creator && !source && !date) return '';
  let citation = '';
  if (creator) citation += `<strong>${creator}.</strong> `;
  if (date) {
    const audioDate = new Date(date + 'T00:00:00');
    citation += `(${audioDate.getFullYear()}). `;
  } else if (creator) {
    citation += `(n.d.). `;
  }
  if (title) citation += `<em>${title}</em> [Audio]. `;
  if (source) citation += `${source}.`;
  return citation.trim();
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

// Enhanced Tiptap Rich Text Editor Component
const RichTextEditor = ({ content, onChange, isHtmlMode, onToggleHtmlMode, isPreviewMode = false }) => {
  const [htmlContent, setHtmlContent] = useState(content || '');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // Disable some extensions that we'll configure separately
        table: false,
      }),
      // Essential styling extensions
      TextStyle,
      Underline,
      Color.configure({
        types: ['textStyle'],
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      // Text alignment
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      // Links
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      // Tables
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      // Placeholder
      Placeholder.configure({
        placeholder: 'Start typing your content...',
      }),
    ],
    content: content || '',
    editable: !isPreviewMode,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html); // Update local state immediately
      if (onChange) {
        onChange(html);
      }
    },
    onBlur: ({ editor }) => {
      // Ensure content is saved when editor loses focus
      const html = editor.getHTML();
      setHtmlContent(html);
      if (onChange) {
        onChange(html);
      }
    },
    onFocus: ({ editor }) => {
      // Ensure we have the latest content when editor gains focus
      const html = editor.getHTML();
      setHtmlContent(html);
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', false);
      setHtmlContent(content || '');
    }
  }, [content, editor]);

  // Update HTML content when switching modes and ensure content is synced
  useEffect(() => {
    if (editor) {
      const currentHtml = editor.getHTML();
      setHtmlContent(currentHtml);
      // Ensure the parent component gets the latest content when switching modes
      if (onChange && currentHtml !== content) {
        onChange(currentHtml);
      }
    }
  }, [isHtmlMode, editor]);

  // Ensure content is saved when component unmounts or editor changes
  useEffect(() => {
    return () => {
      if (editor && onChange) {
        const finalHtml = editor.getHTML();
        if (finalHtml !== content) {
          onChange(finalHtml);
        }
      }
    };
  }, [editor, onChange, content]);

  // Handle HTML mode changes
  const handleHtmlChange = (value) => {
    setHtmlContent(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleHtmlModeToggle = () => {
    if (isHtmlMode && editor) {
      // Switching from HTML to visual mode
      editor.commands.setContent(htmlContent, false);
    }
    onToggleHtmlMode && onToggleHtmlMode();
  };

  // Helper functions for toolbar actions
  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl || 'https://');

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const setTextColor = (color) => {
    editor.chain().focus().setColor(color).run();
  };

  const setHighlightColor = (color) => {
    editor.chain().focus().toggleHighlight({ color }).run();
  };

  const setFontFamily = (fontFamily) => {
    editor.chain().focus().setFontFamily(fontFamily).run();
  };

  if (!editor) {
    return (
      <div className="flex flex-col border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 text-center text-gray-500">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-700">Content Editor</div>
        {onToggleHtmlMode && (
          <button
            type="button"
            onClick={handleHtmlModeToggle}
            className={`px-3 py-1 text-xs rounded-md transition-all ${isHtmlMode
              ? 'bg-slate-700 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
          >
          HTML
      </button>
        )}
    </div>

      {/* Enhanced Toolbar - Hidden in preview mode and HTML mode */ }
  {
    !isHtmlMode && !isPreviewMode && (
      <div className="flex flex-wrap items-center gap-1 p-3 bg-white border-b border-gray-200">
        {/* Font Family */}
        <div className="flex items-center gap-1 mr-2">
          <select
            onChange={(e) => setFontFamily(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
            defaultValue=""
          >
            <option value="">Font Family</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 text-sm border rounded hover:bg-gray-50 transition-colors ${editor.isActive('bold') ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-200'
              }`}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 text-sm border rounded hover:bg-gray-50 transition-colors ${editor.isActive('italic') ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-200'
              }`}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 text-sm border rounded hover:bg-gray-50 transition-colors ${editor.isActive('underline') ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-200'
              }`}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 text-sm border rounded hover:bg-gray-50 transition-colors ${editor.isActive('strike') ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-200'
              }`}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        {/* Text Color */}
        <div className="flex items-center gap-1">
          <input
            type="color"
            onChange={(e) => setTextColor(e.target.value)}
            className="w-8 h-8 border border-gray-200 rounded cursor-pointer"
            title="Text Color"
          />
          <input
            type="color"
            onChange={(e) => setHighlightColor(e.target.value)}
            className="w-8 h-8 border border-gray-200 rounded cursor-pointer"
            title="Highlight Color"
          />
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        {/* Superscript/Subscript */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={`px-2 py-1 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('superscript') ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-200'
              }`}
            title="Superscript"
          >
            X²
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={`px-2 py-1 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('subscript') ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-200'
              }`}
            title="Subscript"
          >
            X₁
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        {/* Headings */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-2 py-1 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('paragraph') ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
              }`}
          >
            P
          </button>
          {[1, 2, 3, 4].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              className={`px-2 py-1 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('heading', { level }) ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
                }`}
            >
              H{level}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        {/* Lists */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('bulletList') ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
              }`}
            title="Bullet List"
          >
            ●
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('orderedList') ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
              }`}
            title="Numbered List"
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('blockquote') ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
              }`}
            title="Quote"
          >
            "
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
              }`}
            title="Align Left"
          >
            ⇤
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
              }`}
            title="Align Center"
          >
            ≡
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 border-blue-300' : 'border-gray-200'
              }`}
            title="Align Right"
          >
            ⇥
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        {/* Table and More */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={addTable}
            className="px-2 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            title="Insert Table"
          >
            📊 Table
          </button>
          <button
            type="button"
            onClick={setLink}
            className={`px-2 py-2 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('link') ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-200'
              }`}
            title="Insert Link"
          >
            🔗 Link
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="px-2 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            title="Horizontal Line"
          >
            —
          </button>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1"></div>

        {/* Clear and Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="px-2 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            title="Clear Formatting"
          >
            ✕ Clear
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 text-xs border border-gray-200 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>
    )
  }

  {/* Editor Area */ }
  {
    isHtmlMode ? (
      <textarea
        value={htmlContent}
        onChange={(e) => handleHtmlChange(e.target.value)}
        className="flex-1 p-4 border-none resize-none focus:outline-none font-mono text-sm min-h-20 max-h-96"
        placeholder="Enter HTML content..."
      />
    ) : (
      <div className="flex-1 min-h-20 max-h-96 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none p-4 focus:outline-none rich-editor-content min-h-16"
        />
      </div>
    )
  }
    </div >
  );
};

// App.js (near your imports)
const studentFriendlyTitles = {
  'bridge-in': 'Getting Started',
  'outcomes': "What You’ll Learn Today",
  'pre-assessment': 'Quick Check-In',
  'participatory-learning': 'Let’s Dive In',
  'post-assessment': 'Your Turn: Show What You Know',
  'summary': 'Key Takeaways',
  // you can add Resources & Materials or Overview if you like:
  'overview': 'Session Overview',
  'resources': 'Resources & Materials',
};


// Audio Player Component
const AudioPlayer = ({ src, description, citation }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="my-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
      {description && (
        <div className="text-gray-600 italic mb-4 text-sm" dangerouslySetInnerHTML={{ __html: description }} />
      )}

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />

        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {citation && (
        <div className="bg-white border border-gray-200 p-3 mt-3 rounded-lg text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: citation }} />
      )}
    </div>
  );
};

// Content Block Component
const ContentBlock = ({ block, onEdit, onDelete, isEditMode, onDragStart, onDrop, onDragOver, onBlockUpdate, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const renderContent = () => {
    switch (block.type) {
      case 'text':
      case 'heading':
      case 'list':
        return isEditMode ? (
          <RichTextEditor
            content={block.content}
            onChange={(content) => onBlockUpdate({ ...block, content })}
          />
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
                  <RichTextEditor
                    content={block.content}
                    onChange={(content) => onBlockUpdate({ ...block, content })}
                  />
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
        const videoCitation = generateAPACitation(block.videoTitle, block.videoAuthor, block.videoDate, block.videoSource, block.videoUrl);
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
              {block.items.map((item, index) => (
                <div key={index} className={`p-6 rounded-xl border-l-4 ${cardStyleConfig.bg} ${cardStyleConfig.border} shadow-sm hover:shadow-md transition-shadow`}>
                  <h4 className={`font-semibold mb-3 ${cardStyleConfig.accent}`}>{item.title}</h4>
                  <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: item.content }} />
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
    <div
      className={`relative group transition-all duration-200 ${isEditMode
        ? 'border-2 border-dashed border-gray-300 p-4 m-2 rounded-xl hover:border-slate-400 hover:bg-slate-50/50'
        : ''
        }`}
      draggable={isEditMode}
      onDragStart={onDragStart}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {isEditMode && (
        <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={onEdit}
            title="Edit"
            className="w-8 h-8 bg-slate-700 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-slate-800 transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
          >
            <X size={14} />
          </button>
          <div className="w-8 h-8 bg-gray-400 text-white rounded-lg flex items-center justify-center shadow-md cursor-grab hover:bg-gray-500 active:cursor-grabbing transition-colors" title="Drag to reorder">
            <GripVertical size={14} />
          </div>
          {!isFirst && (
            <button
              onClick={onMoveUp}
              className="w-8 h-8 bg-gray-400 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-gray-500 transition-colors"
              title="Move Up"
            >
              <ChevronUp size={16} />
            </button>
          )}
          {!isLast && (
            <button
              onClick={onMoveDown}
              className="w-8 h-8 bg-gray-400 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-gray-500 transition-colors"
              title="Move Down"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>
      )}
      {renderContent()}
    </div>
  );
};

// Section Component
const Section = ({ section, onUpdate, isEditMode, onAddContent, onDeleteSection, onBlockEdit, isOpen, onToggle }) => {
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

// Enhanced Content Modal Component with all content types
const ContentModal = ({ isOpen, contentType, onClose, onSave, initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [imageSource, setImageSource] = useState('upload');
  const [isLoadingVideoInfo, setIsLoadingVideoInfo] = useState(false);

  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setIsHtmlMode(false);
      setImageSource('upload');
    }
  }, [isOpen, initialData]);

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
      if (platform === 'youtube') {
        const videoId = extractVideoId(url, platform);
        if (videoId) {
          // In a real implementation, you would use the YouTube API
          // For now, we'll just extract the video ID and set basic info
          setFormData(prev => ({
            ...prev,
            videoTitle: `YouTube Video ${videoId}`,
            videoSource: 'YouTube'
          }));
        }
      } else if (platform === 'vimeo') {
        const videoId = extractVideoId(url, platform);
        if (videoId) {
          // In a real implementation, you would use the Vimeo API
          setFormData(prev => ({
            ...prev,
            videoTitle: `Vimeo Video ${videoId}`,
            videoSource: 'Vimeo'
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching video info:', error);
    } finally {
      setIsLoadingVideoInfo(false);
    }
  };

  const handleSubmit = async () => {
    let processedData = { ...formData };

    switch (contentType) {
      case 'image': {
        const files = imageSource === 'upload' ? Array.from(formData.imageFiles || []) : [];
        const filenames = imageSource === 'server' ? (formData.imageFilenames || '').split('\n').filter(name => name.trim()) : [];
        const isMultiple = files.length > 1 || filenames.length > 1;

        if (isMultiple) {
          const items = [];
          const sourceArr = imageSource === 'upload' ? files : filenames;

          for (let i = 0; i < sourceArr.length; i++) {
            const itemSrc = imageSource === 'upload' ? await handleFileToBase64(sourceArr[i]) : `${(formData.imagePath || '').endsWith('/') ? formData.imagePath : (formData.imagePath || '') + '/'}${sourceArr[i]}`;
            const baseFieldName = `image_${i}`;

            items.push({
              src: itemSrc,
              alt: formData[`${baseFieldName}_alt`] || (imageSource === 'upload' ? sourceArr[i].name : sourceArr[i]),
              caption: formData[`${baseFieldName}_caption`] ? `<strong>Figure ${i + 1}:</strong> ${formData[`${baseFieldName}_caption`]}` : '',
              imageTitle: formData[`${baseFieldName}_title`],
              imageAuthor: formData[`${baseFieldName}_author`],
              imageSource: formData[`${baseFieldName}_source`],
              imageDate: formData[`${baseFieldName}_date`]
            });
          }

          const galleryBlock = {
            ...formData,
            type: 'gallery',
            columns: formData.galleryColumns || '2',
            items: items,
          };
          onSave(galleryBlock);
        } else {
          // Single image logic
          const singleFile = imageSource === 'upload' ? files[0] : (formData.isEditing ? null : filenames[0]);

          if (!singleFile && !formData.isEditing) {
            onClose();
            return;
          }

          const imageBlock = {
            ...formData,
            type: 'image',
            src: singleFile ? (imageSource === 'upload' ? await handleFileToBase64(singleFile) : `${(formData.imagePath || '').endsWith('/') ? formData.imagePath : (formData.imagePath || '') + '/'}${singleFile}`) : formData.src,
            alt: formData.image_alt,
            size: formData.image_size || 'medium',
            caption: formData.image_caption ? `<strong>Figure:</strong> ${formData.image_caption}` : '',
            imageTitle: formData.image_title,
            imageAuthor: formData.image_author,
            imageSource: formData.image_source,
            imageDate: formData.image_date,
          };
          onSave(imageBlock);
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

        onSave({ ...processedData, type: 'video' });
        break;

      case 'audio':
        if (formData.audioFile) {
          const base64 = await handleFileToBase64(formData.audioFile);
          processedData.src = base64;
        }
        onSave({ ...processedData, type: 'audio' });
        break;

      case 'cards':
        // Helper function to convert plain text to HTML
        const textToHtml = (text) => {
          if (!text) return '';

          // Split by lines and process each line
          const lines = text.split('\n').filter(line => line.trim());
          const htmlLines = lines.map(line => {
            const trimmedLine = line.trim();

            // Check if line starts with bullet point
            if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('- ')) {
              return `<li>${trimmedLine.substring(2)}</li>`;
            } else if (/^\d+\./.test(trimmedLine)) {
              // Numbered list item
              return `<li>${trimmedLine.replace(/^\d+\.\s*/, '')}</li>`;
            } else if (trimmedLine) {
              // Regular paragraph
              return `<p>${trimmedLine}</p>`;
            }
            return '';
          }).filter(line => line);

          // Group consecutive list items
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

        // Convert plain text content to HTML and filter out empty cards
        processedData.items = cardItems
          .filter(card => card.title || card.content)
          .map(card => ({
            title: card.title || '',
            content: textToHtml(card.content || '')
          }));

        processedData.layout = formData.cardLayout || '2x1';
        processedData.style = formData.cardStyle || 'info';
        onSave({ ...processedData, type: 'cards' });
        break;

      default:
        onSave({ ...processedData, type: contentType });
        break;
    }

    onClose();
  };

  if (!isOpen) return null;

  const isMultipleImages = (imageSource === 'upload' && formData.imageFiles?.length > 1) ||
    (imageSource === 'server' && formData.imageFilenames?.split('\n').filter(Boolean).length > 1);

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
                isHtmlMode={isHtmlMode}
                onToggleHtmlMode={() => setIsHtmlMode(!isHtmlMode)}
                isPreviewMode={false}
              />
            )}

            {/* Video content */}
            {contentType === 'video' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video Platform:</label>
                  <select
                    value={formData.videoPlatform || 'youtube'}
                    onChange={(e) => setFormData({ ...formData, videoPlatform: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="panopto">Panopto</option>
                    <option value="embed">Custom Embed</option>
                  </select>
                </div>

                {formData.videoPlatform !== 'embed' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video URL:</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.videoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => fetchVideoInfo(formData.videoUrl, formData.videoPlatform)}
                        disabled={isLoadingVideoInfo}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      >
                        {isLoadingVideoInfo ? 'Loading...' : 'Auto-fill'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Embed Code:</label>
                    <textarea
                      value={formData.embedCode || ''}
                      onChange={(e) => setFormData({ ...formData, embedCode: e.target.value })}
                      placeholder="Paste your embed code here..."
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio:</label>
                  <select
                    value={formData.aspectRatio || '16-9'}
                    onChange={(e) => setFormData({ ...formData, aspectRatio: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    <option value="16-9">16:9 (Widescreen)</option>
                    <option value="4-3">4:3 (Standard)</option>
                    <option value="1-1">1:1 (Square)</option>
                    <option value="21-9">21:9 (Ultra-wide)</option>
                  </select>
                </div>

                {/* Citation fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video Title:</label>
                    <input
                      type="text"
                      value={formData.videoTitle || ''}
                      onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Author/Creator:</label>
                    <input
                      type="text"
                      value={formData.videoAuthor || ''}
                      onChange={(e) => setFormData({ ...formData, videoAuthor: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date:</label>
                    <input
                      type="date"
                      value={formData.videoDate || ''}
                      onChange={(e) => setFormData({ ...formData, videoDate: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source:</label>
                    <input
                      type="text"
                      value={formData.videoSource || ''}
                      onChange={(e) => setFormData({ ...formData, videoSource: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Image content */}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image(s):</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setFormData({ ...formData, imageFiles: e.target.files })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Server Path (without filename):</label>
                      <input
                        type="text"
                        value={formData.imagePath || ''}
                        onChange={(e) => setFormData({ ...formData, imagePath: e.target.value })}
                        placeholder="e.g., /content/enforced/123456-Course/images/"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image Filename(s) (one per line for multiple):</label>
                      <textarea
                        value={formData.imageFilenames || ''}
                        onChange={(e) => setFormData({ ...formData, imageFilenames: e.target.value })}
                        placeholder={`diagram.jpg\nchart.png\nphoto.gif`}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono text-sm"
                      />
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

                <div className="space-y-4 mt-4">
                  {imageSource === 'upload' && formData.imageFiles &&
                    Array.from(formData.imageFiles).map((file, index) => (
                      <ImageMetadataForm
                        key={file.name + index}
                        index={index}
                        fileName={file.name}
                        isMultiple={isMultipleImages}
                        formData={formData}
                        onFieldChange={handleFieldChange}
                      />
                    ))
                  }
                  {imageSource === 'server' && formData.imageFilenames &&
                    formData.imageFilenames.split('\n').filter(Boolean).map((filename, index) => (
                      <ImageMetadataForm
                        key={filename + index}
                        index={index}
                        fileName={filename}
                        isMultiple={isMultipleImages}
                        formData={formData}
                        onFieldChange={handleFieldChange}
                      />
                    ))
                  }
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
                      <option value="info">Info</option>
                      <option value="exercise">Exercise</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
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
                            <textarea
                              placeholder="Card Content"
                              value={card?.content || ''}
                              onChange={(e) => {
                                const newItems = [...cards];
                                newItems[index] = {
                                  ...newItems[index],
                                  content: e.target.value
                                };
                                setFormData({ ...formData, cardItems: newItems });
                              }}
                              rows={4}
                              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            />
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
const LectureTemplateSystem = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [week, setWeek] = useState('1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState({ show: false, message: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContentType, setModalContentType] = useState('');
  const [modalInitialData, setModalInitialData] = useState({});
  const [showAutoSaveRecovery, setShowAutoSaveRecovery] = useState(false);
  const [autoSaveData, setAutoSaveData] = useState(null);
  const [defaultSection, setDefaultSection] = useState('overview');
  const [activeSectionId, setActiveSectionId] = useState('');
  const [openSectionIds, setOpenSectionIds] = useState(['overview']); // Can hold multiple IDs

  const [showLogoSettings, setShowLogoSettings] = useState(false);

  // NEW: Use the logo context
  const { getLogoHtml, hasLogo } = useLogo();

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

  // Initial sections data
  const [sections, setSections] = useState([
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
  ]);

  // Auto-save functionality
  const autoSaveKey = `lecture-template-autosave-${week}-${date}`;
  const { lastSaved, hasUnsavedChanges, loadAutoSavedData, clearAutoSavedData } = useAutoSave({
    headerData,
    week,
    date,
    sections
  }, autoSaveKey);

  // Check for auto-saved data on mount
  useEffect(() => {
    const savedData = loadAutoSavedData();
    if (savedData && savedData.timestamp) {
      setAutoSaveData(savedData);
      setShowAutoSaveRecovery(true);
    }
  }, [loadAutoSavedData]);

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
    if (contentType === 'text') {
      const newBlock = {
        id: generateId(),
        type: 'text',
        content: 'Click to edit this text content.'
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
    const wasEditMode = isEditMode;
    if (isEditMode) {
      setIsEditMode(false);
    }

    showSaveIndicator('📄 Preparing PDF...', 'saving');

    setTimeout(() => {
      window.print();
      showSaveIndicator('📄 PDF export ready');

      if (wasEditMode) {
        setTimeout(() => setIsEditMode(true), 1000);
      }
    }, 500);
  };

  const getBlockHtml = (block) => {
    switch (block.type) {
      case 'text':
      case 'heading':
      case 'list':
        return `<div class="prose max-w-none">${block.content}</div>`;
      case 'info-box':
      case 'exercise-box':
      case 'warning-box':
        const boxConfig = {
          'info-box': { bg: 'bg-blue-50', border: 'border-l-4 border-blue-400' },
          'exercise-box': { bg: 'bg-emerald-50', border: 'border-l-4 border-emerald-400' },
          'warning-box': { bg: 'bg-amber-50', border: 'border-l-4 border-amber-400' }
        }[block.type];
        return `<div class="p-4 rounded-lg ${boxConfig.bg} ${boxConfig.border}"><div class="prose max-w-none">${block.content}</div></div>`;
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
        const layoutClass = { '2x1': 'grid-cols-1 md:grid-cols-2', '2x2': 'grid-cols-1 md:grid-cols-2', '3x1': 'grid-cols-1 md:grid-cols-3', '1x3': 'grid-cols-1' }[block.layout] || 'grid-cols-1 md:grid-cols-2';
        const cardStyleConfig = {
          info: { bg: 'bg-slate-50', border: 'border-l-slate-400', accent: 'text-slate-700' },
          exercise: { bg: 'bg-emerald-50', border: 'border-l-emerald-400', accent: 'text-emerald-700' },
          warning: { bg: 'bg-amber-50', border: 'border-l-amber-400', accent: 'text-amber-700' },
          success: { bg: 'bg-green-50', border: 'border-l-green-400', accent: 'text-green-700' }
        }[block.style] || { bg: 'bg-slate-50', border: 'border-l-slate-400', accent: 'text-slate-700' };
        const cardItemsHtml = block.items.map(item => `
            <div class="p-6 rounded-xl border-l-4 ${cardStyleConfig.bg} ${cardStyleConfig.border} shadow-sm">
                <h4 class="font-semibold mb-3 ${cardStyleConfig.accent}">${item.title}</h4>
                <div class="text-gray-700">${item.content}</div>
            </div>
        `).join('');
        return `<div class="my-6"><div class="grid ${layoutClass} gap-4">${cardItemsHtml}</div></div>`;
      default:
        return `<div>Unsupported content type: ${block.type}</div>`;
    }
  };

  const handleExportHTML = () => {
    showSaveIndicator('🔒 Preparing locked HTML...', 'saving');
    const logoHtml = getLogoHtml('logo');

    const headerHtml = `
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="flex items-center justify-between space-x-6">
        <!-- Logo on the left -->
        ${logoHtml ? `<div class="flex-shrink-0">${logoHtml}</div>` : ''}

        <!-- Title & date in center -->
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-4xl font-bold text-gray-900">
            ${headerData.courseTopic.replace(/Week \\d+/, `Week ${week}`)}
          </h1>
          <p class="text-lg text-gray-600">${displayDate}</p>
        </div>

        <!-- Instructor on the right -->
        <div class="flex-shrink-0 text-right">
          <p class="font-medium text-gray-800">${headerData.instructorName}</p>
          <p class="text-gray-600">${headerData.instructorEmail}</p>
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

  const handleModalSave = (blockData) => {
    const { sectionId, isEditing, ...content } = blockData;

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
      const newBlock = {
        id: generateId(),
        ...content,
        type: modalContentType,
      };
      const targetSectionId = sectionId || 'overview';
      setSections(prevSections =>
        prevSections.map(section =>
          section.id === targetSectionId
            ? { ...section, blocks: [...section.blocks, newBlock] }
            : section
        )
      );
      showSaveIndicator(`💾 ${modalContentType} content added`);
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
      // Map existing cards items to the format expected by the modal
      // Convert HTML content to plain text for easier editing
      const cleanedItems = (blockToEdit.items || []).map(item => ({
        title: item.title || '',
        content: htmlToText(item.content || '')
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
        className={`fixed top-6 z-50 w-12 h-12 bg-slate-700 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-lg transition-all no-print ${isControlPanelOpen ? 'right-[26rem]' : 'right-6'
          }`}
      >
        <Settings size={20} />
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
      />

      <header className="bg-white border-b border-gray-200 shadow-sm print-break-inside-avoid">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between space-x-6">
            {/* 1) Logo on the left */}
            {hasLogo && (
              <div
                className="flex-shrink-0"
                dangerouslySetInnerHTML={{ __html: getLogoHtml('max-h-20') }}
              />
            )}

            {/* 2) Course title & date in the middle */}
            <div className="flex-1">
              <h1
                className="text-4xl font-bold text-gray-900"
                contentEditable
                suppressContentEditableWarning
                onBlur={e => handleHeaderDataChange('courseTopic', e.currentTarget.textContent)}
              >
                {headerData.courseTopic}
              </h1>
              <p className="text-lg text-gray-600">Monday, September 8, 2025</p>
            </div>

            {/* 3) Instructor info on the right */}
            <div className="flex-shrink-0 text-right">
              
               <p className="font-medium text-gray-800">Instructor Email</p>
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
      </header>



      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-6">
          <ul className="flex justify-center gap-1 py-2 flex-wrap">
            {sections.map(section => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(e) => handleNavClick(e, section.id)}
                  className={`px-4 py-2 rounded-t-lg transition-all font-medium text-sm ${activeSectionId === section.id ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

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
      <style jsx>{`
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
      `}</style>
    </div>
  );
};

const App = () => {
  return (
    <LogoProvider>
      <LectureTemplateSystem />
    </LogoProvider>
  );
};

export default App;