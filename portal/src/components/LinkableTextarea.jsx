import React, { useState, useRef, useEffect } from 'react';
import { parseMentions, getAvailablePages } from '../utils/pageMentions';
import { getProtectedUrl } from '../utils/protectedUrls';
import { colors, font } from '../config/colors';

/**
 * LinkableTextarea - A textarea component that supports @ mentions to pages
 * 
 * @param {string} value - The text value
 * @param {function} onChange - Callback when text changes
 * @param {function} onNavigate - Callback when a @ mention link is clicked (receives page route)
 * @param {boolean} showPreview - If true, shows clickable links in a preview below the textarea
 * @param {object} textareaProps - Additional props to pass to the textarea element
 */
export default function LinkableTextarea({ 
  value = '', 
  onChange, 
  onNavigate,
  showPreview = true,
  ...textareaProps 
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(null);
  const textareaRef = useRef(null);
  const availablePages = getAvailablePages();

  // Parse mentions for preview
  const mentionParts = parseMentions(value);

  // Handle textarea input
  const handleInput = (e) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // Check if we're typing a mention
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    
    if (lastAt !== -1) {
      // Check if there's a space or newline after @ (which would end the mention)
      const afterAt = textBeforeCursor.substring(lastAt + 1);
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        // We're in a mention
        setMentionStart(lastAt);
        setShowSuggestions(true);
        setSuggestionIndex(0);
      } else {
        setShowSuggestions(false);
        setMentionStart(null);
      }
    } else {
      setShowSuggestions(false);
      setMentionStart(null);
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  // Filter suggestions based on what's typed after @
  const getFilteredSuggestions = () => {
    if (mentionStart === null) return [];
    
    const textBeforeCursor = value.substring(0, textareaRef.current?.selectionStart || 0);
    const afterAt = textBeforeCursor.substring(mentionStart + 1);
    
    if (!afterAt) return availablePages;
    
    return availablePages.filter(page => 
      page.toLowerCase().startsWith(afterAt.toLowerCase())
    );
  };

  const filteredSuggestions = getFilteredSuggestions();

  // Insert suggestion
  const insertSuggestion = (pageName) => {
    if (!textareaRef.current || mentionStart === null) return;
    
    const text = value;
    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = text.substring(0, mentionStart);
    const textAfterMention = text.substring(cursorPos);
    
    const newText = textBeforeCursor + '@' + pageName + ' ' + textAfterMention;
    const newCursorPos = mentionStart + pageName.length + 2; // +2 for @ and space
    
    if (onChange && textareaRef.current) {
      // Create a synthetic event that matches the structure of a real input event
      const syntheticEvent = {
        target: {
          ...textareaRef.current,
          value: newText
        },
        currentTarget: textareaRef.current
      };
      onChange(syntheticEvent);
    }
    
    setShowSuggestions(false);
    setMentionStart(null);
    
    // Set cursor position after a brief delay
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (textareaProps.onKeyDown) {
        textareaProps.onKeyDown(e);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (filteredSuggestions[suggestionIndex]) {
        insertSuggestion(filteredSuggestions[suggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
      setMentionStart(null);
    } else {
      if (textareaProps.onKeyDown) {
        textareaProps.onKeyDown(e);
      }
    }
  };

  // Handle click on mention link in preview
  const handleMentionClick = (e, pageRoute) => {
    // Still call onNavigate for backwards compatibility if provided
    if (onNavigate && pageRoute) {
      onNavigate(pageRoute);
    }
    // The link will navigate naturally via href, so we don't preventDefault
  };

  // Get textarea position for suggestions dropdown
  const getSuggestionsPosition = () => {
    if (!textareaRef.current || mentionStart === null) return { top: 0, left: 0 };
    
    // Create a temporary span to measure text position
    const text = value.substring(0, mentionStart);
    const measureSpan = document.createElement('span');
    measureSpan.style.visibility = 'hidden';
    measureSpan.style.position = 'absolute';
    measureSpan.style.whiteSpace = 'pre-wrap';
    measureSpan.style.font = window.getComputedStyle(textareaRef.current).font;
    measureSpan.textContent = text;
    document.body.appendChild(measureSpan);
    
    const rect = textareaRef.current.getBoundingClientRect();
    const spanRect = measureSpan.getBoundingClientRect();
    const lineHeight = parseFloat(window.getComputedStyle(textareaRef.current).lineHeight);
    
    document.body.removeChild(measureSpan);
    
    return {
      top: rect.top + (Math.floor(text.split('\n').length - 1) * lineHeight) + lineHeight + 5,
      left: rect.left + spanRect.width + 10
    };
  };

  const suggestionsPos = showSuggestions ? getSuggestionsPosition() : { top: 0, left: 0 };

  return (
    <div className="relative">
      <textarea
        {...textareaProps}
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          // Delay hiding suggestions to allow clicking on them
          setTimeout(() => {
            if (!document.activeElement?.closest('.mention-suggestions')) {
              setShowSuggestions(false);
            }
          }, 200);
          if (textareaProps.onBlur) {
            textareaProps.onBlur(e);
          }
        }}
        onFocus={(e) => {
          if (textareaProps.onFocus) {
            textareaProps.onFocus(e);
          }
        }}
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          className="mention-suggestions absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
          style={{
            top: `${suggestionsPos.top}px`,
            left: `${suggestionsPos.left}px`,
            minWidth: '200px'
          }}
        >
          {filteredSuggestions.map((page, index) => (
            <div
              key={page}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                index === suggestionIndex ? 'bg-gray-100' : ''
              }`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent textarea blur
                insertSuggestion(page);
              }}
            >
              <span className="font-medium text-gray-900">@{page}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Preview with clickable links */}
      {showPreview && value && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Preview:</p>
          <div className="text-sm" style={{ color: colors.text.primary, fontFamily: font.primary }}>
            {mentionParts.map((part, index) => {
              if (part.isMention && part.pageRoute) {
                // Generate protected URL for this page route
                const protectedUrl = getProtectedUrl(part.pageRoute);
                return (
                  <span key={index}>
                    <a
                      href={protectedUrl}
                      onClick={(e) => handleMentionClick(e, part.pageRoute)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color: colors.primary.orange }}
                    >
                      {part.text}
                    </a>
                  </span>
                );
              } else if (part.isMention && !part.pageRoute) {
                // Invalid mention
                return (
                  <span key={index} className="text-gray-500" title="Page not found">
                    {part.text}
                  </span>
                );
              } else {
                return <span key={index}>{part.text}</span>;
              }
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            💡 Tip: Type @ followed by a page name (e.g., @Feedback) to create a link
          </p>
        </div>
      )}
    </div>
  );
}

