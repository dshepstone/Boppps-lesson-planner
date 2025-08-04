// File: src/RichTextEditor.js

import React, { useState, useEffect, useRef } from 'react';
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
import CodeBlock from '@tiptap/extension-code-block';

const RichTextEditor = ({ content, onChange, isHtmlMode, onToggleHtmlMode, isPreviewMode = false }) => {
    const [htmlContent, setHtmlContent] = useState(content || '');
    const [htmlError, setHtmlError] = useState('');
    const textareaRef = useRef(null);

    // In src/RichTextEditor.js

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                table: false,
                codeBlock: false, // <-- Add this line to disable the default CodeBlock
            }),
            TextStyle,
            Underline, // <-- KEEP this for the toolbar button
            Color.configure({ types: ['textStyle'] }),
            FontFamily.configure({ types: ['textStyle'] }),
            Highlight.configure({ multicolor: true }),
            Subscript,
            Superscript,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({ // <-- KEEP this for the toolbar button
                openOnClick: false,
                HTMLAttributes: { class: 'text-blue-600 underline hover:text-blue-800' },
            }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            CodeBlock, // <-- KEEP this (the one you imported separately)
            Placeholder.configure({ placeholder: 'Start typing your content...' }),
        ],
        //... rest of the editor configuration
    });

    useEffect(() => {
        if (editor && content !== undefined && !isHtmlMode && content !== editor.getHTML()) {
            editor.commands.setContent(content || '', false);
            setHtmlContent(content || '');
        }
    }, [content, editor, isHtmlMode]);

    useEffect(() => {
        if (editor && !isHtmlMode) {
            setHtmlContent(editor.getHTML());
        }
    }, [editor, isHtmlMode]);

    const handleHtmlModeToggle = () => {
        if (isHtmlMode && editor) {
            try {
                setHtmlError('');
                editor.commands.setContent(htmlContent, false);
                onChange && onChange(htmlContent);
            } catch (error) {
                setHtmlError('Invalid HTML: ' + error.message);
                return;
            }
        } else if (editor) {
            const currentHtml = editor.getHTML();
            setHtmlContent(currentHtml);
        }
        onToggleHtmlMode && onToggleHtmlMode();
    };

    const handleHtmlChange = (e) => {
        const value = e.target.value;
        setHtmlContent(value);
        setHtmlError('');

        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = value;
            onChange && onChange(value);
        } catch (error) {
            // Invalid HTML - don't call onChange yet
        }
    };

    const formatHtml = () => {
        try {
            const formatted = htmlContent
                .replace(/></g, '>\n<')
                .replace(/^\s+|\s+$/gm, '')
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map((line, index, lines) => {
                    let indentLevel = 0;
                    for (let i = 0; i < index; i++) {
                        const prevLine = lines[i].trim();
                        if (prevLine.match(/<[^\/][^>]*[^\/]>$/)) indentLevel++;
                        if (prevLine.match(/<\/[^>]*>$/)) indentLevel--;
                    }
                    const currentLine = line.trim();
                    if (currentLine.match(/^<\/[^>]*>$/)) indentLevel--;
                    const indent = indentLevel > 0 ? '  '.repeat(indentLevel) : '';
                    return indent + currentLine;
                })
                .join('\n');

            setHtmlContent(formatted);
            onChange && onChange(formatted);
        } catch (error) {
            setHtmlError('Could not format HTML: ' + error.message);
        }
    };

    const insertHtmlTemplate = (template) => {
        const templates = {
            paragraph: '<p>Your text here</p>',
            heading: '<h2>Your heading here</h2>',
            list: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>',
            link: '<a href="https://example.com">Link text</a>',
            image: '<img src="image-url.jpg" alt="Description" />',
            table: '<table>\n  <tr>\n    <th>Header 1</th>\n    <th>Header 2</th>\n  </tr>\n  <tr>\n    <td>Cell 1</td>\n    <td>Cell 2</td>\n  </tr>\n</table>',
            div: '<div class="custom-class">\n  Your content here\n</div>'
        };

        const templateHtml = templates[template] || '';
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = htmlContent.substring(0, start) + templateHtml + htmlContent.substring(end);
            setHtmlContent(newContent);
            onChange && onChange(newContent);

            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + templateHtml.length, start + templateHtml.length);
            }, 0);
        }
    };

    const autoResizeTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        if (isHtmlMode && textareaRef.current) {
            autoResizeTextarea();
        }
    }, [isHtmlMode, htmlContent]);

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL:', previousUrl || 'https://');
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
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
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-700">Content Editor</div>
                    {isHtmlMode && (
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">HTML Mode</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isHtmlMode && (
                        <button
                            type="button"
                            onClick={formatHtml}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            title="Format HTML"
                        >
                            Format
                        </button>
                    )}
                    {onToggleHtmlMode && (
                        <button
                            type="button"
                            onClick={handleHtmlModeToggle}
                            className={`px-3 py-1 text-xs rounded-md transition-all ${isHtmlMode
                                ? 'bg-orange-100 text-orange-700 border border-orange-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                                } hover:bg-opacity-80`}
                        >
                            {isHtmlMode ? '📝 Rich Text' : '💻 HTML'}
                        </button>
                    )}
                </div>
            </div>

            {isHtmlMode ? (
                <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
                        <span className="text-xs text-gray-600 font-medium">Quick Insert:</span>
                        {['paragraph', 'heading', 'list', 'link', 'table', 'div'].map(template => (
                            <button
                                key={template}
                                type="button"
                                onClick={() => insertHtmlTemplate(template)}
                                className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 capitalize"
                            >
                                {template}
                            </button>
                        ))}
                    </div>

                    {htmlError && (
                        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm">
                            <strong>HTML Error:</strong> {htmlError}
                        </div>
                    )}

                    <div className="flex-1">
                        <textarea
                            ref={textareaRef}
                            value={htmlContent}
                            onChange={handleHtmlChange}
                            className="w-full min-h-96 p-4 font-mono text-sm border-none outline-none resize-none bg-gray-50"
                            style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
                            placeholder="Enter your HTML code here..."
                            onInput={autoResizeTextarea}
                        />
                    </div>

                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
                        💡 Tip: Use the Quick Insert buttons above to add common HTML elements.
                    </div>
                </div>
            ) : (
                <>
                    {!isPreviewMode && (
                        <div className="flex flex-wrap items-center gap-1 px-4 py-2 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    className={`p-2 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('bold') ? 'bg-blue-100 border-blue-300' : 'border-gray-200'}`}
                                >
                                    <strong>B</strong>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    className={`p-2 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('italic') ? 'bg-blue-100 border-blue-300' : 'border-gray-200'}`}
                                >
                                    <em>I</em>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                    className={`p-2 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('underline') ? 'bg-blue-100 border-blue-300' : 'border-gray-200'}`}
                                >
                                    <u>U</u>
                                </button>
                            </div>

                            <div className="w-px h-6 bg-gray-200 mx-1"></div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().setParagraph().run()}
                                    className={`px-2 py-1 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('paragraph') ? 'bg-blue-100 border-blue-300' : 'border-gray-200'}`}
                                >
                                    P
                                </button>
                                {[1, 2, 3, 4].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => editor.chain().focus().toggleHeading({ level: level }).run()}
                                        className={`px-2 py-1 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('heading', { level: level }) ? 'bg-blue-100 border-blue-300' : 'border-gray-200'}`}
                                    >
                                        H{level}
                                    </button>
                                ))}
                            </div>

                            <div className="w-px h-6 bg-gray-200 mx-1"></div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                    className={`p-2 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('bulletList') ? 'bg-blue-100 border-blue-300' : 'border-gray-200'}`}
                                    title="Bullet List"
                                >
                                    ●
                                </button>
                                <button
                                    type="button"
                                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                    className={`p-2 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('orderedList') ? 'bg-blue-100 border-blue-300' : 'border-gray-200'}`}
                                    title="Numbered List"
                                >
                                    1.
                                </button>
                                <button
                                    type="button"
                                    onClick={setLink}
                                    className={`p-2 text-xs border rounded hover:bg-gray-50 transition-colors ${editor.isActive('link') ? 'bg-blue-100 border-blue-300' : 'border-gray-200'}`}
                                    title="Add Link"
                                >
                                    🔗
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 p-4 rich-editor-content">
                        <EditorContent editor={editor} />
                    </div>
                </>
            )}
        </div>
    );
};

export default RichTextEditor;