import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import React from 'react';
import { PAGE_MAP, getAvailablePages } from '../utils/pageMentions';

// Suggestion list component
const MentionList = React.forwardRef((props, ref) => {
  const { items, command, selectedIndex } = props;

  React.useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        return true;
      }
      if (event.key === 'ArrowDown') {
        return true;
      }
      if (event.key === 'Enter') {
        return true;
      }
      if (event.key === 'Escape') {
        return true;
      }
      return false;
    },
  }));

  const selectItem = (index) => {
    const item = items[index];
    if (item) {
      command(item);
    }
  };

  if (!items.length) {
    return null;
  }

  return (
    <div className="mention-suggestions bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto min-w-[200px] z-50">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`px-3 py-2 cursor-pointer ${
            index === selectedIndex ? 'bg-gray-100' : ''
          } hover:bg-gray-100`}
          onClick={() => selectItem(index)}
        >
          <span className="font-medium text-gray-900">@{item.label}</span>
        </div>
      ))}
    </div>
  );
});

MentionList.displayName = 'MentionList';

export const PageMention = Extension.create({
  name: 'pageMention',

  addOptions() {
    return {
      HTMLAttributes: {},
      char: '@',
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    const pluginKey = new PluginKey('pageMention');
    
    const plugin = new Plugin({
        key: pluginKey,
        state: {
          init() {
            return {
              active: false,
              range: null,
              query: null,
              items: [],
              selectedIndex: 0,
            };
          },
          apply(tr, value, oldState, newState) {
            // Check if meta was set to close suggestions
            const meta = tr.getMeta(pluginKey);
            if (meta && meta.active === false) {
              return { active: false, range: null, query: null, items: [], selectedIndex: 0 };
            }
            
            // If meta was set with new selectedIndex, use it
            if (meta && meta.selectedIndex !== undefined && value) {
              return { ...value, selectedIndex: meta.selectedIndex };
            }
            const { selection } = newState;
            const { $from } = selection;
            const cursorPos = $from.pos;
            
            // Get text from a reasonable range before cursor (up to 50 chars back)
            const startLookback = Math.max(0, cursorPos - 50);
            const textBefore = newState.doc.textBetween(startLookback, cursorPos, ' ', '');
            
            // Find the last @ symbol in the text before cursor
            const lastAt = textBefore.lastIndexOf('@');
            
            if (lastAt === -1) {
              return { active: false, range: null, query: null, items: [], selectedIndex: 0 };
            }
            
            // Calculate the actual position of @ in the document
            const atPos = startLookback + lastAt;
            
            // Get text after @ up to cursor
            const textAfter = newState.doc.textBetween(atPos + 1, cursorPos, ' ', '');
            
            // Check if there's a space or newline (which would end the mention)
            const spaceIndex = textAfter.search(/[\s\n]/);
            const query = spaceIndex === -1 ? textAfter : textAfter.substring(0, spaceIndex);
            
            // If query contains invalid chars, don't show suggestions
            if (query.match(/[\s\n]/)) {
              return { active: false, range: null, query: null, items: [], selectedIndex: 0 };
            }
            
            // Get matching pages (show all if query is empty, filtered if query exists)
            const pages = getAvailablePages();
            const items = (query.length === 0 
              ? pages 
              : pages.filter(page => page.toLowerCase().includes(query.toLowerCase()))
            )
              .slice(0, 10)
              .map(page => ({
                id: page,
                label: page,
                route: PAGE_MAP[page] || null,
              }));
            
            return {
              active: items.length > 0,
              range: { from: atPos, to: cursorPos },
              query,
              items,
              selectedIndex: 0,
            };
          },
        },
        props: {
          handleKeyDown(view, event) {
            const pluginState = pluginKey.getState(view.state);
            if (!pluginState.active) return false;

            if (event.key === 'ArrowDown') {
              event.preventDefault();
              const newIndex = (pluginState.selectedIndex + 1) % pluginState.items.length;
              const tr = view.state.tr.setMeta(pluginKey, {
                ...pluginState,
                selectedIndex: newIndex,
              });
              view.dispatch(tr);
              return true;
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault();
              const newIndex = (pluginState.selectedIndex + pluginState.items.length - 1) % pluginState.items.length;
              const tr = view.state.tr.setMeta(pluginKey, {
                ...pluginState,
                selectedIndex: newIndex,
              });
              view.dispatch(tr);
              return true;
            }

            if (event.key === 'Enter') {
              event.preventDefault();
              const item = pluginState.items[pluginState.selectedIndex];
              if (item) {
                const { range } = pluginState;
                const { label, route } = item;
                
                // Insert mention as link using HTML
                const linkMark = view.state.schema.marks.link;
                if (linkMark) {
                  view.dispatch(
                    view.state.tr
                      .delete(range.from, range.to)
                      .insertText(`@${label} `, range.from)
                      .addMark(
                        range.from,
                        range.from + label.length + 1,
                        linkMark.create({
                          href: `#${route}`,
                          'data-route': route,
                          'data-mention': 'true',
                        })
                      )
                  );
                } else {
                  // Fallback: insert as text with data attributes
                  view.dispatch(
                    view.state.tr
                      .delete(range.from, range.to)
                      .insertText(`@${label} `, range.from)
                  );
                }
                
                // Close suggestions - the transaction will trigger apply which will close it
                // No need to manually set meta
              }
              return true;
            }

            if (event.key === 'Escape') {
              event.preventDefault();
              const tr = view.state.tr.setMeta(pluginKey, {
                active: false,
                range: null,
                query: null,
                items: [],
                selectedIndex: 0,
              });
              view.dispatch(tr);
              return true;
            }

            return false;
          },
        },
        view(editorView) {
          let component = null;
          let container = null;
          let updateTimeout = null;
          
          // Capture pluginKey in closure
          const key = pluginKey;

          const update = (view, prevState) => {
            // Clear any pending updates
            if (updateTimeout) {
              clearTimeout(updateTimeout);
            }
            
            // Ensure we have a valid view and state
            // The first parameter should be the EditorView, not the plugin
            if (!view || typeof view !== 'object' || !view.state) {
              return;
            }
            
            // Ensure pluginKey is available and has getState method
            if (!key || typeof key.getState !== 'function') {
              return;
            }
            
            updateTimeout = setTimeout(() => {
              try {
                // Ensure view and state are still valid
                if (!view || !view.state) {
                  return;
                }
                
                // Ensure key still has getState method
                if (!key || typeof key.getState !== 'function') {
                  return;
                }
                
                // Use the plugin key to get state from the view's state
                const pluginState = key.getState(view.state);
                
                // Safety check
                if (!pluginState) {
                  return;
                }
              
              if (!pluginState.active) {
                if (component) {
                  try {
                    // Remove element from DOM first
                    if (component.element && component.element.parentNode) {
                      component.element.parentNode.removeChild(component.element);
                    }
                    // Then try to destroy the component if it has a destroy method
                    if (typeof component.destroy === 'function') {
                      component.destroy();
                    } else if (ReactRenderer && typeof ReactRenderer.destroy === 'function' && component.element) {
                      // Only call ReactRenderer.destroy if component looks like a ReactRenderer instance
                      try {
                        ReactRenderer.destroy(component);
                      } catch (destroyErr) {
                        // If destroy fails, we've already removed the element, so it's okay
                      }
                    }
                  } catch (err) {
                    // Ignore destroy errors - component might already be destroyed
                    // The element removal is the most important part
                  } finally {
                    component = null;
                  }
                }
                if (container) {
                  try {
                    if (container.parentNode) {
                      container.remove();
                    }
                  } catch (err) {
                    // Ignore remove errors
                  }
                  container = null;
                }
                return;
              }

              if (!container) {
                container = document.createElement('div');
                container.style.position = 'fixed';
                container.style.zIndex = '9999';
                document.body.appendChild(container);
              }

              const command = (item) => {
                const { range } = pluginState;
                const { label, route } = item;
                
                const linkMark = view.state.schema.marks.link;
                if (linkMark) {
                  view.dispatch(
                    view.state.tr
                      .delete(range.from, range.to)
                      .insertText(`@${label} `, range.from)
                      .addMark(
                        range.from,
                        range.from + label.length + 1,
                        linkMark.create({
                          href: `#${route}`,
                          'data-route': route,
                          'data-mention': 'true',
                        })
                      )
                  );
                } else {
                  // Fallback: insert as text
                  view.dispatch(
                    view.state.tr
                      .delete(range.from, range.to)
                      .insertText(`@${label} `, range.from)
                  );
                }
                
                // Close suggestions - state will be updated by the apply function
                // No need to manually set meta here as the transaction will trigger apply
              };

              if (!component) {
                component = new ReactRenderer(MentionList, {
                  props: {
                    items: pluginState.items,
                    selectedIndex: pluginState.selectedIndex,
                    command,
                  },
                  editor: view,
                });
                container.appendChild(component.element);
              } else {
                component.updateProps({
                  items: pluginState.items,
                  selectedIndex: pluginState.selectedIndex,
                  command,
                });
              }

                // Position the dropdown
                const { from } = pluginState.range;
                const coords = view.coordsAtPos(from);
                container.style.top = `${coords.bottom + window.scrollY + 5}px`;
                container.style.left = `${coords.left + window.scrollX}px`;
              } catch (error) {
                console.error('Error in PageMention update:', error);
                // Silently fail to prevent breaking the editor
              }
            }, 0);
          };

          // Don't call update initially - let ProseMirror call it when needed
          // The update function will be called by ProseMirror automatically

          return {
            update,
            destroy() {
              if (updateTimeout) {
                clearTimeout(updateTimeout);
              }
              if (component) {
                try {
                  // Remove element from DOM first
                  if (component.element && component.element.parentNode) {
                    component.element.parentNode.removeChild(component.element);
                  }
                  // Then try to destroy the component if it has a destroy method
                  if (typeof component.destroy === 'function') {
                    component.destroy();
                  } else if (ReactRenderer && typeof ReactRenderer.destroy === 'function' && component.element) {
                    // Only call ReactRenderer.destroy if component looks like a ReactRenderer instance
                    try {
                      ReactRenderer.destroy(component);
                    } catch (destroyErr) {
                      // If destroy fails, we've already removed the element, so it's okay
                    }
                  }
                } catch (err) {
                  // Ignore destroy errors - component might already be destroyed
                  // The element removal is the most important part
                } finally {
                  component = null;
                }
              }
              if (container) {
                try {
                  if (container.parentNode) {
                    container.remove();
                  }
                } catch (err) {
                  // Ignore remove errors
                }
                container = null;
              }
            },
          };
        },
      });
    
    return [plugin];
  },
});
