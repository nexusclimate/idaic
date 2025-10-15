import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Dialog, DialogTitle, DialogBody, DialogActions } from './dialog';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

export default function RichTextSection({ section, isAdmin = false }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: editContent,
    onUpdate: ({ editor }) => {
      setEditContent(editor.getHTML());
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

  // Handle content save
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/.netlify/functions/contentSections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: section,
          content: editContent,
          content_type: 'rich_text'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save content');
      }

      await fetchContent();
      setShowEditDialog(false);
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
        {isAdmin && (
          <Button
            color="blue"
            outline
            onClick={() => {
              setEditContent(content?.content || '');
              setShowEditDialog(true);
            }}
          >
            Edit Content
          </Button>
        )}
      </div>

      {error ? (
        <div className="text-red-500 text-center">
          Error: {error}
        </div>
      ) : content ? (
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No content available</p>
          {isAdmin && (
            <Button
              color="blue"
              onClick={() => {
                setEditContent('');
                setShowEditDialog(true);
              }}
              className="mt-4"
            >
              Add Content
            </Button>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={showEditDialog} 
        onClose={() => setShowEditDialog(false)}
        size="xl"
      >
        <DialogTitle>
          {content ? 'Edit Content' : 'Add Content'}
        </DialogTitle>
        <DialogBody>
          <div className="border rounded-lg p-4 mb-12">
            <div className="mb-4 flex gap-2">
              <Button
                color="gray"
                outline
                size="sm"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor?.isActive('heading', { level: 1 }) ? 'bg-gray-100' : ''}
              >
                H1
              </Button>
              <Button
                color="gray"
                outline
                size="sm"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor?.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''}
              >
                H2
              </Button>
              <Button
                color="gray"
                outline
                size="sm"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={editor?.isActive('bold') ? 'bg-gray-100' : ''}
              >
                Bold
              </Button>
              <Button
                color="gray"
                outline
                size="sm"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={editor?.isActive('italic') ? 'bg-gray-100' : ''}
              >
                Italic
              </Button>
              <Button
                color="gray"
                outline
                size="sm"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={editor?.isActive('underline') ? 'bg-gray-100' : ''}
              >
                Underline
              </Button>
              <Button
                color="gray"
                outline
                size="sm"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={editor?.isActive('bulletList') ? 'bg-gray-100' : ''}
              >
                Bullet List
              </Button>
            </div>
            <EditorContent editor={editor} className="min-h-[200px] prose max-w-none" />
          </div>
        </DialogBody>
        <DialogActions>
          <Button
            color="gray"
            outline
            onClick={() => setShowEditDialog(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
