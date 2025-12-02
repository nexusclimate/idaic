import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import React from 'react';
import { PAGE_MAP, getAvailablePages } from '../utils/pageMentions';
import { getProtectedUrl } from '../utils/protectedUrls';

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
    <div 
      className="mention-suggestions bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto min-w-[200px] z-50"
      style={{ 
        position: 'relative',
        display: 'block',
        visibility: 'visible'
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`px-3 py-2 cursor-pointer ${
            index === selectedIndex ? 'bg-gray-100' : ''
          } hover:bg-gray-100`}
          onClick={() => selectItem(index)}
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent losing focus
            selectItem(index);
          }}
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
            
            // Get text from a reasonable range before cursor (up to 100 chars back for better detection)
            const startLookback = Math.max(0, cursorPos - 100);
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
            
            // Debug logging
            if (items.length > 0) {
              console.log('PageMention apply: found @, items:', items.length, 'query:', query);
            }
            
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
                  const protectedUrl = getProtectedUrl(route);
                  view.dispatch(
                    view.state.tr
                      .delete(range.from, range.to)
                      .insertText(`@${label} `, range.from)
                      .addMark(
                        range.from,
                        range.from + label.length + 1,
                        linkMark.create({
                          href: protectedUrl,
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
          let isRaf = false;
          
          // Capture pluginKey in closure
          const key = pluginKey;

          const update = (view, prevState) => {
            // Clear any pending updates
            if (updateTimeout) {
              if (isRaf) {
                cancelAnimationFrame(updateTimeout);
              } else {
                clearTimeout(updateTimeout);
              }
              updateTimeout = null;
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
            
            // Use requestAnimationFrame for better performance, but also allow immediate execution
            const executeUpdate = () => {
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
                
                // Debug logging (can be removed later)
                if (pluginState.active) {
                  console.log('PageMention active:', pluginState.items.length, 'items');
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
                console.log('Creating new container for dropdown');
                container = document.createElement('div');
                container.id = 'page-mention-dropdown';
                container.style.position = 'fixed';
                container.style.zIndex = '99999';
                container.style.display = 'block';
                container.style.visibility = 'visible';
                container.style.opacity = '1';
                container.style.pointerEvents = 'auto';
                container.style.width = 'auto';
                container.style.height = 'auto';
                container.style.maxWidth = 'none';
                container.style.maxHeight = 'none';
                container.style.overflow = 'visible';
                document.body.appendChild(container);
                console.log('Container created and appended to body:', container);
                console.log('Container parent:', container.parentNode);
              } else {
                console.log('Using existing container');
                // Ensure container is still in the DOM
                if (!document.body.contains(container)) {
                  console.warn('Container was removed from DOM, re-adding');
                  document.body.appendChild(container);
                }
              }

              const command = (item) => {
                const { range } = pluginState;
                const { label, route } = item;
                
                const linkMark = view.state.schema.marks.link;
                if (linkMark) {
                  const protectedUrl = getProtectedUrl(route);
                  view.dispatch(
                    view.state.tr
                      .delete(range.from, range.to)
                      .insertText(`@${label} `, range.from)
                      .addMark(
                        range.from,
                        range.from + label.length + 1,
                        linkMark.create({
                          href: protectedUrl,
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
                try {
                  console.log('Creating new ReactRenderer with', pluginState.items.length, 'items');
                  
                  // Try ReactRenderer first
                  try {
                    component = new ReactRenderer(MentionList, {
                      props: {
                        items: pluginState.items,
                        selectedIndex: pluginState.selectedIndex,
                        command,
                      },
                      editor: view,
                    });
                    
                    if (!component || !component.element) {
                      console.error('ReactRenderer failed to create component or element');
                      throw new Error('ReactRenderer failed');
                    }
                    
                    console.log('ReactRenderer created, element:', component.element);
                    
                    // Verify element exists before appending
                    if (component.element && container) {
                      container.appendChild(component.element);
                      console.log('Component appended to container');
                      
                      // Verify it's actually in the DOM
                      setTimeout(() => {
                        const inDOM = document.body.contains(container);
                        const hasChildren = container.children.length > 0;
                        console.log('Container in DOM:', inDOM, 'Has children:', hasChildren);
                        if (hasChildren) {
                          console.log('Container children count:', container.children.length);
                          console.log('First child:', container.firstChild);
                        }
                        const computed = window.getComputedStyle(container);
                        console.log('Container computed styles:', {
                          display: computed.display,
                          visibility: computed.visibility,
                          opacity: computed.opacity,
                          zIndex: computed.zIndex,
                          position: computed.position
                        });
                        if (container.firstChild) {
                          const childComputed = window.getComputedStyle(container.firstChild);
                          console.log('First child computed styles:', {
                            display: childComputed.display,
                            visibility: childComputed.visibility,
                            opacity: childComputed.opacity
                          });
                        }
                      }, 100);
                    } else {
                      console.error('Cannot append: component.element =', component.element, 'container =', container);
                    }
                  } catch (renderErr) {
                    console.error('ReactRenderer failed, creating fallback HTML:', renderErr);
                    // Fallback: create simple HTML dropdown
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'mention-suggestions bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto min-w-[200px]';
                    fallbackDiv.style.cssText = 'position: relative; display: block; visibility: visible;';
                    
                    pluginState.items.forEach((item, index) => {
                      const itemDiv = document.createElement('div');
                      itemDiv.className = `px-3 py-2 cursor-pointer ${index === pluginState.selectedIndex ? 'bg-gray-100' : ''} hover:bg-gray-100`;
                      itemDiv.textContent = `@${item.label}`;
                      itemDiv.onclick = () => command(item);
                      itemDiv.onmousedown = (e) => e.preventDefault();
                      fallbackDiv.appendChild(itemDiv);
                    });
                    
                    container.appendChild(fallbackDiv);
                    component = { element: fallbackDiv, isFallback: true };
                    console.log('Fallback HTML dropdown created');
                  }
                } catch (err) {
                  console.error('Error creating component:', err);
                  return;
                }
              } else {
                try {
                  if (component.isFallback) {
                    // Update fallback HTML
                    container.innerHTML = '';
                    pluginState.items.forEach((item, index) => {
                      const itemDiv = document.createElement('div');
                      itemDiv.className = `px-3 py-2 cursor-pointer ${index === pluginState.selectedIndex ? 'bg-gray-100' : ''} hover:bg-gray-100`;
                      itemDiv.textContent = `@${item.label}`;
                      itemDiv.onclick = () => command(item);
                      itemDiv.onmousedown = (e) => e.preventDefault();
                      container.appendChild(itemDiv);
                    });
                  } else {
                    console.log('Updating existing component with', pluginState.items.length, 'items');
                    component.updateProps({
                      items: pluginState.items,
                      selectedIndex: pluginState.selectedIndex,
                      command,
                    });
                  }
                } catch (updateErr) {
                  console.error('Error updating component props:', updateErr);
                }
              }

              // Position the dropdown
              const { from } = pluginState.range;
              try {
                const coords = view.coordsAtPos(from);
                if (coords) {
                  const top = coords.bottom + window.scrollY + 5;
                  const left = coords.left + window.scrollX;
                  
                  container.style.top = `${top}px`;
                  container.style.left = `${left}px`;
                  container.style.display = 'block';
                  container.style.visibility = 'visible';
                  container.style.opacity = '1';
                  container.style.pointerEvents = 'auto';
                  
                  console.log('Dropdown positioned at:', top, left);
                  console.log('Container styles:', {
                    top: container.style.top,
                    left: container.style.left,
                    display: container.style.display,
                    visibility: container.style.visibility,
                    opacity: container.style.opacity,
                    zIndex: container.style.zIndex,
                    position: container.style.position
                  });
                  
                  // Force a reflow to ensure styles are applied
                  void container.offsetHeight;
                  
                  // Double-check visibility after a moment
                  setTimeout(() => {
                    const rect = container.getBoundingClientRect();
                    const computed = window.getComputedStyle(container);
                    console.log('Container bounding rect:', rect);
                    console.log('Container computed display:', computed.display);
                    console.log('Container computed visibility:', computed.visibility);
                    console.log('Container computed opacity:', computed.opacity);
                    console.log('Container computed z-index:', computed.zIndex);
                    
                    if (rect.width === 0 || rect.height === 0) {
                      console.warn('Container has zero dimensions!');
                    }
                    if (computed.display === 'none' || computed.visibility === 'hidden' || computed.opacity === '0') {
                      console.warn('Container is hidden by computed styles!');
                    }
                  }, 50);
                } else {
                  console.warn('No coordinates returned from coordsAtPos');
                }
              } catch (posErr) {
                console.error('Error positioning dropdown:', posErr);
              }
              } catch (error) {
                console.error('Error in PageMention update:', error);
                // Silently fail to prevent breaking the editor
              }
            };
            
            // Use requestAnimationFrame for smoother updates, but with immediate fallback
            if (typeof requestAnimationFrame !== 'undefined') {
              updateTimeout = requestAnimationFrame(executeUpdate);
              isRaf = true;
            } else {
              updateTimeout = setTimeout(executeUpdate, 0);
              isRaf = false;
            }
          };

          // Don't call update initially - let ProseMirror call it when needed
          // The update function will be called by ProseMirror automatically

          return {
            update,
            destroy() {
              if (updateTimeout) {
                if (isRaf) {
                  cancelAnimationFrame(updateTimeout);
                } else {
                  clearTimeout(updateTimeout);
                }
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
