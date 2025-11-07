import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';

export default function EditableRecentActivity({ section, isAdminAuthenticated = false }) {
  const isAdmin = isAdminAuthenticated;
  const { user } = useUser();
  const { getAuthToken } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside space-y-1 ml-4',
          },
        },
      }),
    ],
    editable: true,
    content: content?.content || '<ul><li>Activity item 1</li><li>Activity item 2</li><li>Activity item 3</li></ul>',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[100px] text-gray-900',
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
      // If no content exists, set default with 3 bullet points
      setContent({ content: '<ul><li>Activity item 1</li><li>Activity item 2</li><li>Activity item 3</li></ul>' });
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [section]);

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content.content || '<ul><li>Activity item 1</li><li>Activity item 2</li><li>Activity item 3</li></ul>');
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
    if (!newContent || newContent === '<p></p>') return;

    try {
      setSaving(true);
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No active session found. Please log in.');
      }
      const response = await fetch('/.netlify/functions/contentSections', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          section: section,
          content: newContent,
          content_type: 'rich_text',
          user_id: user?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save content');
      }

      const savedContent = await response.json();
      setContent(savedContent);
      setError(null);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-end mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mr-auto">Recent Activity</h3>
        {isAdmin && (
          <Button
            color="blue"
            outline
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
                handleSave(editor?.getHTML());
              } else {
                setIsEditing(true);
                setTimeout(() => editor?.commands.focus(), 100);
              }
            }}
          >
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        )}
      </div>

      {error ? (
        <div className="text-red-500 text-center text-sm">
          Error: {error}
        </div>
      ) : (
        <div 
          className="relative group"
          onDoubleClick={() => !isEditing && setIsEditing(true)}
        >
          {/* Toolbar */}
          {isEditing && (
            <div className="mb-2 flex gap-2 p-2 bg-gray-50 rounded border border-gray-200">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  editor?.isActive('bulletList')
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="Bullet List"
              >
                •
              </button>
            </div>
          )}
          
          {/* Editor */}
          <div 
            className={`transition-colors ${
              isEditing 
                ? 'min-h-[150px] border border-gray-300 rounded-lg p-4 bg-gray-50 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500' 
                : content ? '' : 'text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'
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
            onBlur={(e) => {
              // Don't trigger blur when clicking formatting buttons
              if (e.relatedTarget?.closest('.formatting-toolbar')) {
                return;
              }
              // Don't save if clicking inside the editor
              if (e.relatedTarget?.closest('.ProseMirror')) {
                return;
              }
              if (isEditing) {
                setIsEditing(false);
                handleSave(editor?.getHTML());
              }
            }}
          >
            {!content && !isEditing && (
              <div className="text-gray-400">
                <p className="text-sm text-gray-500">Click to add content</p>
              </div>
            )}
            <div className="prose max-w-none">
              <EditorContent 
                editor={editor} 
                className="min-h-[100px] [&_ul]:list-disc [&_ul]:list-outside [&_ul]:ml-4 [&_ul]:space-y-1 [&_li]:text-base [&_li]:pl-0" 
              />
            </div>
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

