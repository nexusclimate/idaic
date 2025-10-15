import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

export default function RichTextSection({ section, isAdmin = false }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2]
        }
      }),
      Underline,
    ],
    editable: true,
    content: content?.content || '',
    onUpdate: ({ editor }) => {
      // Debounce save to avoid too many requests
      const timeoutId = setTimeout(() => {
        handleSave(editor.getHTML());
      }, 1000);
      return () => clearTimeout(timeoutId);
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[100px] text-gray-900',
        style: 'color: #111827;', // Ensure text is always dark
      },
    },
  });

  // Fetch current content
  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/.netlify/functions/contentSections?section=${section}`);
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      setContent(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [section]);

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content.content);
    }
  }, [editor, content]);

  // Update editor editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [editor, isEditing]);

  // Handle content save
  const handleSave = async (newContent) => {
    try {
      setSaving(true);
      const response = await fetch('/.netlify/functions/contentSections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: section,
          content: newContent,
          content_type: 'rich_text'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save content');
      }

      await fetchContent();
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Chapter Information</h2>
        <Button
          color="blue"
          outline
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Done Editing' : 'Edit Content'}
        </Button>
      </div>

      {error ? (
        <div className="text-red-500 text-center">
          Error: {error}
        </div>
      ) : (
        <div 
          className="relative group"
          onDoubleClick={() => !isEditing && setIsEditing(true)}
        >
          {/* Floating Toolbar */}
          {isEditing && (
            <div className="sticky top-0 z-10 -mt-2 mb-2 flex justify-center">
              <div className="bg-white shadow-lg rounded-lg border border-gray-300 p-1.5 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                    editor?.isActive('heading', { level: 1 })
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                    editor?.isActive('heading', { level: 2 })
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  H2
                </button>
                <div className="w-px h-6 my-auto bg-gray-200" />
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                    editor?.isActive('bold')
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`px-2 py-1 rounded text-sm font-medium italic transition-colors ${
                    editor?.isActive('italic')
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  className={`px-2 py-1 rounded text-sm font-medium underline transition-colors ${
                    editor?.isActive('underline')
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  U
                </button>
                <div className="w-px h-6 my-auto bg-gray-200" />
                <button
                  type="button"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                    editor?.isActive('bulletList')
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  •
                </button>
              </div>
            </div>
          )}
          
          {/* Editor */}
          <div 
            className={`prose max-w-none transition-colors ${
              isEditing 
                ? 'min-h-[200px] border border-gray-300 rounded-lg p-4 bg-gray-50 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500' 
                : content ? '' : 'text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'
            }`}
            onClick={() => {
              if (!isEditing) {
                setIsEditing(true);
                // Give time for editor to become editable
                setTimeout(() => {
                  editor?.commands.focus();
                }, 100);
              }
            }}
          >
            {!content && !isEditing && (
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-500">Click to add content</p>
              </div>
            )}
            <EditorContent editor={editor} className="min-h-[100px]" />
          </div>

          {saving && (
            <div className="absolute top-2 right-2 text-sm text-blue-500">
              Saving...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
