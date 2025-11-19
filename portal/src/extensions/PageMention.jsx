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
    
    return [
      new Plugin({
        key: new PluginKey('pageMention'),
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
            const { selection } = newState;
            const { $from } = selection;
            
            // Get text from the start of the current node to the cursor
            const textBefore = $from.parent.textBetween(
              Math.max(0, $from.parentOffset - 50),
              $from.parentOffset,
              ' ',
              0
            );
            
            // Check for @ mention
            const lastAt = textBefore.lastIndexOf('@');
            
            if (lastAt === -1) {
              return { active: false, range: null, query: null, items: [], selectedIndex: 0 };
            }

            // Get the text after @
            const afterAt = textBefore.substring(lastAt + 1);
            // Check if there's a space or newline (which would end the mention)
            const spaceIndex = afterAt.search(/[\s\n]/);
            const query = spaceIndex === -1 ? afterAt : afterAt.substring(0, spaceIndex);
            
            if (query.length === 0) {
              return { active: false, range: null, query: null, items: [], selectedIndex: 0 };
            }

            const pages = getAvailablePages();
            const items = pages
              .filter(page => page.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 10)
              .map(page => ({
                id: page,
                label: page,
                route: PAGE_MAP[page] || null,
              }));

            // Calculate the start position of the @ mention
            const startPos = $from.pos - query.length - 1;
            
            return {
              active: items.length > 0,
              range: { from: startPos, to: $from.pos },
              query,
              items,
              selectedIndex: 0,
            };
          },
        },
        props: {
          handleKeyDown(view, event) {
            const plugin = this;
            const pluginState = plugin.getState(view.state);
            if (!pluginState.active) return false;

            if (event.key === 'ArrowDown') {
              event.preventDefault();
              const newIndex = (pluginState.selectedIndex + 1) % pluginState.items.length;
              plugin.setMeta('pageMention', {
                ...pluginState,
                selectedIndex: newIndex,
              });
              return true;
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault();
              const newIndex = (pluginState.selectedIndex + pluginState.items.length - 1) % pluginState.items.length;
              plugin.setMeta('pageMention', {
                ...pluginState,
                selectedIndex: newIndex,
              });
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
                
                // Close suggestions
                this.setMeta('pageMention', {
                  active: false,
                  range: null,
                  query: null,
                  items: [],
                  selectedIndex: 0,
                });
              }
              return true;
            }

            if (event.key === 'Escape') {
              event.preventDefault();
              plugin.setMeta('pageMention', {
                active: false,
                range: null,
                query: null,
                items: [],
                selectedIndex: 0,
              });
              return true;
            }

            return false;
          },
        },
        view(editorView) {
          const plugin = this;
          let component = null;
          let container = null;

          const update = () => {
            const pluginState = plugin.getState(editorView.state);
            
            if (!pluginState.active) {
              if (component) {
                ReactRenderer.destroy(component);
                component = null;
              }
              if (container) {
                container.remove();
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
              
              const linkMark = editorView.state.schema.marks.link;
              if (linkMark) {
                editorView.dispatch(
                  editorView.state.tr
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
                editorView.dispatch(
                  editorView.state.tr
                    .delete(range.from, range.to)
                    .insertText(`@${label} `, range.from)
                );
              }
              
              // Close suggestions
              plugin.setMeta('pageMention', {
                active: false,
                range: null,
                query: null,
                items: [],
                selectedIndex: 0,
              });
            };

            if (!component) {
              component = new ReactRenderer(MentionList, {
                props: {
                  items: pluginState.items,
                  selectedIndex: pluginState.selectedIndex,
                  command,
                },
                editor: editorView,
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
            const coords = editorView.coordsAtPos(from);
            container.style.top = `${coords.bottom + window.scrollY + 5}px`;
            container.style.left = `${coords.left + window.scrollX}px`;
          };

          return {
            update,
            destroy() {
              if (component) {
                ReactRenderer.destroy(component);
              }
              if (container) {
                container.remove();
              }
            },
          };
        },
      }),
    ];
  },
});
