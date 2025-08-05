import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Placeholder from '@tiptap/extension-placeholder';

const HeadlineEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      Document.extend({ content: 'heading' }),
      Text,
      Heading.configure({ levels: [1, 2] }),
      Placeholder.configure({ placeholder: 'Add headline...' }),
    ],
    content: content || '<h1></h1>',
    onUpdate: ({ editor }) => {
      onChange && onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '<h1></h1>', false);
    }
  }, [editor, content]);

  return <EditorContent editor={editor} className="rich-editor-content" />;
};

export default HeadlineEditor;
