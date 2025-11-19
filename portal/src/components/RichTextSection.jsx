import React, { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { PageMention } from '../extensions/PageMention';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';
import { getAvailablePages, PAGE_MAP } from '../utils/pageMentions';

export default function RichTextSection({ section, isAdmin = false }) {
  const { user } = useUser();
  const { getAuthToken } = useAuth();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPageMentionDropdown, setShowPageMentionDropdown] = useState(false);
  const mentionDropdownRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2]
        },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'page-mention-link',
          },
        },
      }),
      Underline,
      PageMention,
    ],
    editable: true,
    content: content?.content || '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[100px] text-gray-900',
        style: `
          & h1 { font-size: 2.5em; margin-bottom: 0.5em; }
          & h2 { font-size: 1.75em; margin-bottom: 0.5em; }
          & p { font-size: 1.1em; margin-bottom: 0.5em; }
          & a[data-mention="true"] { color: #ea580c; font-weight: 500; cursor: pointer; text-decoration: underline; }
        `
      },
      handleClick: (view, pos, event) => {
        const target = event.target;
        if (target.tagName === 'A' && target.getAttribute('data-mention') === 'true') {
          event.preventDefault();
          const route = target.getAttribute('data-route') || target.getAttribute('href')?.replace('#', '');
          if (route) {
            // Dispatch navigation event
            const navEvent = new CustomEvent('pageMentionClick', { 
              detail: { route } 
            });
            window.dispatchEvent(navEvent);
          }
          return true;
        }
        return false;
      },
    },
  });

  // Listen for navigation events
  useEffect(() => {
    const handleNavigation = (event) => {
      const route = event.detail?.route;
      if (route) {
        // Update current page in localStorage and trigger navigation
        localStorage.setItem('idaic-current-page', route);
        // Trigger a custom event that App.jsx can listen to
        window.dispatchEvent(new CustomEvent('navigateToPage', { detail: { page: route } }));
      }
    };

    window.addEventListener('pageMentionClick', handleNavigation);
    return () => {
      window.removeEventListener('pageMentionClick', handleNavigation);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mentionDropdownRef.current && !mentionDropdownRef.current.contains(event.target)) {
        setShowPageMentionDropdown(false);
      }
    };

    if (showPageMentionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPageMentionDropdown]);

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

  // Handle content save with debounce
  const handleSave = async (newContent) => {
    if (!newContent || newContent === '<p></p>') return; // Don't save empty content

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
      // Update local state directly instead of refetching
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
      <div className="flex items-center justify-end mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mr-auto">
          {section === 'home_content' ? 'Latest Updates' : 'Chapter Information'}
        </h2>
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
          {isEditing ? 'Save Content' : 'Edit Content'}
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
          {/* Selection Toolbar */}
          {isEditing && (
            <div 
              className="fixed z-50 bg-white shadow-lg rounded-lg border border-gray-300 p-1.5 flex gap-1.5 invisible opacity-0 transition-opacity formatting-toolbar"
              style={{
                visibility: editor?.view?.state?.selection?.empty === false ? 'visible' : 'hidden',
                opacity: editor?.view?.state?.selection?.empty === false ? 1 : 0,
                top: typeof window !== 'undefined' ? 
                  Math.max(
                    10,
                    (window.getSelection()?.getRangeAt(0)?.getBoundingClientRect()?.top || 0) - 50
                  ) + 'px' : '0',
                left: typeof window !== 'undefined' ? 
                  Math.max(
                    10,
                    (window.getSelection()?.getRangeAt(0)?.getBoundingClientRect()?.left || 0)
                  ) + 'px' : '0',
              }}
            >
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-2 py-1 rounded text-sm font-bold transition-colors ${
                  editor?.isActive('heading', { level: 1 })
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{ fontSize: '1.2em' }}
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1 rounded text-sm font-semibold transition-colors ${
                  editor?.isActive('heading', { level: 2 })
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{ fontSize: '1.1em' }}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().setParagraph().run()}
                className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                  editor?.isActive('paragraph')
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Normal
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
              <div className="w-px h-6 my-auto bg-gray-200" />
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPageMentionDropdown(!showPageMentionDropdown);
                  }}
                  className="px-2 py-1 rounded text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100"
                  title="Insert page mention"
                >
                  @
                </button>
                {showPageMentionDropdown && (
                  <div
                    ref={mentionDropdownRef}
                    className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto min-w-[200px] z-50"
                    style={{ maxHeight: '200px' }}
                  >
                    {getAvailablePages().map((page) => (
                      <div
                        key={page}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const route = PAGE_MAP[page];
                          if (editor && route) {
                            // Insert the mention as a link using ProseMirror transaction (like PageMention extension)
                            const { state, view } = editor;
                            const { from, to } = state.selection;
                            const text = `@${page} `;
                            const linkMark = state.schema.marks.link;
                            
                            if (linkMark) {
                              const tr = state.tr
                                .delete(from, to)
                                .insertText(text, from)
                                .addMark(
                                  from,
                                  from + text.length - 1, // -1 to exclude the trailing space
                                  linkMark.create({
                                    href: `#${route}`,
                                  })
                                );
                              
                              view.dispatch(tr);
                              
                              // Add data attributes to the DOM element
                              setTimeout(() => {
                                const domNode = view.domAtPos(from);
                                if (domNode && domNode.node) {
                                  let linkElement = null;
                                  if (domNode.node.nodeType === Node.TEXT_NODE && domNode.node.parentElement) {
                                    linkElement = domNode.node.parentElement.closest('a');
                                  } else if (domNode.node.nodeType === Node.ELEMENT_NODE) {
                                    linkElement = domNode.node.closest('a');
                                  }
                                  
                                  if (linkElement) {
                                    linkElement.setAttribute('data-route', route);
                                    linkElement.setAttribute('data-mention', 'true');
                                  }
                                }
                              }, 10);
                            } else {
                              // Fallback if link mark doesn't exist
                              editor.chain()
                                .focus()
                                .deleteRange({ from, to })
                                .insertContent(text)
                                .run();
                            }
                            
                            setShowPageMentionDropdown(false);
                          }
                        }}
                      >
                        <span className="font-medium text-gray-900">@{page}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Editor */}
          <div 
            className={`transition-colors ${
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
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-500">Click to add content</p>
              </div>
            )}
            <div className="prose max-w-none">
              <EditorContent 
                editor={editor} 
                className="min-h-[100px] [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_p]:text-base [&_p]:mb-2" 
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
